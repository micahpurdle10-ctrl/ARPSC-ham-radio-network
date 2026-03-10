const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { URL } = require('url');

const port = 8080;
const hostname = '0.0.0.0';

// Get local IP address
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return '127.0.0.1';
}

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain',
    '.bat': 'text/plain'
};

const CHAT_ROOMS = [
    'General',
    'Home',
    'Weather',
    'Meetings',
    'Check-In',
    'Frequencies',
    'Emergency',
    'Settings'
];

const sharedChatRooms = CHAT_ROOMS.reduce((acc, room) => {
    acc[room] = [];
    return acc;
}, {});

const MAX_CHAT_MESSAGES_PER_ROOM = 250;
const MAX_ACTIVITY_ITEMS = 300;
const sharedActivityLog = [];
const PRESENCE_TIMEOUT_MS = 90 * 1000;
const sharedPresence = new Map();
const OUTAGE_FEED_CACHE_TTL_MS = 45 * 1000;
const OUTAGE_COUNT_URL = 'https://www.consumersenergy.com/OutageMap/OutageMap/GetOutageCount';
const OUTAGE_UPDATE_TIME_URL = 'https://www.consumersenergy.com/OutageMap/OutageMap/getLastMapUpdateTime';
const OUTAGE_MACOMB_COUNTY_QUERY_URL = "https://www.consumersenergy.com/arcgispublic/rest/services/CEOutageMap/MapServer/3/query?where=UPPER(COUNTY_NAME)%20IN%20('MACOMB','MACOMB%20COUNTY')&outFields=COUNTY_NAME,CUSTOMER_COUNT,OUTAGE_COUNT,PCT_CUSTOMERS_OUT,CRITICAL_COUNT,PRIORITY_COUNT&returnGeometry=false&f=pjson";
let outageFeedCache = null;
let outageFeedFetchedAtMs = 0;
let outageFeedInFlight = null;

function sendJson(res, statusCode, payload) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
}

function sanitizeRoom(room) {
    if (CHAT_ROOMS.includes(room)) {
        return room;
    }
    return 'General';
}

function appendRoomMessage(room, user, message) {
    const normalizedRoom = sanitizeRoom(room);
    const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        user: String(user || 'Unknown').slice(0, 80),
        message: String(message || '').slice(0, 500),
        timestamp: new Date().toISOString()
    };

    if (!item.message.trim()) {
        return null;
    }

    sharedChatRooms[normalizedRoom].push(item);
    if (sharedChatRooms[normalizedRoom].length > MAX_CHAT_MESSAGES_PER_ROOM) {
        sharedChatRooms[normalizedRoom] = sharedChatRooms[normalizedRoom].slice(-MAX_CHAT_MESSAGES_PER_ROOM);
    }

    return { room: normalizedRoom, item };
}

function appendActivityEvent(fullName, callsign, role, action) {
    const safeAction = action === 'Logout' ? 'Logout' : 'Login';
    const item = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        timestamp: new Date().toISOString(),
        fullName: String(fullName || '').trim().slice(0, 120),
        callsign: String(callsign || 'None').trim().slice(0, 40) || 'None',
        role: String(role || 'User').trim().slice(0, 40) || 'User',
        action: safeAction
    };

    if (!item.fullName) {
        return null;
    }

    // Keep newest-first order so clients can display log directly.
    sharedActivityLog.unshift(item);
    if (sharedActivityLog.length > MAX_ACTIVITY_ITEMS) {
        sharedActivityLog.length = MAX_ACTIVITY_ITEMS;
    }

    return item;
}

function presenceKey(fullName, callsign) {
    return (String(fullName || '').trim().toLowerCase() + '|' + String(callsign || '').trim().toLowerCase());
}

function cleanupPresence() {
    const now = Date.now();
    for (const [key, item] of sharedPresence.entries()) {
        if ((now - item.lastSeenMs) > PRESENCE_TIMEOUT_MS) {
            sharedPresence.delete(key);
        }
    }
}

function getOnlineCount() {
    cleanupPresence();
    return sharedPresence.size;
}

