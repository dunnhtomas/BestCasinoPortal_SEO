#!/usr/bin/env node

/**
 * Casino Memory Keeper CLI
 * Enterprise-grade MCP Memory Keeper for BestCasinoPortal
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Determine the data directory
const DATA_DIR = process.env.CASINO_MEMORY_DATA_DIR || path.join(os.homedir(), 'casino-memory-keeper');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📁 Created data directory: ${DATA_DIR}`);
}

// Set environment variable for the server
process.env.CASINO_MEMORY_DATA_DIR = DATA_DIR;

// Get the path to the actual server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

// Check if the server is built
if (!fs.existsSync(serverPath)) {
  console.error('❌ Error: Server not built. Building now...');
  
  // Try to build automatically
  const buildProcess = spawn('npm', ['run', 'build'], {
    cwd: path.dirname(__dirname),
    stdio: 'inherit'
  });
  
  buildProcess.on('exit', (code) => {
    if (code !== 0) {
      console.error('❌ Build failed. Please run: npm run build');
      process.exit(1);
    }
    startServer();
  });
} else {
  startServer();
}

function startServer() {
  console.log(`🚀 Starting Casino Memory Keeper...`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  
  // Change to data directory (where context.db will be created)
  process.chdir(DATA_DIR);

  // Spawn the server
  const child = spawn(process.execPath, [serverPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: process.env,
  });

  // Handle exit
  child.on('exit', code => {
    process.exit(code);
  });

  // Handle errors
  child.on('error', err => {
    console.error('❌ Failed to start casino memory keeper server:', err);
    process.exit(1);
  });
}
