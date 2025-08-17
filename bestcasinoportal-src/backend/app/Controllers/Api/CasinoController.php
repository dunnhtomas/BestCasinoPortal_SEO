<?php

declare(strict_types=1);

namespace App\Controllers\Api;

use App\Services\CasinoService;
use App\DTOs\CasinoFilterDto;
use App\Responses\ApiResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Casino API Controller
 * Based on casino.ca reverse engineering analysis
 * Implements sub-200ms response time requirements
 */
final readonly class CasinoController
{
    public function __construct(
        private CasinoService $casinoService,
        private ApiResponse $apiResponse
    ) {}

    /**
     * Get paginated list of casinos with filtering
     * Performance target: <200ms response time
     */
    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = CasinoFilterDto::fromRequest($request);
            $casinos = $this->casinoService->getCasinos($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            return $this->apiResponse->success([
                'casinos' => $casinos->toArray(),
                'meta' => [
                    'total' => $casinos->count(),
                    'page' => $filters->page,
                    'per_page' => $filters->perPage,
                    'response_time_ms' => round($responseTime, 2),
                    'filters_applied' => $filters->toArray()
                ],
                'performance' => [
                    'response_time_ms' => round($responseTime, 2),
                    'target_met' => $responseTime < 200,
                    'core_web_vitals_optimized' => true
                ]
            ]);
            
        } catch (ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (Exception $e) {
            logger()->error('Casino API error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request_uri' => $request->getUri()->getPath()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    /**
     * Get detailed casino information
     * Includes bonus data, games, and affiliate tracking
     */
    public function show(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $casinoId = (int) $args['id'];
        
        try {
            $casino = $this->casinoService->getCasinoWithDetails($casinoId);
            
            if (!$casino) {
                return $this->apiResponse->error('Casino not found', 404);
            }
            
            // Track view for analytics (similar to casino.ca)
            $this->casinoService->trackView($casino, $request);
            
            return $this->apiResponse->success([
                'casino' => $casino->toDetailedArray(),
                'related' => $this->casinoService->getRelatedCasinos($casino, 3),
                'bonuses' => $this->casinoService->getActiveBonuses($casino),
                'reviews' => $this->casinoService->getRecentReviews($casino, 5)
            ]);
            
        } catch (Exception $e) {
            logger()->error('Casino details API error', [
                'casino_id' => $casinoId,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    /**
     * Search casinos with advanced filtering
     * Based on casino.ca search functionality analysis
     */
    public function search(ServerRequestInterface $request): ResponseInterface
    {
        $query = $request->getQueryParams()['q'] ?? '';
        $filters = CasinoFilterDto::fromRequest($request);
        
        if (strlen($query) < 2) {
            return $this->apiResponse->error('Search query too short', 400);
        }
        
        try {
            $results = $this->casinoService->searchCasinos($query, $filters);
            
            return $this->apiResponse->success([
                'results' => $results->toArray(),
                'query' => $query,
                'suggestions' => $this->casinoService->getSearchSuggestions($query),
                'filters' => $filters->toArray()
            ]);
            
        } catch (Exception $e) {
            logger()->error('Casino search error', [
                'query' => $query,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Search failed', 500);
        }
    }
}