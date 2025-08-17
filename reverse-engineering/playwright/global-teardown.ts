import { FullConfig } from '@playwright/test';
import { promises as fs } from 'fs';
import { join } from 'path';

async function globalTeardown(config: FullConfig) {
  console.log('📊 Finalizing Casino.ca Reverse Engineering Analysis...');
  
  const resultsDir = './reverse-engineering/results';
  
  // Update session metadata with completion time
  try {
    const metadataPath = join(resultsDir, 'session-metadata.json');
    const metadata = JSON.parse(await fs.readFile(metadataPath, 'utf-8'));
    
    metadata.endTime = new Date().toISOString();
    metadata.duration = new Date(metadata.endTime).getTime() - new Date(metadata.startTime).getTime();
    metadata.status = 'completed';
    
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    // Generate summary report
    const summaryReport = {
      analysisComplete: true,
      timestamp: new Date().toISOString(),
      filesGenerated: [
        'casino-ca-complete-analysis.json',
        'performance-metrics.json', 
        'security-analysis.json',
        'seo-analysis.json',
        'technology-stack.json',
        'content-analysis.json',
        'ux-analysis.json',
        'resource-analysis.json',
        'comprehensive-analysis-report.md'
      ],
      nextSteps: [
        'Review comprehensive analysis report',
        'Implement DataForSEO analysis',
        'Create PRD based on findings',
        'Configure CTO sub-agent for autonomous development'
      ]
    };
    
    await fs.writeFile(
      join(resultsDir, 'analysis-summary.json'),
      JSON.stringify(summaryReport, null, 2)
    );
    
    console.log('✅ Reverse engineering analysis completed successfully');
    console.log(`📁 Results saved to: ${resultsDir}`);
    
  } catch (error) {
    console.error('❌ Error in global teardown:', error);
  }
}

export default globalTeardown;
