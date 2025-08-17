<?php

declare(strict_types=1);

namespace BestCasinoPortal\Controllers;

use BestCasinoPortal\Services\CasinoService;
use BestCasinoPortal\DTOs\CasinoFilterDto;
use BestCasinoPortal\Responses\ApiResponse;
use BestCasinoPortal\Exceptions\ValidationException;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;
use Exception;

/**
 * Casino API Controller - Superior to casino.ca implementation
 * Target: <200ms response time vs casino.ca's 287.9ms
 * Following Context7 dependency injection patterns
 */
final readonly class CasinoController
{
    public function __construct(
        private CasinoService $casinoService,
        private ApiResponse $apiResponse,
        private LoggerInterface $logger
    ) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = CasinoFilterDto::fromRequest($request);
            $casinos = $this->casinoService->getCasinos($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            // Target: <200ms (casino.ca: 287.9ms)
            if ($responseTime > 200) {
                $this->logger->warning('API response time exceeded target', [
                    'response_time_ms' => $responseTime,
                    'target_ms' => 200
                ]);
            }
            
            return $this->apiResponse->success([
                'casinos' => $casinos,
                'meta' => [
                    'total' => count($casinos),
                    'response_time_ms' => round($responseTime, 2),
                    'filters_applied' => $filters->toArray(),
                    'competitive_advantage' => $responseTime < 287.9 ? 'faster_than_casino_ca' : 'needs_optimization'
                ]
            ]);
            
        } catch (ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (Exception $e) {
            $this->logger->error('Casino API error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    public function show(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $casinoId = (int) $args['id'];
        
        try {
            $casino = $this->casinoService->getCasino($casinoId);
            
            if (!$casino) {
                return $this->apiResponse->error('Casino not found', 404);
            }
            
            return $this->apiResponse->success([
                'casino' => $casino,
                'related' => $this->casinoService->getRelatedCasinos($casino, 3),
                'competitive_features' => [
                    'real_time_bonuses' => true,
                    'user_reviews' => true,
                    'personalized_recommendations' => true,
                    'mobile_optimized' => true
                ]
            ]);
            
        } catch (Exception $e) {
            $this->logger->error('Casino details API error', [
                'casino_id' => $casinoId,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    public function compare(ServerRequestInterface $request): ResponseInterface
    {
        $casinoIds = $request->getParsedBody()['casino_ids'] ?? [];
        
        if (count($casinoIds) < 2 || count($casinoIds) > 5) {
            return $this->apiResponse->error('Compare requires 2-5 casinos', 400);
        }
        
        try {
            $comparison = $this->casinoService->compareCasinos($casinoIds);
            
            return $this->apiResponse->success([
                'comparison' => $comparison,
                'advantages_over_casino_ca' => [
                    'real_time_data' => 'Live bonus tracking vs static content',
                    'detailed_comparison' => 'Side-by-side feature comparison',
                    'user_ratings' => 'Real user reviews and ratings',
                    'mobile_experience' => 'Superior mobile interface'
                ]
            ]);
            
        } catch (Exception $e) {
            $this->logger->error('Casino comparison error', [
                'casino_ids' => $casinoIds,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Comparison failed', 500);
        }
    }
}
