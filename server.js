const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');
const url = require('url');

const PORT = 3000;
const ENV_PATH = path.join(__dirname, '.env');

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

// Get a map of all tag IDs to tag names
async function getAllTagsMap(token) {
    const options = {
        hostname: 'api.hubapi.com',
        path: '/cms/v3/blogs/tags?limit=100',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
    try {
        const response = await httpsRequest(options);
        const tags = response.results || [];
        const map = {};
        for (const t of tags) {
            map[t.id] = t.name;
        }
        return map;
    } catch (e) {
        console.error("Error fetching tag list:", e.message);
        return {};
    }
}

// Get HubSpot Tag ID by name
async function getTagIdByName(token, name) {
    const map = await getAllTagsMap(token);
    for (const [id, tagName] of Object.entries(map)) {
        if (tagName.toLowerCase() === name.toLowerCase()) {
            return id;
        }
    }
    return null;
}

// Fetch posts directly from HubSpot
async function fetchPosts(tag = '', limit = 3, offset = 0) {
    if (!config.hubspot_token) {
        throw new Error("HUBSPOT_TOKEN is not configured in .env file.");
    }

    let tagId = null;
    if (tag) {
        tagId = await getTagIdByName(config.hubspot_token, tag);
        if (!tagId) {
            return { posts: [], total: 0, hasMore: false };
        }
    }

    let path = '/cms/v3/blogs/posts?state=PUBLISHED&sort=-publishDate&limit=100';
    if (config.blog_id && config.blog_id !== 'YOUR_BLOG_ID_HERE') {
        path += `&contentGroupId=${encodeURIComponent(config.blog_id)}`;
    }
    if (tagId) {
        path += `&tagId__eq=${encodeURIComponent(tagId)}`;
    }

    const options = {
        hostname: 'api.hubapi.com',
        path: path,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${config.hubspot_token}`,
            'Content-Type': 'application/json'
        }
    };

    const response = await httpsRequest(options);
    const results = response.results || [];
    
    // Fetch tag map to resolve tagIds to actual tag names
    const tagMap = await getAllTagsMap(config.hubspot_token);
    
    const formatted = results.map(post => {
        let postTags = [];
        if (post.tagIds && Array.isArray(post.tagIds)) {
            postTags = post.tagIds.map(id => tagMap[id]).filter(Boolean);
        }
        // Fallback to query tag if no tags are resolved
        if (postTags.length === 0 && tag) {
            postTags = [tag];
        }

        return {
            id: post.id,
            name: post.name || post.htmlTitle || 'Untitled Post',
            postBody: (post.postBody || '').replace(/<[^>]*>/g, ''), // Strip HTML tags
            featuredImage: post.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
            publishDate: post.publishDate || post.createdAt,
            blogAuthor: {
                fullName: post.authorName || 'Cloudbyz Contributor',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80'
            },
            tags: postTags
        };
    });

    const total = formatted.length;
    const sliced = formatted.slice(offset, offset + limit);
    const hasMore = (offset + limit) < total;

    return { posts: sliced, total, hasMore };
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
            const tag = query.tag || '';
            const limit = parseInt(query.limit) || 3;
            const offset = parseInt(query.offset) || 0;

            const data = await fetchPosts(tag, limit, offset);
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

server.listen(PORT, () => {
    console.log(`JavaScript API backend running on http://localhost:${PORT}`);
});
