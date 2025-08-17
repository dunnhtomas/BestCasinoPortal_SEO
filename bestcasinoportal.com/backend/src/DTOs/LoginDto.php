<?php

declare(strict_types=1);

namespace BestCasinoPortal\DTOs;

/**
 * Login Data Transfer Object
 * 
 * Handles login request data validation and transfer
 */
final readonly class LoginDto
{
    public function __construct(
        public string $email,
        public string $password,
        public bool $rememberMe = false
    ) {
        $this->validate();
    }

    /**
     * Create from request data
     */
    public static function fromRequest(array $data): self
    {
        return new self(
            email: $data['email'] ?? '',
            password: $data['password'] ?? '',
            rememberMe: (bool) ($data['remember_me'] ?? false)
        );
    }

    /**
     * Validate login data
     * 
     * @throws ValidationException
     */
    private function validate(): void
    {
        $errors = [];

        // Email validation
        if (empty($this->email)) {
            $errors['email'][] = 'Email is required';
        } elseif (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors['email'][] = 'Email must be a valid email address';
        } elseif (strlen($this->email) > 255) {
            $errors['email'][] = 'Email must not exceed 255 characters';
        }

        // Password validation
        if (empty($this->password)) {
            $errors['password'][] = 'Password is required';
        } elseif (strlen($this->password) < 8) {
            $errors['password'][] = 'Password must be at least 8 characters';
        } elseif (strlen($this->password) > 255) {
            $errors['password'][] = 'Password must not exceed 255 characters';
        }

        if (!empty($errors)) {
            throw new \BestCasinoPortal\Exceptions\ValidationException($errors);
        }
    }

    /**
     * Convert to array
     */
    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'remember_me' => $this->rememberMe
            // Note: password is intentionally omitted for security
        ];
    }
}
