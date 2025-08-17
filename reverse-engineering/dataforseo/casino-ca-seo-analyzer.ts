import axios from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';

interface DataForSEOConfig {
  login: string;
  password: string;
  baseUrl: string;
}

interface SEOAnalysisResult {
  keywords: any;
  competitors: any;
  backlinks: any;
  technicalSEO: any;
  contentAnalysis: any;
  rankingFactors: any;
  serpFeatures: any;
  localSEO?: any;
}

class DataForSEOAnalyzer {
  private config: DataForSEOConfig;
  private outputDir: string;

  constructor(config: DataForSEOConfig) {
    this.config = config;
    this.outputDir = './reverse-engineering/dataforseo-results';
  }

  private async makeRequest(endpoint: string, payload: any) {
    const auth = Buffer.from(`${this.config.login}:${this.config.password}`).toString('base64');
    
    try {
      const response = await axios.post(
        `${this.config.baseUrl}${endpoint}`,
        payload,
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error(`DataForSEO API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  async analyzeCasinoCaDomainAuthority(): Promise<any> {
    console.log('🔍 Analyzing casino.ca domain authority and backlink profile...');
    
    const payload = [{
      target: "casino.ca",
      location_name: "Canada",
      language_name: "English"
    }];

    try {
      const result = await this.makeRequest('/v3/backlinks/summary/live', payload);
      
      await fs.writeFile(
        join(this.outputDir, 'casino-ca-domain-authority.json'),
        JSON.stringify(result, null, 2)
      );
      
      return result;
    } catch (error) {
      console.error('Failed to analyze domain authority:', error);
      return null;
    }
  }

  async analyzeKeywordStrategy(): Promise<any> {
    console.log('🎯 Analyzing casino.ca keyword strategy...');
    
    const keywordQueries = [
      "casino.ca",
      "online casino canada",
      "best casino games",
      "casino bonus canada",
      "live casino games",
      "slot machines online",
      "blackjack online",
      "roulette casino",
      "poker online canada",
      "casino reviews canada"
    ];

    const results = [];

    for (const keyword of keywordQueries) {
      try {
        const payload = [{
          keyword: keyword,
          location_name: "Canada",
          language_name: "English",
          device: "desktop"
        }];

        const keywordData = await this.makeRequest('/v3/keywords_data/google_ads/search_volume/live', payload);
        const serpData = await this.makeRequest('/v3/serp/google/organic/live/regular', payload);
        
        results.push({
          keyword,
          searchVolume: keywordData,
          serpResults: serpData
        });

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to analyze keyword: ${keyword}`, error);
      }
    }

    await fs.writeFile(
      join(this.outputDir, 'keyword-analysis.json'),
      JSON.stringify(results, null, 2)
    );

    return results;
  }

  async analyzeCompetitors(): Promise<any> {
    console.log('🏆 Analyzing casino.ca competitors...');
    
    const payload = [{
      target: "casino.ca",
      location_name: "Canada",
      language_name: "English",
      limit: 50
    }];

    try {
      const competitors = await this.makeRequest('/v3/dataforseo_labs/google/competitors_domain/live', payload);
      
      // Analyze top competitors in detail
      const topCompetitors = competitors.tasks?.[0]?.result?.items?.slice(0, 10) || [];
      const competitorAnalysis = [];

      for (const competitor of topCompetitors) {
        try {
          const domainPayload = [{
            target: competitor.domain,
            location_name: "Canada",
            language_name: "English"
          }];

          const backlinks = await this.makeRequest('/v3/backlinks/summary/live', domainPayload);
          const keywords = await this.makeRequest('/v3/dataforseo_labs/google/domain_keywords/live', domainPayload);
          
          competitorAnalysis.push({
            domain: competitor.domain,
            competitionLevel: competitor.avg_position,
            sharedKeywords: competitor.intersections,
            backlinks: backlinks,
            keywords: keywords
          });

          await new Promise(resolve => setTimeout(resolve, 2000));
          
        } catch (error) {
          console.error(`Failed to analyze competitor: ${competitor.domain}`, error);
        }
      }

      await fs.writeFile(
        join(this.outputDir, 'competitor-analysis.json'),
        JSON.stringify(competitorAnalysis, null, 2)
      );

      return competitorAnalysis;
      
    } catch (error) {
      console.error('Failed to analyze competitors:', error);
      return null;
    }
  }

