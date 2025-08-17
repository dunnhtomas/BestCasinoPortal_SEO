<?php

declare(strict_types=1);

namespace BestCasinoPortal\Responses;

use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\StreamFactoryInterface;
use JsonException;

/**
 * API Response Handler - Professional JSON API responses
 * Implements PSR-7 response interface with enterprise patterns
 */
final readonly class ApiResponse
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory,
        private StreamFactoryInterface $streamFactory
    ) {}

    /**
     * Create success response
     */
    public function success(
        array $data = [],
        int $statusCode = 200,
        array $headers = []
    ): ResponseInterface {
        $responseData = [
            'success' => true,
            'data' => $data,
            'timestamp' => time(),
            'request_id' => $this->generateRequestId()
        ];

        return $this->createJsonResponse($responseData, $statusCode, $headers);
    }

    /**
     * Create error response
     */
    public function error(
        string $message,
        int $statusCode = 400,
        array $details = [],
        ?string $errorCode = null
    ): ResponseInterface {
        $responseData = [
            'success' => false,
            'error' => [
                'message' => $message,
                'code' => $errorCode ?? $this->getErrorCodeFromStatus($statusCode),
                'details' => $details
            ],
            'timestamp' => time(),
            'request_id' => $this->generateRequestId()
        ];

        return $this->createJsonResponse($responseData, $statusCode);
    }

    /**
     * Create validation error response
     */
    public function validationError(
        array $errors,
        string $message = 'Validation failed'
    ): ResponseInterface {
        return $this->error($message, 422, ['validation_errors' => $errors], 'VALIDATION_ERROR');
    }

    /**
     * Create not found response
     */
    public function notFound(string $message = 'Resource not found'): ResponseInterface
    {
        return $this->error($message, 404, [], 'NOT_FOUND');
    }

    /**
     * Create unauthorized response
     */
    public function unauthorized(string $message = 'Unauthorized'): ResponseInterface
    {
        return $this->error($message, 401, [], 'UNAUTHORIZED');
    }

    /**
     * Create forbidden response
     */
    public function forbidden(string $message = 'Forbidden'): ResponseInterface
    {
        return $this->error($message, 403, [], 'FORBIDDEN');
    }

    /**
     * Create server error response
     */
    public function serverError(
        string $message = 'Internal server error',
        array $details = []
    ): ResponseInterface {
        return $this->error($message, 500, $details, 'SERVER_ERROR');
    }

    /**
     * Create paginated response
     */
    public function paginated(
        array $data,
        int $total,
        int $page,
        int $perPage,
        ?string $nextUrl = null,
        ?string $prevUrl = null
    ): ResponseInterface {
        $responseData = [
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => (int) ceil($total / $perPage),
                'has_next' => $nextUrl !== null,
                'has_prev' => $prevUrl !== null,
                'next_url' => $nextUrl,
                'prev_url' => $prevUrl
            ]
        ];

        return $this->success($responseData);
    }

    /**
     * Create JSON response with proper headers
     */
    private function createJsonResponse(
        array $data,
        int $statusCode,
        array $headers = []
    ): ResponseInterface {
        try {
            $json = json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
        } catch (JsonException $e) {
            // Fallback for JSON encoding errors
            $json = json_encode([
                'success' => false,
                'error' => [
                    'message' => 'JSON encoding error',
                    'code' => 'JSON_ENCODING_ERROR'
                ]
            ]);
            $statusCode = 500;
        }

        $response = $this->responseFactory->createResponse($statusCode);
        $stream = $this->streamFactory->createStream($json);
        
        $response = $response->withBody($stream);
        $response = $response->withHeader('Content-Type', 'application/json; charset=utf-8');
        $response = $response->withHeader('Cache-Control', 'no-cache, must-revalidate');
        $response = $response->withHeader('X-Content-Type-Options', 'nosniff');
        $response = $response->withHeader('X-Frame-Options', 'DENY');
        $response = $response->withHeader('X-XSS-Protection', '1; mode=block');

        // Add custom headers
        foreach ($headers as $name => $value) {
            $response = $response->withHeader($name, $value);
        }

        return $response;
    }

    /**
     * Generate unique request ID for tracing
     */
    private function generateRequestId(): string
    {
        return sprintf(
            '%s-%s-%s',
            date('Ymd'),
            substr(uniqid(), -8),
            substr(md5(microtime()), 0, 8)
        );
    }

    /**
     * Get error code from HTTP status
     */
    private function getErrorCodeFromStatus(int $statusCode): string
    {
        return match ($statusCode) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'FORBIDDEN',
            404 => 'NOT_FOUND',
            422 => 'VALIDATION_ERROR',
            429 => 'RATE_LIMITED',
            500 => 'SERVER_ERROR',
            502 => 'BAD_GATEWAY',
            503 => 'SERVICE_UNAVAILABLE',
            default => 'UNKNOWN_ERROR'
        };
    }
}
