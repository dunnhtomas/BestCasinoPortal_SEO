#!/usr/bin/env node

/**
 * DataForSEO Analysis Runner for Casino.ca Reverse Engineering
 * This script executes comprehensive SEO analysis using DataForSEO APIs
 */

import { createAnalyzer } from './casino-ca-seo-analyzer';
import { promises as fs } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🎰 Starting Casino.ca SEO Reverse Engineering with DataForSEO...');
  console.log('================================================');
  
  // Check for API credentials
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  
  if (!login || !password) {
    console.error('❌ DataForSEO credentials not found!');
    console.log('Please set the following environment variables:');
    console.log('- DATAFORSEO_LOGIN');
    console.log('- DATAFORSEO_PASSWORD');
    console.log('');
    console.log('You can get these credentials from: https://dataforseo.com/');
    process.exit(1);
  }

  try {
    // Initialize analyzer
    const analyzer = createAnalyzer();
    
    // Run comprehensive analysis
    console.log('🔍 Executing comprehensive SEO analysis...');
    const results = await analyzer.runCompleteAnalysis();
    
    // Generate summary
    const summary = {
      analysisComplete: true,
      timestamp: new Date().toISOString(),
      target: 'casino.ca',
      dataCollected: {
        domainAuthority: !!results.backlinks,
        keywordStrategy: !!results.keywords,
        competitorAnalysis: !!results.competitors,
        technicalSEO: !!results.technicalSEO,
        contentGaps: !!results.contentAnalysis,
        serpFeatures: !!results.serpFeatures
      },
      filesGenerated: [
        'casino-ca-domain-authority.json',
        'keyword-analysis.json',
        'competitor-analysis.json',
        'technical-seo-audit.json',
        'content-gap-analysis.json',
        'serp-features-analysis.json',
        'comprehensive-seo-report.md'
      ],
      nextSteps: [
        'Review comprehensive SEO report',
        'Analyze competitor strategies',
        'Identify content opportunities',
        'Plan technical SEO improvements',
        'Create PRD based on findings'
      ]
    };
    
    await fs.writeFile(
      './reverse-engineering/dataforseo-results/analysis-complete.json',
      JSON.stringify(summary, null, 2)
    );
    
    console.log('');
    console.log('✅ Casino.ca SEO Analysis Complete!');
    console.log('📊 Results saved to: ./reverse-engineering/dataforseo-results/');
    console.log('📝 Comprehensive report: comprehensive-seo-report.md');
    console.log('');
    console.log('🎯 Key Insights Discovered:');
    console.log('- Domain authority and backlink profile');
    console.log('- Keyword strategy and search volumes');
    console.log('- Competitive landscape analysis');
    console.log('- Technical SEO implementation');
    console.log('- Content gaps and opportunities');
    console.log('- SERP features and rich snippets');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n⚡ Analysis interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚡ Analysis terminated');
  process.exit(0);
});

// Run the analysis
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
