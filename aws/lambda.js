const https = require('https');

// Static Tag IDs Mapping
const TAG_MAP = {
    'cosmetics': '358386886392',
    'biotechnology': '358399551183',
    'animal-health': '358386887359',
    'animal health': '358386887359'
};

const REVERSE_TAG_MAP = {
    '358386886392': 'Cosmetics',
    '358399551183': 'Biotechnology',
    '358386887359': 'Animal Health'
};

// Zero-dependency HTTPS request helper for HubSpot
function httpsRequest(options) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let responseBody = '';
            res.on('data', chunk => responseBody += chunk);
            res.on('end', () => {
                let decoded = null;
                try {
                    decoded = JSON.parse(responseBody);
                } catch (e) {
                    decoded = responseBody;
                }

                if (res.statusCode >= 400) {
                    const errMsg = (decoded && decoded.message) ? decoded.message : responseBody;
                    reject(new Error(`HubSpot API Error (HTTP ${res.statusCode}): ${errMsg}`));
                } else {
                    resolve(decoded);
                }
            });
        });

        req.on('error', (err) => {
            reject(new Error(`HTTPS Request failed: ${err.message}`));
        });

        req.end();
    });
}

// Memory Cache for Authors (persisted across Lambda container warm invocations)
let authorCache = null;

async function loadAuthorsCache(token) {
    if (!token) return {};
    const options = {
        hostname: 'api.hubapi.com',
        path: '/cms/v3/blogs/authors?limit=100',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await httpsRequest(options);
        const authors = response.results || [];
        const cache = {};
        authors.forEach(a => {
            cache[a.id] = {
                fullName: a.fullName,
                avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
            };
        });
        return cache;
    } catch (e) {
        console.error("Failed to load authors cache:", e.message);
        return {};
    }
}

exports.handler = async (event) => {
    // Enable CORS for API Gateway
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Type': 'application/json'
    };

    // Handle OPTIONS request (CORS Preflight)
    const method = event.httpMethod || (event.requestContext && event.requestContext.http && event.requestContext.http.method);
    if (method === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    const query = event.queryStringParameters || {};
    const industry = query.industry || '';
    const limit = parseInt(query.limit, 10) || 3;
    const after = query.after || '';

    // Load credentials from environment variables injected by CloudFormation parameters
    const hubspotToken = process.env.HUBSPOT_TOKEN;
    const blogId = process.env.HUBSPOT_BLOG_ID;

    if (!hubspotToken) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: 'HUBSPOT_TOKEN environment variable is not configured.' })
        };
    }

    try {
        // Load author cache if not initialized yet
        if (!authorCache) {
            authorCache = await loadAuthorsCache(hubspotToken);
        }

        let tagId = null;
        if (industry) {
            tagId = TAG_MAP[industry.toLowerCase()];
            if (!tagId) {
                return {
                    statusCode: 200,
                    headers,
                    body: JSON.stringify({
                        success: true,
                        data: { posts: [], total: 0, hasMore: false, after: '' }
                    })
                };
            }
        }

        let apiPath = '/cms/v3/blogs/posts?state=PUBLISHED&sort=-publishDate&limit=100';
        if (blogId && blogId !== 'YOUR_BLOG_ID_HERE') {
            apiPath += `&contentGroupId=${encodeURIComponent(blogId)}`;
        }
        if (tagId) {
            apiPath += `&tagId__eq=${encodeURIComponent(tagId)}`;
        }
        if (after) {
            apiPath += `&after=${encodeURIComponent(after)}`;
        }

        const options = {
            hostname: 'api.hubapi.com',
            path: apiPath,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${hubspotToken}`,
                'Content-Type': 'application/json'
            }
        };

        const response = await httpsRequest(options);
        const results = response.results || [];
        
        // Filter to only include AWS blogs (Blog 11-66) and the two corporate posts
        const awsBlogs = results.filter(post => {
            const name = post.name || '';
            return /Blog (11|22|33|44|55|66)/.test(name) || /Continuous eTMF|Validated AI for Regulatory/.test(name);
        });

        const formatted = awsBlogs.map(post => {
            let postTags = [];
            if (post.tagIds && Array.isArray(post.tagIds)) {
                postTags = post.tagIds.map(id => REVERSE_TAG_MAP[id] || id.toString()).filter(Boolean);
            }
            if (postTags.length === 0 && industry) {
                const normalName = industry.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                postTags = [normalName];
            }

            const author = authorCache[post.blogAuthorId] || {
                fullName: post.authorName || 'Cloudbyz Contributor',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
            };

            return {
                id: post.id,
                name: post.name || post.htmlTitle || 'Untitled Post',
                postBody: (post.postBody || '').replace(/<[^>]*>/g, ''),
                featuredImage: post.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
                publishDate: (post.publishDate && post.publishDate !== '1970-01-01T00:00:00Z') ? post.publishDate : (post.created || post.createdAt),
                blogAuthor: author,
                tags: postTags,
                tagIds: post.tagIds || []
            };
        });

        const total = formatted.length;
        let startIndex = 0;
        if (after) {
            const parsed = parseInt(after, 10);
            if (!isNaN(parsed)) {
                startIndex = parsed;
            }
        }

        const sliced = formatted.slice(startIndex, startIndex + limit);
        const nextIndex = startIndex + limit;
        const hasMore = nextIndex < total;
        const nextAfter = hasMore ? nextIndex.toString() : '';

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: { posts: sliced, total, hasMore, after: nextAfter }
            })
        };

    } catch (e) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ success: false, error: e.message })
        };
    }
};
