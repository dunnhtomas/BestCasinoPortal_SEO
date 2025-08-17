<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Services\AuthService;
use BestCasinoPortal\DTOs\LoginDto;
use BestCasinoPortal\DTOs\RegisterDto;
use BestCasinoPortal\Responses\ApiResponse;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Log\LoggerInterface;

/**
 * Authentication Controller
 * Following Context7 skinny controller pattern - delegates to services
 */
final readonly class AuthController
{
    public function __construct(
        private AuthService $authService,
        private ApiResponse $apiResponse,
        private LoggerInterface $logger
    ) {}

    /**
     * User login endpoint
     * Delegates business logic to AuthService following Context7 patterns
     */
    public function login(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $loginDto = LoginDto::fromRequest($request);
            $authResult = $this->authService->authenticate($loginDto);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            $this->logger->info('User login attempt', [
                'email' => $loginDto->email,
                'success' => $authResult->isSuccess(),
                'response_time_ms' => round($responseTime, 2)
            ]);
            
            if (!$authResult->isSuccess()) {
                return $this->apiResponse->error(
                    'Invalid credentials',
                    401,
                    ['message' => 'Email or password is incorrect']
                );
            }
            
            return $this->apiResponse->success([
                'user' => $authResult->getUser()->toArray(),
                'token' => $authResult->getToken(),
                'expires_at' => $authResult->getExpiresAt(),
                'meta' => [
                    'response_time_ms' => round($responseTime, 2)
                ]
            ]);
            
        } catch (\BestCasinoPortal\Exceptions\ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Login error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    /**
     * User registration endpoint
     * Uses Form Request pattern for validation following Context7
     */
    public function register(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $registerDto = RegisterDto::fromRequest($request);
            $authResult = $this->authService->register($registerDto);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            $this->logger->info('User registration', [
                'email' => $registerDto->email,
                'success' => $authResult->isSuccess(),
                'response_time_ms' => round($responseTime, 2)
            ]);
            
            if (!$authResult->isSuccess()) {
                return $this->apiResponse->error(
                    'Registration failed',
                    400,
                    ['message' => $authResult->getErrorMessage()]
                );
            }
            
            return $this->apiResponse->success([
                'user' => $authResult->getUser()->toArray(),
                'token' => $authResult->getToken(),
                'message' => 'Registration successful. Please verify your email.',
                'meta' => [
                    'response_time_ms' => round($responseTime, 2)
                ]
            ], 201);
            
        } catch (\BestCasinoPortal\Exceptions\ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (\Throwable $e) {
            $this->logger->error('Registration error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    /**
     * User logout endpoint
     */
    public function logout(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $token = $this->extractTokenFromRequest($request);
            $this->authService->logout($token);
            
            return $this->apiResponse->success([
                'message' => 'Successfully logged out'
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Logout error', [
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Logout failed', 500);
        }
    }

    /**
     * Get current user information
     */
    public function me(ServerRequestInterface $request): ResponseInterface
    {
        try {
            $token = $this->extractTokenFromRequest($request);
            $user = $this->authService->getUserFromToken($token);
            
            if (!$user) {
                return $this->apiResponse->error('Unauthorized', 401);
            }
            
            return $this->apiResponse->success([
                'user' => $user->toArray()
            ]);
            
        } catch (\Throwable $e) {
            $this->logger->error('Get user error', [
                'error' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Unauthorized', 401);
        }
    }

    /**
     * Extract JWT token from Authorization header
     */
    private function extractTokenFromRequest(ServerRequestInterface $request): string
    {
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new \InvalidArgumentException('Missing or invalid Authorization header');
        }
        
        return substr($authHeader, 7); // Remove 'Bearer ' prefix
    }
}