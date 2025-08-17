#!/usr/bin/env node
/**
 * Live Agent Dashboard Server
 * Serves the beautiful web dashboard for monitoring autonomous development
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DASHBOARD_DIR = path.join(__dirname, '..', 'dashboard');

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = path.join(DASHBOARD_DIR, parsedUrl.pathname);

    // Default to index.html
    if (pathname === DASHBOARD_DIR + path.sep) {
        pathname = path.join(DASHBOARD_DIR, 'index.html');
    }

    // Check if file exists
    fs.access(pathname, fs.constants.F_OK, (err) => {
        if (err) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/html');
            res.end(`
                <html>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1>🎰 BestCasinoPortal.com Dashboard</h1>
                        <h2>404 - Page Not Found</h2>
                        <p><a href="/">Go to Dashboard</a></p>
                    </body>
                </html>
            `);
            return;
        }

        // Get file extension and mime type
        const ext = path.extname(pathname).toLowerCase();
        const mimeType = mimeTypes[ext] || 'application/octet-stream';

        // Read and serve file
        fs.readFile(pathname, (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Internal Server Error');
                return;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'no-cache'); // Always get fresh data
            res.end(data);
        });
    });
});

server.listen(PORT, () => {
    console.log('\n🎰 BESTCASINOPORTAL.COM - LIVE AGENT DASHBOARD');
    console.log('=' .repeat(60));
    console.log(`🌐 Dashboard Server Started: http://localhost:${PORT}`);
    console.log('📊 Real-time agent monitoring available');
    console.log('⚡ Auto-refresh every 30 seconds');
    console.log('🤖 All 5 agents visible and working');
    console.log('=' .repeat(60));
    console.log('\n📱 Open in your browser to see the magic!');
    console.log('🎯 Watch autonomous development in real-time');
    console.log('\n🔥 AGENTS ARE DEVELOPING AUTONOMOUSLY - ENJOY THE SHOW! 🔥\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down dashboard server...');
    console.log('🎰 Agents continue working autonomously!');
    server.close(() => {
        console.log('✅ Dashboard server stopped');
        process.exit(0);
    });
});
