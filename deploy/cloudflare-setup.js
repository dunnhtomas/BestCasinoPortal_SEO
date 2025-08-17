#!/usr/bin/env node
/**
 * Cloudflare DNS Configuration for BestCasinoPortal.com
 * Automated DNS setup with performance optimization
 */

const axios = require('axios');

const CLOUDFLARE_TOKEN = 'KhoBPsapJwVnmeg8iqoi0BGqOqgty3V9g4TocDXS';
const ZONE_NAME = 'bestcasinoportal.com';
const SERVER_IP = '193.233.161.161';

const cloudflare = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function setupCloudflare() {
  try {
    console.log('☁️ Setting up Cloudflare for BestCasinoPortal.com...');

    // Get zone ID
    const zonesResponse = await cloudflare.get('/zones', {
      params: { name: ZONE_NAME }
    });
    
    const zone = zonesResponse.data.result[0];
    if (!zone) {
      console.error('❌ Zone not found. Please add the domain to Cloudflare first.');
      return;
    }
    
    const zoneId = zone.id;
    console.log(`✅ Zone ID: ${zoneId}`);

    // DNS Records to create
    const dnsRecords = [
      {
        type: 'A',
        name: '@',
        content: SERVER_IP,
        ttl: 1,
        proxied: true
      },
      {
        type: 'A', 
        name: 'www',
        content: SERVER_IP,
        ttl: 1,
        proxied: true
      },
      {
        type: 'CNAME',
        name: 'api',
        content: 'bestcasinoportal.com',
        ttl: 1,
        proxied: true
      }
    ];

    // Create DNS records
    for (const record of dnsRecords) {
      try {
        await cloudflare.post(`/zones/${zoneId}/dns_records`, record);
        console.log(`✅ Created ${record.type} record: ${record.name}`);
      } catch (error) {
        if (error.response?.data?.errors?.[0]?.code === 81057) {
          console.log(`ℹ️ ${record.type} record ${record.name} already exists`);
        } else {
          console.error(`❌ Failed to create ${record.type} record ${record.name}:, error.message`);
        }
      }
    }

    // Configure SSL/TLS settings
    console.log('🔐 Configuring SSL/TLS settings...');
    await cloudflare.patch(`/zones/${zoneId}/settings/ssl`, {
      value: 'full'
    });

    // Enable security features
    console.log('🛡️ Enabling security features...');
    const securitySettings = [
      { setting: 'always_use_https', value: 'on' },
      { setting: 'automatic_https_rewrites', value: 'on' },
      { setting: 'brotli', value: 'on' },
      { setting: 'minify', value: { css: 'on', html: 'on', js: 'on' } },
      { setting: 'security_level', value: 'medium' },
      { setting: 'browser_check', value: 'on' }
    ];

    for (const { setting, value } of securitySettings) {
      try {
        await cloudflare.patch(`/zones/${zoneId}/settings/${setting}`, { value });
        console.log(`✅ Enabled ${setting}`);
      } catch (error) {
        console.error(`⚠️ Could not configure ${setting}:, error.message`);
      }
    }

    // Create page rules for performance
    console.log('⚡ Creating performance page rules...');
    const pageRules = [
      {
        targets: [{ target: 'url', constraint: { operator: 'matches', value: 'bestcasinoportal.com/assets/*' }}],
        actions: [
          { id: 'cache_level', value: 'cache_everything' },
          { id: 'edge_cache_ttl', value: 31536000 }
        ],
        priority: 1,
        status: 'active'
      }
    ];

    for (const rule of pageRules) {
      try {
        await cloudflare.post(`/zones/${zoneId}/pagerules`, rule);
        console.log('✅ Created performance page rule');
      } catch (error) {
        console.error('⚠️ Could not create page rule:', error.message);
      }
    }

    console.log('✅ Cloudflare configuration complete!');
    console.log('🌐 DNS propagation may take up to 24 hours');
    console.log('🎰 BestCasinoPortal.com is now protected by Cloudflare!');

  } catch (error) {
    console.error('❌ Cloudflare setup error:', error.message);
  }
}

// Run setup
setupCloudflare();
