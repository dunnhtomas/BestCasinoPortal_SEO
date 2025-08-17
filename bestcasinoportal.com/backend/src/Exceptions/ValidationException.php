<?php

declare(strict_types=1);

namespace BestCasinoPortal\Exceptions;

use Exception;
use Throwable;

/**
 * Validation Exception - Handles validation errors with structured error details
 */
class ValidationException extends Exception
{
    private array $errors;

    public function __construct(
        array $errors,
        string $message = 'Validation failed',
        int $code = 422,
        ?Throwable $previous = null
    ) {
        $this->errors = $errors;
        parent::__construct($message, $code, $previous);
    }

    /**
     * Get validation errors
     */
    public function getErrors(): array
    {
        return $this->errors;
    }

    /**
     * Check if specific field has errors
     */
    public function hasError(string $field): bool
    {
        return isset($this->errors[$field]);
    }

    /**
     * Get errors for specific field
     */
    public function getFieldErrors(string $field): array
    {
        return $this->errors[$field] ?? [];
    }

    /**
     * Add error for field
     */
    public function addError(string $field, string $error): void
    {
        if (!isset($this->errors[$field])) {
            $this->errors[$field] = [];
        }
        $this->errors[$field][] = $error;
    }

    /**
     * Get all error messages as flat array
     */
    public function getAllMessages(): array
    {
        $messages = [];
        foreach ($this->errors as $field => $fieldErrors) {
            foreach ($fieldErrors as $error) {
                $messages[] = $error;
            }
        }
        return $messages;
    }

    /**
     * Convert to array format for API responses
     */
    public function toArray(): array
    {
        return [
            'message' => $this->getMessage(),
            'errors' => $this->errors,
            'code' => $this->getCode()
        ];
    }
}