function upsertPresence(fullName, callsign, role) {
    const safeFullName = String(fullName || '').trim().slice(0, 120);
    if (!safeFullName) {
        return null;
    }

    const safeCallsign = String(callsign || 'None').trim().slice(0, 40) || 'None';
    const safeRole = String(role || 'User').trim().slice(0, 40) || 'User';
    const key = presenceKey(safeFullName, safeCallsign);

    sharedPresence.set(key, {
        fullName: safeFullName,
        callsign: safeCallsign,
        role: safeRole,
        lastSeenMs: Date.now()
    });

    return {
        key,
        fullName: safeFullName,
        callsign: safeCallsign,
        role: safeRole
    };
}

function removePresence(fullName, callsign) {
    const key = presenceKey(fullName, callsign || 'None');
    return sharedPresence.delete(key);
}

function fetchJsonFromUrl(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, {
            headers: {
                'User-Agent': 'ARPSC-Server/1.0'
            },
            timeout: 12000
        }, (response) => {
            let body = '';
            response.on('data', (chunk) => {
                body += chunk;
            });
            response.on('end', () => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    return reject(new Error('Status ' + response.statusCode + ' for ' + url));
                }

                try {
                    return resolve(JSON.parse(body || '{}'));
                } catch (error) {
                    return reject(new Error('Invalid JSON response for ' + url));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy(new Error('Timeout for ' + url));
        });

        req.on('error', (error) => {
            reject(error);
        });
    });
}

function fetchLiveOutageSnapshot() {
    return Promise.all([
        fetchJsonFromUrl(OUTAGE_MACOMB_COUNTY_QUERY_URL),
        fetchJsonFromUrl(OUTAGE_COUNT_URL),
        fetchJsonFromUrl(OUTAGE_UPDATE_TIME_URL)
    ]).then(([countyData, countData, timeData]) => {
        const features = countyData && Array.isArray(countyData.features) ? countyData.features : [];
        const countyAttrs = features.length > 0 && features[0] && features[0].attributes
            ? features[0].attributes
            : null;

        const hasCountyCoverage = !!countyAttrs;
        const outageCount = hasCountyCoverage ? Number(countyAttrs.OUTAGE_COUNT || 0) : null;
        const countyCustomers = hasCountyCoverage ? Number(countyAttrs.CUSTOMER_COUNT || 0) : null;
        const countyPctOut = hasCountyCoverage ? Number(countyAttrs.PCT_CUSTOMERS_OUT || 0) : null;

        return {
            provider: 'Consumers Energy',
            county: 'Macomb County',
            countyCoverage: hasCountyCoverage,
            outageCount,
            incidentCount: hasCountyCoverage ? Number(countyAttrs.CRITICAL_COUNT || 0) : null,
            customerCount: countyCustomers,
            pctOut: countyPctOut,
            sourceUpdatedAt: String(timeData.UpdateTime || ''),
            fetchedAt: new Date().toISOString(),
            statewideOutageCount: Number(countData.OutageCount || 0),
            note: hasCountyCoverage
                ? 'Macomb County-only outage data.'
                : 'Macomb County is not present in this provider feed. Showing local Macomb map values only.'
        };
    });
}

function getLiveOutageData(forceRefresh) {
    const now = Date.now();
    const cacheIsFresh = outageFeedCache && ((now - outageFeedFetchedAtMs) < OUTAGE_FEED_CACHE_TTL_MS);
    if (!forceRefresh && cacheIsFresh) {
        return Promise.resolve(Object.assign({}, outageFeedCache, {
            stale: false,
            cached: true
        }));
    }

    if (outageFeedInFlight) {
        return outageFeedInFlight;
    }

    outageFeedInFlight = fetchLiveOutageSnapshot()
        .then((snapshot) => {
            outageFeedCache = snapshot;
            outageFeedFetchedAtMs = Date.now();
            return Object.assign({}, snapshot, {
                stale: false,
                cached: false
            });
        })
        .catch((error) => {
            if (outageFeedCache) {
                return Object.assign({}, outageFeedCache, {
                    stale: true,
                    cached: true,
                    error: error.message
                });
            }
            throw error;
        })
        .finally(() => {
            outageFeedInFlight = null;
        });

    return outageFeedInFlight;
}

