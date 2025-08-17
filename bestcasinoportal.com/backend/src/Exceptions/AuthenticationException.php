<?php

declare(strict_types=1);

namespace BestCasinoPortal\Exceptions;

use Exception;
use Throwable;

/**
 * Authentication Exception
 * 
 * Thrown when authentication fails or access is denied
 */
class AuthenticationException extends Exception
{
    private ?array $context;

    public function __construct(
        string $message = 'Authentication failed',
        int $code = 401,
        ?Throwable $previous = null,
        ?array $context = null
    ) {
        $this->context = $context;
        parent::__construct($message, $code, $previous);
    }

    /**
     * Get additional context information
     */
    public function getContext(): ?array
    {
        return $this->context;
    }

    /**
     * Set context information
     */
    public function setContext(array $context): void
    {
        $this->context = $context;
    }

    /**
     * Convert to array format for API responses
     */
    public function toArray(): array
    {
        $result = [
            'message' => $this->getMessage(),
            'code' => $this->getCode()
        ];

        if ($this->context !== null) {
            $result['context'] = $this->context;
        }

        return $result;
    }

    /**
     * Create exception for invalid credentials
     */
    public static function invalidCredentials(): self
    {
        return new self('Invalid email or password', 401);
    }

    /**
     * Create exception for expired token
     */
    public static function tokenExpired(): self
    {
        return new self('Token has expired', 401);
    }

    /**
     * Create exception for invalid token
     */
    public static function invalidToken(): self
    {
        return new self('Invalid or malformed token', 401);
    }

    /**
     * Create exception for inactive account
     */
    public static function accountInactive(): self
    {
        return new self('Account is not active', 401);
    }

    /**
     * Create exception for unverified email
     */
    public static function emailNotVerified(): self
    {
        return new self('Email address is not verified', 401);
    }

    /**
     * Create exception for rate limiting
     */
    public static function rateLimited(): self
    {
        return new self('Too many authentication attempts. Please try again later.', 429);
    }
}
