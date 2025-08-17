<?php

declare(strict_types=1);

namespace BestCasinoPortal\DTOs;

use Exception;
use Throwable;

/**
 * Validation Exception - Handles validation errors with structured error details
 * Located in DTOs namespace for data transfer operations
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

    /**
     * Create from validation array
     */
    public static function fromValidationErrors(array $errors, string $message = 'Validation failed'): self
    {
        return new self($errors, $message);
    }

    /**
     * Create for single field error
     */
    public static function forField(string $field, string $error): self
    {
        return new self([$field => [$error]], "Validation failed for field: {$field}");
    }

    /**
     * Create for required field
     */
    public static function required(string $field): self
    {
        return self::forField($field, "The {$field} field is required.");
    }

    /**
     * Create for invalid format
     */
    public static function invalidFormat(string $field, string $format): self
    {
        return self::forField($field, "The {$field} field must be a valid {$format}.");
    }
}
