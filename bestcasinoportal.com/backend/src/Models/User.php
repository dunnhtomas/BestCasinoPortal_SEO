<?php

declare(strict_types=1);

namespace BestCasinoPortal\Models;

use DateTime;

/**
 * User Model
 * Following Context7 Laravel best practices for Fat Models, Skinny Controllers
 */
final readonly class User
{
    public function __construct(
        public ?int $id = null,
        public string $email = '',
        public string $password_hash = '',
        public string $first_name = '',
        public string $last_name = '',
        public bool $is_verified = false,
        public bool $is_active = true,
        public ?DateTime $created_at = null,
        public ?DateTime $updated_at = null,
        public ?DateTime $last_login_at = null
    ) {}

    /**
     * Get user ID
     */
    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * Get user email
     */
    public function getEmail(): string
    {
        return $this->email;
    }

    /**
     * Get password hash
     */
    public function getPasswordHash(): string
    {
        return $this->password_hash;
    }

    /**
     * Check if user is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Get full name using Context7 single responsibility principle
     * Orchestrates name formatting based on verification status
     */
    public function getFullName(): string
    {
        return $this->isVerifiedUser() ? $this->getFullNameLong() : $this->getFullNameShort();
    }

    /**
     * Check if user is verified - single responsibility
     */
    public function isVerifiedUser(): bool
    {
        return $this->is_verified && $this->is_active;
    }

    /**
     * Get long format name for verified users
     */
    private function getFullNameLong(): string
    {
        return trim("{$this->first_name} {$this->last_name}");
    }

    /**
     * Get short format name for unverified users
     */
    private function getFullNameShort(): string
    {
        $firstInitial = !empty($this->first_name) ? $this->first_name[0] . '.' : '';
        return trim("{$firstInitial} {$this->last_name}");
    }

    /**
     * Check if user has been active recently
     * Business logic encapsulated in model following Context7 patterns
     */
    public function isRecentlyActive(): bool
    {
        if (!$this->last_login_at) {
            return false;
        }

        $threshold = new DateTime('-30 days');
        return $this->last_login_at > $threshold;
    }

    /**
     * Create user from validated data
     * Following Context7 mass assignment best practices
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            email: $data['email'] ?? '',
            password_hash: $data['password_hash'] ?? '',
            first_name: $data['first_name'] ?? '',
            last_name: $data['last_name'] ?? '',
            is_verified: $data['is_verified'] ?? false,
            is_active: $data['is_active'] ?? true,
            created_at: isset($data['created_at']) ? new DateTime($data['created_at']) : null,
            updated_at: isset($data['updated_at']) ? new DateTime($data['updated_at']) : null,
            last_login_at: isset($data['last_login_at']) ? new DateTime($data['last_login_at']) : null
        );
    }

    /**
     * Convert to array for API responses
     * Excludes sensitive data like password_hash
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->getFullName(),
            'is_verified' => $this->is_verified,
            'is_active' => $this->is_active,
            'is_recently_active' => $this->isRecentlyActive(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s')
        ];
    }
}