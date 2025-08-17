<?php

declare(strict_types=1);

namespace BestCasinoPortal\Services;

use BestCasinoPortal\DTOs\CasinoFilterDto;
use BestCasinoPortal\DTOs\ValidationException;
use BestCasinoPortal\Models\Casino;
use BestCasinoPortal\Repositories\CasinoRepository;
use BestCasinoPortal\Cache\CacheManager;
use Psr\Log\LoggerInterface;
use InvalidArgumentException;

/**
 * Casino Service - Core business logic for casino operations
 * Following Context7 best practices for service layer implementation
 * Pure PHP implementation without ORM dependencies
 */
final readonly class CasinoService
{
    public function __construct(
        private CasinoRepository $casinoRepository,
        private CacheManager $cache,
        private LoggerInterface $logger
    ) {}

    /**
     * Get paginated casino list with filters
     * Target: <150ms database query time
     */
    public function getCasinos(CasinoFilterDto $filters): array
    {
        $cacheKey = $this->generateCacheKey('casinos', $filters->toArray());
        
        return $this->cache->remember($cacheKey, 300, function () use ($filters) {
            $startTime = microtime(true);
            
            $casinos = $this->casinoRepository->findWithFilters($filters);
            
            $queryTime = (microtime(true) - $startTime) * 1000;
            
            if ($queryTime > 150) {
                $this->logger->warning('Casino query exceeded performance target', [
                    'query_time_ms' => $queryTime,
                    'target_ms' => 150,
                    'filters' => $filters->toArray()
                ]);
            }
            
            return $casinos;
        });
    }

    /**
     * Get single casino by ID
     */
    public function getCasino(int $casinoId): ?Casino
    {
        $cacheKey = $this->generateCacheKey('casino', ['id' => $casinoId]);
        
        return $this->cache->remember($cacheKey, 600, function () use ($casinoId) {
            return $this->casinoRepository->findById($casinoId);
        });
    }

    /**
     * Get related casinos based on similarity algorithm
     */
    public function getRelatedCasinos(Casino $casino, int $limit = 3): array
    {
        $cacheKey = $this->generateCacheKey('related', [
            'casino_id' => $casino->id,
            'limit' => $limit
        ]);
        
        return $this->cache->remember($cacheKey, 1800, function () use ($casino, $limit) {
            return $this->casinoRepository->findRelated($casino, $limit);
        });
    }

    /**
     * Compare multiple casinos with detailed analysis
     */
    public function compareCasinos(array $casinoIds): array
    {
        $casinos = $this->casinoRepository->findMultiple($casinoIds);
        
        if (count($casinos) !== count($casinoIds)) {
            throw new ValidationException(['casino_ids' => ['Some casinos not found']], 'Casino validation failed');
        }
        
        return [
            'casinos' => $casinos,
            'comparison_matrix' => $this->buildComparisonMatrix($casinos),
            'recommendations' => $this->generateRecommendations($casinos),
            'summary' => $this->generateComparisonSummary($casinos)
        ];
    }

    /**
     * Search casinos with advanced filtering and ranking
     */
    public function searchCasinos(string $query, CasinoFilterDto $filters): array
    {
        $cacheKey = $this->generateCacheKey('search', [
            'query' => $query,
            'filters' => $filters->toArray()
        ]);
        
        return $this->cache->remember($cacheKey, 180, function () use ($query, $filters) {
            return $this->casinoRepository->search($query, $filters);
        });
    }

    /**
     * Get casino performance metrics
     */
    public function getCasinoMetrics(int $casinoId): array
    {
        $casino = $this->getCasino($casinoId);
        
        if (!$casino) {
            throw new InvalidArgumentException('Casino not found');
        }
        
        return [
            'rating' => $casino->rating,
            'bonus_amount' => $casino->bonus_amount,
            'trust_score' => $casino->getTrustScore(),
            'performance_score' => $this->calculatePerformanceScore($casino),
            'display_info' => $casino->toArray(),
            'seo_info' => $this->generateSeoInfo($casino)
        ];
    }

    /**
     * Get featured casinos for homepage
     */
    public function getFeaturedCasinos(int $limit = 10): array
    {
        $cacheKey = $this->generateCacheKey('featured', ['limit' => $limit]);
        
        return $this->cache->remember($cacheKey, 900, function () use ($limit) {
            return $this->casinoRepository->getFeatured($limit);
        });
    }

    /**
     * Get casino statistics for analytics
     */
    public function getCasinoStatistics(): array
    {
        $cacheKey = $this->generateCacheKey('statistics', []);
        
        return $this->cache->remember($cacheKey, 1800, function () {
            return $this->casinoRepository->getStatistics();
        });
    }

    /**
     * Get top rated casinos
     */
    public function getTopRatedCasinos(int $limit = 10): array
    {
        $filters = new CasinoFilterDto(
            minRating: 4.0,
            sortBy: 'rating',
            sortDirection: 'desc',
            limit: $limit
        );
        
        return $this->getCasinos($filters);
    }

    /**
     * Get casinos with best bonuses
     */
    public function getBestBonusCasinos(int $limit = 10): array
    {
        $filters = new CasinoFilterDto(
            minBonus: 100,
            sortBy: 'bonus_amount',
            sortDirection: 'desc',
            limit: $limit
        );
        
        return $this->getCasinos($filters);
    }

    /**
     * Get new casinos (recently added)
     */
    public function getNewCasinos(int $limit = 10): array
    {
        $filters = new CasinoFilterDto(
            sortBy: 'created_at',
            sortDirection: 'desc',
            limit: $limit
        );
        
        return $this->getCasinos($filters);
    }

    /**
     * Generate casino SEO content
     */
    public function generateSeoContent(Casino $casino): array
    {
        $seoInfo = $this->generateSeoInfo($casino);
        
        return [
            'meta_title' => $seoInfo['title'],
            'meta_description' => $seoInfo['description'],
            'structured_data' => $this->generateStructuredData($casino),
            'breadcrumbs' => $this->generateBreadcrumbs($casino),
            'related_content' => $this->getRelatedCasinos($casino, 5)
        ];
    }

    /**
     * Generate SEO information for casino
     */
    private function generateSeoInfo(Casino $casino): array
    {
        return [
            'title' => $casino->name . ' Casino Review - Best Casino Portal',
            'description' => $casino->getMetaDescription(),
            'keywords' => implode(', ', [$casino->name, 'casino', 'review', 'bonus']),
            'og_title' => $casino->name . ' Casino - ' . $casino->getFormattedBonus(),
            'og_description' => $casino->description,
            'og_image' => $casino->logo_url,
            'canonical_url' => $casino->getUrlPath()
        ];
    }

    /**
     * Generate cache key for service operations
     */
    private function generateCacheKey(string $operation, array $params): string
    {
        return sprintf(
            'casino_service:%s:%s',
            $operation,
            md5(serialize($params))
        );
    }

    /**
     * Build comparison matrix for multiple casinos
     */
    private function buildComparisonMatrix(array $casinos): array
    {
        $matrix = [];
        $features = ['rating', 'bonus_amount'];
        
        foreach ($features as $feature) {
            $matrix[$feature] = array_map(fn($casino) => $casino->$feature, $casinos);
        }
        
        return $matrix;
    }

    /**
     * Generate recommendations based on casino comparison
     */
    private function generateRecommendations(array $casinos): array
    {
        $recommendations = [];
        
        // Find highest rated casino
        $highestRated = null;
        $highestRating = 0;
        foreach ($casinos as $casino) {
            if ($casino->rating > $highestRating) {
                $highestRating = $casino->rating;
                $highestRated = $casino;
            }
        }
        
        // Find best bonus casino
        $bestBonus = null;
        $highestBonus = 0;
        foreach ($casinos as $casino) {
            if ($casino->bonus_amount > $highestBonus) {
                $highestBonus = $casino->bonus_amount;
                $bestBonus = $casino;
            }
        }
        
        if ($highestRated) {
            $recommendations['highest_rated'] = [
                'casino' => $highestRated,
                'reason' => 'Best overall user rating'
            ];
        }
        
        if ($bestBonus) {
            $recommendations['best_bonus'] = [
                'casino' => $bestBonus,
                'reason' => 'Highest welcome bonus value'
            ];
        }
        
        return $recommendations;
    }

    /**
     * Generate comparison summary with insights
     */
    private function generateComparisonSummary(array $casinos): array
    {
        $ratings = array_map(fn($casino) => $casino->rating, $casinos);
        $bonuses = array_map(fn($casino) => $casino->bonus_amount, $casinos);
        
        return [
            'total_compared' => count($casinos),
            'average_rating' => round(array_sum($ratings) / count($ratings), 2),
            'rating_range' => [
                'min' => min($ratings),
                'max' => max($ratings)
            ],
            'bonus_range' => [
                'min' => min($bonuses),
                'max' => max($bonuses)
            ]
        ];
    }

    /**
     * Calculate performance score for a casino
     */
    private function calculatePerformanceScore(Casino $casino): float
    {
        $ratingScore = ($casino->rating / 5) * 40; // 40% weight
        $bonusScore = min(($casino->bonus_amount / 1000) * 30, 30); // 30% weight, max $1000
        $trustScore = ($casino->getTrustScore() / 100) * 30; // 30% weight
        
        return round($ratingScore + $bonusScore + $trustScore, 2);
    }

    /**
     * Generate structured data for SEO
     */
    private function generateStructuredData(Casino $casino): array
    {
        return [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => $casino->name,
            'url' => $casino->url,
            'description' => $casino->description,
            'aggregateRating' => [
                '@type' => 'AggregateRating',
                'ratingValue' => $casino->rating,
                'ratingCount' => 100, // Placeholder, would come from actual review count
                'bestRating' => 5
            ],
            'offers' => [
                '@type' => 'Offer',
                'name' => $casino->getFormattedBonus(),
                'category' => 'Casino Bonus'
            ]
        ];
    }

    /**
     * Generate breadcrumbs for casino page
     */
    private function generateBreadcrumbs(Casino $casino): array
    {
        return [
            [
                'name' => 'Home',
                'url' => '/'
            ],
            [
                'name' => 'Casinos',
                'url' => '/casinos'
            ],
            [
                'name' => $casino->name,
                'url' => $casino->getUrlPath()
            ]
        ];
    }
}