const server = http.createServer((req, res) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    const pathname = decodeURIComponent(reqUrl.pathname || '/');

    if (pathname === '/api/chat' && req.method === 'GET') {
        const room = sanitizeRoom(reqUrl.searchParams.get('room') || 'General');
        return sendJson(res, 200, {
            room,
            messages: sharedChatRooms[room]
        });
    }

    if (pathname === '/api/chat' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1024 * 64) {
                req.destroy();
            }
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const result = appendRoomMessage(data.room, data.user, data.message);
                if (!result) {
                    return sendJson(res, 400, { error: 'Message cannot be empty' });
                }
                return sendJson(res, 201, {
                    ok: true,
                    room: result.room,
                    message: result.item
                });
            } catch (error) {
                return sendJson(res, 400, { error: 'Invalid JSON payload' });
            }
        });
        return;
    }

    if (pathname === '/api/chat/rooms' && req.method === 'GET') {
        return sendJson(res, 200, { rooms: CHAT_ROOMS });
    }

    if (pathname === '/api/activity' && req.method === 'GET') {
        return sendJson(res, 200, { entries: sharedActivityLog });
    }

    if (pathname === '/api/activity' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1024 * 32) {
                req.destroy();
            }
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const item = appendActivityEvent(data.fullName, data.callsign, data.role, data.action);
                if (!item) {
                    return sendJson(res, 400, { error: 'fullName is required' });
                }
                return sendJson(res, 201, {
                    ok: true,
                    entry: item
                });
            } catch (error) {
                return sendJson(res, 400, { error: 'Invalid JSON payload' });
            }
        });
        return;
    }

    if (pathname === '/api/presence' && req.method === 'GET') {
        cleanupPresence();
        const users = Array.from(sharedPresence.values()).map((item) => ({
            fullName: item.fullName,
            callsign: item.callsign,
            role: item.role
        }));

        return sendJson(res, 200, {
            online: users.length,
            users
        });
    }

    if ((pathname === '/api/presence' || pathname === '/api/presence/logout') && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
            if (body.length > 1024 * 16) {
                req.destroy();
            }
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body || '{}');
                const fullName = data.fullName;
                const callsign = data.callsign || 'None';
                const role = data.role || 'User';

                if (pathname === '/api/presence/logout') {
                    removePresence(fullName, callsign);
                    return sendJson(res, 200, {
                        ok: true,
                        online: getOnlineCount()
                    });
                }

                const item = upsertPresence(fullName, callsign, role);
                if (!item) {
                    return sendJson(res, 400, { error: 'fullName is required' });
                }

                return sendJson(res, 200, {
                    ok: true,
                    online: getOnlineCount(),
                    user: {
                        fullName: item.fullName,
                        callsign: item.callsign,
                        role: item.role
                    }
                });
            } catch (error) {
                return sendJson(res, 400, { error: 'Invalid JSON payload' });
            }
        });
        return;
    }

    if (pathname === '/api/outages/live' && req.method === 'GET') {
        const forceRefresh = reqUrl.searchParams.get('force') === '1';
        getLiveOutageData(forceRefresh)
            .then((payload) => {
                return sendJson(res, 200, Object.assign({ ok: true }, payload));
            })
            .catch(() => {
                return sendJson(res, 502, {
                    ok: false,
                    error: 'Live outage feed is temporarily unavailable'
                });
            });
        return;
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const absolutePath = path.normalize(path.join(__dirname, relativePath));

    if (!absolutePath.startsWith(__dirname)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden', 'utf-8');
        return;
    }

    const extname = String(path.extname(absolutePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(absolutePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(port, hostname, () => {
    const localIP = getLocalIP();
    console.log('============================================');
    console.log('   ARPSC Web Server Running');
    console.log('============================================');
    console.log('');
    console.log('Server is available at:');
    console.log('');
    console.log('  Local:   http://127.0.0.1:' + port);
    console.log('  Network: http://' + localIP + ':' + port);
    console.log('');
    console.log('Share the Network URL with other users');
    console.log('on your local network.');
    console.log('');
    console.log('Press Ctrl+C to stop the server.');
    console.log('============================================');
});
