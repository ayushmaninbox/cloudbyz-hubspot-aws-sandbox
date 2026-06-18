const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = 3001;
const ENV_PATH = path.join(__dirname, '../.env');

// Parse .env manually to load credentials
const config = {
    hubspot_token: '',
    blog_id: ''
};

if (fs.existsSync(ENV_PATH)) {
    try {
        const fileContent = fs.readFileSync(ENV_PATH, 'utf8');
        fileContent.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                if (key === 'HUBSPOT_TOKEN') config.hubspot_token = val;
                if (key === 'HUBSPOT_BLOG_ID') config.blog_id = val;
            }
        });
    } catch (e) {
        console.error("Error reading .env file:", e.message);
    }
}

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

// 1. Static Tag IDs Mapping
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

// 6 & 7. Memory Cache for Authors
const authorCache = {};

async function loadAuthorsCache(token) {
    if (!token) return;
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
        authors.forEach(a => {
            authorCache[a.id] = {
                fullName: a.fullName,
                avatar: a.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
            };
        });
        console.log(`Loaded ${authors.length} authors into memory cache.`);
    } catch (e) {
        console.error("Failed to load authors cache:", e.message);
    }
}

// Fetch posts directly from HubSpot
async function fetchAwsBlogs(industry = '', limit = 3, after = '') {
    if (!config.hubspot_token) {
        throw new Error("HUBSPOT_TOKEN is not configured in .env file.");
    }

    let tagId = null;
    if (industry) {
        tagId = TAG_MAP[industry.toLowerCase()];
        if (!tagId) {
            return { posts: [], total: 0, hasMore: false };
        }
    }

    // 3 & 4. Enforce Content Group ID & Tag IDs query
    let apiPath = '/cms/v3/blogs/posts?state=PUBLISHED&sort=-publishDate&limit=100';
    if (config.blog_id && config.blog_id !== 'YOUR_BLOG_ID_HERE') {
        apiPath += `&contentGroupId=${encodeURIComponent(config.blog_id)}`;
    }
    if (tagId) {
        apiPath += `&tagId__eq=${encodeURIComponent(tagId)}`;
    }
    // 5. Cursor Pagination
    if (after) {
        apiPath += `&after=${encodeURIComponent(after)}`;
    }

    const options = {
        hostname: 'api.hubapi.com',
        path: apiPath,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.hubspot_token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = await httpsRequest(options);
    const results = response.results || [];
    
    // Filter to only include AWS blogs (Blog 11, 22, 33, 44, 55, 66) and the two corporate blogs
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

        // Author Cache resolving
        const author = authorCache[post.blogAuthorId] || {
            fullName: post.authorName || 'Cloudbyz Contributor',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
        };

        return {
            id: post.id,
            name: post.name || post.htmlTitle || 'Untitled Post',
            postBody: (post.postBody || '').replace(/<[^>]*>/g, ''), // Strip HTML tags
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

    return { posts: sliced, total, hasMore, after: nextAfter };
}

// Setup HTTP Server
const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    try {
        if (pathname === '/api/blogs' && req.method === 'GET') {
            const query = parsedUrl.query;
            const industry = query.industry || '';
            const limit = parseInt(query.limit) || 3;
            const after = query.after || '';

            const data = await fetchAwsBlogs(industry, limit, after);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, data }));
            return;
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Endpoint not found.' }));

    } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
    }
});

// Load Author Cache at Server startup
loadAuthorsCache(config.hubspot_token).then(() => {
    server.listen(PORT, () => {
        console.log(`AWS Lambda simulation API running on http://localhost:${PORT}`);
    });
});