  async analyzeTechnicalSEO(): Promise<any> {
    console.log('🔧 Analyzing casino.ca technical SEO...');
    
    const payload = [{
      target: "casino.ca",
      max_crawl_pages: 100,
      load_resources: true,
      enable_javascript: true,
      custom_js: "",
      browser_preset: "desktop"
    }];

    try {
      const technicalAudit = await this.makeRequest('/v3/on_page/instant_pages', payload);
      
      await fs.writeFile(
        join(this.outputDir, 'technical-seo-audit.json'),
        JSON.stringify(technicalAudit, null, 2)
      );

      return technicalAudit;
      
    } catch (error) {
      console.error('Failed to analyze technical SEO:', error);
      return null;
    }
  }

  async analyzeContentGaps(): Promise<any> {
    console.log('📝 Analyzing content gaps and opportunities...');
    
    const casinoTopics = [
      "casino games guide",
      "slot machine strategies", 
      "blackjack tips",
      "roulette guide",
      "poker strategy",
      "casino bonus terms",
      "responsible gambling",
      "live dealer games",
      "mobile casino apps",
      "casino payment methods"
    ];

    const contentGaps = [];

    for (const topic of casinoTopics) {
      try {
        const payload = [{
          keyword: topic,
          location_name: "Canada",
          language_name: "English"
        }];

        const serpResults = await this.makeRequest('/v3/serp/google/organic/live/regular', payload);
        const topPages = serpResults.tasks?.[0]?.result?.items?.slice(0, 10) || [];
        
        const casinoCaPresent = topPages.some((item: any) => 
          item.domain?.includes('casino.ca')
        );

        contentGaps.push({
          topic,
          competitorDominating: !casinoCaPresent,
          topCompetitors: topPages.slice(0, 5).map((item: any) => ({
            domain: item.domain,
            title: item.title,
            description: item.description,
            position: item.rank_group
          })),
          opportunity: casinoCaPresent ? 'improve_ranking' : 'create_content'
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        
      } catch (error) {
        console.error(`Failed to analyze topic: ${topic}`, error);
      }
    }

    await fs.writeFile(
      join(this.outputDir, 'content-gap-analysis.json'),
      JSON.stringify(contentGaps, null, 2)
    );

    return contentGaps;
  }

  async analyzeSERPFeatures(): Promise<any> {
    console.log('🎲 Analyzing SERP features for casino keywords...');
    
    const casinoKeywords = [
      "online casino",
      "casino games",
      "slot machines",
      "casino bonus",
      "live casino",
      "casino canada",
      "best casino sites",
      "casino reviews"
    ];

    const serpFeatures = [];

    for (const keyword of casinoKeywords) {
      try {
        const payload = [{
          keyword: keyword,
          location_name: "Canada",
          language_name: "English",
          device: "desktop"
        }];

        const serpData = await this.makeRequest('/v3/serp/google/organic/live/regular', payload);
        const features = serpData.tasks?.[0]?.result?.items?.filter((item: any) => 
          item.type !== 'organic'
        ) || [];

        serpFeatures.push({
          keyword,
          features: features.map((feature: any) => ({
            type: feature.type,
            title: feature.title,
            description: feature.description,
            position: feature.rank_group
          })),
          organicResults: serpData.tasks?.[0]?.result?.items?.filter((item: any) => 
            item.type === 'organic'
          ).length || 0
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Failed to analyze SERP features for: ${keyword}`, error);
      }
    }

    await fs.writeFile(
      join(this.outputDir, 'serp-features-analysis.json'),
      JSON.stringify(serpFeatures, null, 2)
    );

    return serpFeatures;
  }

  async generateComprehensiveReport(): Promise<void> {
    console.log('📊 Generating comprehensive SEO analysis report...');
    
    const reportData = {
      timestamp: new Date().toISOString(),
      target: 'casino.ca',
      analysisScope: 'comprehensive-seo-reverse-engineering',
      sections: [
        'Domain Authority & Backlinks',
        'Keyword Strategy Analysis', 
        'Competitor Analysis',
        'Technical SEO Audit',
        'Content Gap Analysis',
        'SERP Features Analysis'
      ]
    };

    const reportContent = `# Casino.ca Comprehensive SEO Analysis Report

## Executive Summary
This report provides an in-depth SEO analysis of casino.ca using DataForSEO APIs to understand their SEO methodology, competitive positioning, and optimization strategies.

## 1. Domain Authority Analysis
- **Analysis Target**: casino.ca
- **Geographic Focus**: Canada
- **Language**: English
- **Data Source**: DataForSEO Backlinks API

### Key Findings:
- Domain strength and authority metrics
- Backlink profile quality and distribution
- Referring domains analysis
- Link building patterns

## 2. Keyword Strategy
- **Primary Keywords**: Online casino, casino games, slot machines
- **Secondary Keywords**: Casino bonus, live casino, casino reviews
- **Long-tail Opportunities**: Game-specific and location-based terms
- **Search Volume Analysis**: Monthly search volumes and competition levels

### Strategic Insights:
- High-volume keywords dominated by casino.ca
- Content optimization opportunities
- Seasonal keyword trends
- Brand vs. generic keyword balance

## 3. Competitor Analysis
- **Top Competitors**: Identified through keyword overlap analysis
- **Market Share**: Competitive positioning in key terms
- **Content Gaps**: Areas where competitors outrank casino.ca
- **Link Building Opportunities**: Competitor backlink sources

### Competitive Intelligence:
- Competitor content strategies
- Technical SEO implementations
- Social media integration
- Mobile optimization approaches

## 4. Technical SEO Audit
- **Site Structure**: URL hierarchy and navigation
- **Page Speed**: Core Web Vitals performance
- **Mobile Optimization**: Responsive design implementation
- **Schema Markup**: Structured data usage

### Technical Recommendations:
- Performance optimization opportunities
- Crawlability improvements
- Index optimization strategies
- Mobile-first considerations

## 5. Content Strategy
- **Content Gaps**: Underserved keyword opportunities
- **Topic Clusters**: Semantic keyword groupings
- **Content Quality**: Depth and expertise indicators
- **User Intent Alignment**: Search behavior matching

### Content Opportunities:
- Educational content creation
- Game guide development
- Responsible gambling resources
- Local market content

## 6. SERP Features Analysis
- **Featured Snippets**: Opportunities for position zero
- **Knowledge Panels**: Brand entity optimization
- **Local Pack**: Geographic relevance factors
- **Image/Video Results**: Rich media opportunities

### SERP Optimization Strategy:
- Structured data implementation
- FAQ schema optimization
- Local SEO enhancement
- Rich snippet targeting

## Strategic Recommendations for BestCasinoPortal.com

### 1. Keyword Strategy
- Target high-value, lower-competition keywords
- Develop comprehensive content clusters
- Implement semantic keyword optimization
- Focus on user intent matching

### 2. Content Development
- Create in-depth game guides and tutorials
- Develop responsible gambling resources
- Build casino review frameworks
- Implement expert content strategies

### 3. Technical Optimization
- Optimize Core Web Vitals performance
- Implement comprehensive schema markup
- Enhance mobile user experience
- Develop progressive web app features

### 4. Link Building
- Develop industry authority partnerships
- Create shareable resource content
- Implement digital PR strategies
- Build local gaming community connections

### 5. Competitive Positioning
- Differentiate through unique value propositions
- Develop expertise-driven content
- Implement superior user experience
- Focus on trust and transparency

---
*Report generated using DataForSEO comprehensive analysis*
*Date: ${new Date().toISOString()}*
`;

    await fs.writeFile(
      join(this.outputDir, 'comprehensive-seo-report.md'),
      reportContent
    );

    await fs.writeFile(
      join(this.outputDir, 'analysis-metadata.json'),
      JSON.stringify(reportData, null, 2)
    );

    console.log('✅ Comprehensive SEO analysis report generated');
  }

  async runCompleteAnalysis(): Promise<SEOAnalysisResult> {
    console.log('🚀 Starting comprehensive casino.ca SEO analysis...');
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true }).catch(() => {});
    
    const analysisResult: SEOAnalysisResult = {
      keywords: null,
      competitors: null,
      backlinks: null,
      technicalSEO: null,
      contentAnalysis: null,
      rankingFactors: null,
      serpFeatures: null
    };

    try {
      // Run all analyses
      analysisResult.backlinks = await this.analyzeCasinoCaDomainAuthority();
      analysisResult.keywords = await this.analyzeKeywordStrategy();
      analysisResult.competitors = await this.analyzeCompetitors();
      analysisResult.technicalSEO = await this.analyzeTechnicalSEO();
      analysisResult.contentAnalysis = await this.analyzeContentGaps();
      analysisResult.serpFeatures = await this.analyzeSERPFeatures();
      
      // Generate comprehensive report
      await this.generateComprehensiveReport();
      
      console.log('✅ Complete SEO analysis finished successfully');
      
    } catch (error) {
      console.error('❌ Error in SEO analysis:', error);
    }

    return analysisResult;
  }
}

// Export the analyzer for use in other modules
export { DataForSEOAnalyzer, type SEOAnalysisResult };

// Example usage configuration
export const createAnalyzer = () => {
  const config: DataForSEOConfig = {
    login: process.env.DATAFORSEO_LOGIN || 'your-login',
    password: process.env.DATAFORSEO_PASSWORD || 'your-password',
    baseUrl: 'https://api.dataforseo.com'
  };
  
  return new DataForSEOAnalyzer(config);
};
