<?php

declare(strict_types=1);

namespace BestCasinoPortal\DTOs;

/**
 * Registration Data Transfer Object
 * 
 * Handles user registration data validation and transfer
 */
final readonly class RegisterDto
{
    public function __construct(
        public string $email,
        public string $password,
        public string $passwordConfirmation,
        public string $firstName,
        public string $lastName,
        public bool $agreeToTerms = false,
        public bool $subscribeNewsletter = false
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
            passwordConfirmation: $data['password_confirmation'] ?? '',
            firstName: $data['first_name'] ?? '',
            lastName: $data['last_name'] ?? '',
            agreeToTerms: (bool) ($data['agree_to_terms'] ?? false),
            subscribeNewsletter: (bool) ($data['subscribe_newsletter'] ?? false)
        );
    }

    /**
     * Validate registration data
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
        } elseif (!preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/', $this->password)) {
            $errors['password'][] = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
        }

        // Password confirmation validation
        if (empty($this->passwordConfirmation)) {
            $errors['password_confirmation'][] = 'Password confirmation is required';
        } elseif ($this->password !== $this->passwordConfirmation) {
            $errors['password_confirmation'][] = 'Password confirmation does not match password';
        }

        // First name validation
        if (empty($this->firstName)) {
            $errors['first_name'][] = 'First name is required';
        } elseif (strlen($this->firstName) > 100) {
            $errors['first_name'][] = 'First name must not exceed 100 characters';
        } elseif (!preg_match('/^[a-zA-Z\s\'-]+$/', $this->firstName)) {
            $errors['first_name'][] = 'First name contains invalid characters';
        }

        // Last name validation
        if (empty($this->lastName)) {
            $errors['last_name'][] = 'Last name is required';
        } elseif (strlen($this->lastName) > 100) {
            $errors['last_name'][] = 'Last name must not exceed 100 characters';
        } elseif (!preg_match('/^[a-zA-Z\s\'-]+$/', $this->lastName)) {
            $errors['last_name'][] = 'Last name contains invalid characters';
        }

        // Terms agreement validation
        if (!$this->agreeToTerms) {
            $errors['agree_to_terms'][] = 'You must agree to the terms and conditions';
        }

        if (!empty($errors)) {
            throw new \BestCasinoPortal\Exceptions\ValidationException($errors);
        }
    }

    /**
     * Convert to array (excluding sensitive data)
     */
    public function toArray(): array
    {
        return [
            'email' => $this->email,
            'first_name' => $this->firstName,
            'last_name' => $this->lastName,
            'agree_to_terms' => $this->agreeToTerms,
            'subscribe_newsletter' => $this->subscribeNewsletter
            // Note: passwords are intentionally omitted for security
        ];
    }
}
