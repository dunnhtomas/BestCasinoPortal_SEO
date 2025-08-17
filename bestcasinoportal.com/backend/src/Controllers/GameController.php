<?php

declare(strict_types=1);

namespace BestCasinoPortal\Controllers;

use BestCasinoPortal\Services\GameService;
use BestCasinoPortal\DTOs\GameFilterDto;
use BestCasinoPortal\Responses\ApiResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

/**
 * Game Controller
 * Following Context7 patterns for casino game management
 */
final readonly class GameController
{
    public function __construct(
        private GameService $gameService,
        private ApiResponse $apiResponse,
        private LoggerInterface $logger
    ) {}

    /**
     * Get paginated list of games with filters
     */
    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = GameFilterDto::fromRequest($request);
            $gamesResult = $this->gameService->getGames($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            return $this->apiResponse->success([
                'games' => array_map(fn($game) => $game->toArray(), $gamesResult->getGames()),
                'pagination' => [
                    'total' => $gamesResult->getTotal(),
                    'per_page' => $gamesResult->getPerPage(),
                    'current_page' => $gamesResult->getCurrentPage(),
                    'total_pages' => $gamesResult->getTotalPages()
                ],
                'filters' => $filters->toArray(),
                'meta' => [
                    'response_time_ms' => round($responseTime, 2),
                    'total_games' => $gamesResult->getTotal()
                ]
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Games listing error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Failed to retrieve games', 500);
        }
    }

    /**
     * Get single game by ID or slug
     */
    public function show(ServerRequestInterface $request, array $args): ResponseInterface
    {
        try {
            $identifier = $args['id'] ?? $args['slug'] ?? '';
            $game = $this->gameService->getGame($identifier);
            
            if (!$game) {
                return $this->apiResponse->error('Game not found', 404);
            }
            
            // Get related games for recommendations
            $relatedGames = $this->gameService->getRelatedGames($game, 4);
            
            return $this->apiResponse->success([
                'game' => $game->toArray(),
                'related_games' => array_map(fn($g) => $g->toArray(), $relatedGames)
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Game details error', [
                'identifier' => $identifier ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Failed to retrieve game', 500);
        }
    }

    /**
     * Get featured games for homepage
     */
    public function featured(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $limit = (int) ($request->getQueryParams()['limit'] ?? 12);
            $featuredGames = $this->gameService->getFeaturedGames($limit);
            
            return $this->apiResponse->success([
                'featured_games' => array_map(fn($game) => $game->toArray(), $featuredGames),
                'count' => count($featuredGames)
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Featured games error', [
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Failed to retrieve featured games', 500);
        }
    }

    /**
     * Get games by provider
     */
    public function byProvider(ServerRequestInterface $request, array $args): ResponseInterface
    {
        try {
            $provider = $args['provider'] ?? '';
            $page = (int) ($request->getQueryParams()['page'] ?? 1);
            $perPage = (int) ($request->getQueryParams()['per_page'] ?? 20);
            
            $gamesResult = $this->gameService->getGamesByProvider($provider, $page, $perPage);
            
            if ($gamesResult->getTotal() === 0) {
                return $this->apiResponse->error('No games found for this provider', 404);
            }
            
            return $this->apiResponse->success([
                'provider' => $provider,
                'games' => array_map(fn($game) => $game->toArray(), $gamesResult->getGames()),
                'pagination' => [
                    'total' => $gamesResult->getTotal(),
                    'per_page' => $gamesResult->getPerPage(),
                    'current_page' => $gamesResult->getCurrentPage(),
                    'total_pages' => $gamesResult->getTotalPages()
                ]
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Games by provider error', [
                'provider' => $provider ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Failed to retrieve games', 500);
        }
    }

    /**
     * Search games by name or description
     */
    public function search(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $query = $request->getQueryParams()['q'] ?? '';
            
            if (strlen($query) < 2) {
                return $this->apiResponse->error('Search query must be at least 2 characters', 400);
            }
            
            $games = $this->gameService->searchGames($query);
            
            return $this->apiResponse->success([
                'query' => $query,
                'games' => array_map(fn($game) => $game->toArray(), $games),
                'count' => count($games)
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Game search error', [
                'query' => $query ?? '',
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Search failed', 500);
        }
    }
}