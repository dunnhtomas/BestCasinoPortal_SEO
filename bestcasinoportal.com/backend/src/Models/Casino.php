<?php

declare(strict_types=1);

namespace BestCasinoPortal\Models;

use DateTime;

/**
 * Casino Model - Core casino entity following Context7 best practices
 * Professional PHP 8.1+ implementation without Laravel dependencies
 */
final readonly class Casino
{
    public function __construct(
        public ?int $id = null,
        public string $name = '',
        public string $slug = '',
        public string $url = '',
        public string $description = '',
        public float $rating = 0.0,
        public int $bonus_amount = 0,
        public string $bonus_type = 'fixed',
        public bool $is_active = true,
        public bool $is_featured = false,
        public string $logo_url = '',
        public string $background_url = '',
        public int $established_year = 0,
        public string $owner_company = '',
        public string $support_email = '',
        public string $support_phone = '',
        public int $min_deposit = 0,
        public int $max_withdrawal = 0,
        public string $withdrawal_time = '',
        public int $welcome_bonus_percent = 0,
        public int $welcome_bonus_max = 0,
        public int $wagering_requirement = 0,
        public ?DateTime $created_at = null,
        public ?DateTime $updated_at = null,
        public ?DateTime $deleted_at = null
    ) {}

    /**
     * Get formatted bonus display
     * Business logic encapsulated in model following Context7 patterns
     */
    public function getFormattedBonus(): string
    {
        if ($this->bonus_type === 'percentage') {
            return $this->welcome_bonus_percent . '% up to $' . number_format($this->welcome_bonus_max);
        }
        
        return '$' . number_format($this->bonus_amount) . ' ' . $this->bonus_type;
    }

    /**
     * Check if casino is active and available
     */
    public function isActive(): bool
    {
        return $this->is_active && $this->deleted_at === null;
    }

    /**
     * Check if casino is featured
     */
    public function isFeatured(): bool
    {
        return $this->is_featured && $this->isActive();
    }

    /**
     * Get casino establishment age in years
     */
    public function getAgeInYears(): int
    {
        $currentYear = (int) date('Y');
        return $currentYear - $this->established_year;
    }

    /**
     * Check if casino is new (less than 2 years)
     */
    public function isNew(): bool
    {
        return $this->getAgeInYears() < 2;
    }

    /**
     * Check if casino is established (5+ years)
     */
    public function isEstablished(): bool
    {
        return $this->getAgeInYears() >= 5;
    }

    /**
     * Get trust score based on various factors
     */
    public function getTrustScore(): int
    {
        $score = 0;
        
        // Rating contribution (0-40 points)
        $score += (int) ($this->rating * 8);
        
        // Age contribution (0-20 points)
        if ($this->isEstablished()) {
            $score += 20;
        } elseif ($this->getAgeInYears() >= 2) {
            $score += 10;
        }
        
        // Active bonus (0-10 points)
        if ($this->bonus_amount > 0 || $this->welcome_bonus_max > 0) {
            $score += 10;
        }
        
        // Featured status (0-10 points)
        if ($this->is_featured) {
            $score += 10;
        }
        
        // Withdrawal limits (0-20 points)
        if ($this->max_withdrawal >= 10000) {
            $score += 20;
        } elseif ($this->max_withdrawal >= 5000) {
            $score += 10;
        }
        
        return min($score, 100); // Cap at 100
    }

    /**
     * Get SEO-friendly URL path
     */
    public function getUrlPath(): string
    {
        return '/casino/' . $this->slug;
    }

    /**
     * Get meta description for SEO
     */
    public function getMetaDescription(): string
    {
        return "Play at {$this->name} casino with {$this->getFormattedBonus()} welcome bonus. " .
               "Rating: {$this->rating}/5 stars. Licensed and secure gaming.";
    }

    /**
     * Get casino display priority (higher = more important)
     */
    public function getDisplayPriority(): int
    {
        $priority = 0;
        
        if ($this->is_featured) $priority += 100;
        $priority += (int) ($this->rating * 10);
        $priority += min($this->getAgeInYears(), 10);
        
        return $priority;
    }

    /**
     * Check if casino has good rating (4+ stars)
     */
    public function hasGoodRating(): bool
    {
        return $this->rating >= 4.0;
    }

    /**
     * Check if casino has excellent rating (4.5+ stars)
     */
    public function hasExcellentRating(): bool
    {
        return $this->rating >= 4.5;
    }

    /**
     * Get bonus value in USD for comparison
     */
    public function getBonusValue(): int
    {
        if ($this->bonus_type === 'percentage' && $this->welcome_bonus_max > 0) {
            return $this->welcome_bonus_max;
        }
        
        return $this->bonus_amount;
    }

    /**
     * Check if casino offers high roller bonuses
     */
    public function isHighRoller(): bool
    {
        return $this->getBonusValue() >= 5000 || $this->max_withdrawal >= 50000;
    }

    /**
     * Create from database row
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            name: $data['name'] ?? '',
            slug: $data['slug'] ?? '',
            url: $data['url'] ?? '',
            description: $data['description'] ?? '',
            rating: (float) ($data['rating'] ?? 0.0),
            bonus_amount: (int) ($data['bonus_amount'] ?? 0),
            bonus_type: $data['bonus_type'] ?? 'fixed',
            is_active: (bool) ($data['is_active'] ?? true),
            is_featured: (bool) ($data['is_featured'] ?? false),
            logo_url: $data['logo_url'] ?? '',
            background_url: $data['background_url'] ?? '',
            established_year: (int) ($data['established_year'] ?? 0),
            owner_company: $data['owner_company'] ?? '',
            support_email: $data['support_email'] ?? '',
            support_phone: $data['support_phone'] ?? '',
            min_deposit: (int) ($data['min_deposit'] ?? 0),
            max_withdrawal: (int) ($data['max_withdrawal'] ?? 0),
            withdrawal_time: $data['withdrawal_time'] ?? '',
            welcome_bonus_percent: (int) ($data['welcome_bonus_percent'] ?? 0),
            welcome_bonus_max: (int) ($data['welcome_bonus_max'] ?? 0),
            wagering_requirement: (int) ($data['wagering_requirement'] ?? 0),
            created_at: isset($data['created_at']) ? new DateTime($data['created_at']) : null,
            updated_at: isset($data['updated_at']) ? new DateTime($data['updated_at']) : null,
            deleted_at: isset($data['deleted_at']) ? new DateTime($data['deleted_at']) : null
        );
    }

    /**
     * Convert to array for API responses
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'url' => $this->url,
            'description' => $this->description,
            'rating' => $this->rating,
            'bonus_amount' => $this->bonus_amount,
            'bonus_type' => $this->bonus_type,
            'formatted_bonus' => $this->getFormattedBonus(),
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'is_new' => $this->isNew(),
            'is_established' => $this->isEstablished(),
            'trust_score' => $this->getTrustScore(),
            'display_priority' => $this->getDisplayPriority(),
            'has_good_rating' => $this->hasGoodRating(),
            'has_excellent_rating' => $this->hasExcellentRating(),
            'is_high_roller' => $this->isHighRoller(),
            'logo_url' => $this->logo_url,
            'background_url' => $this->background_url,
            'established_year' => $this->established_year,
            'age_in_years' => $this->getAgeInYears(),
            'owner_company' => $this->owner_company,
            'support_email' => $this->support_email,
            'support_phone' => $this->support_phone,
            'min_deposit' => $this->min_deposit,
            'max_withdrawal' => $this->max_withdrawal,
            'withdrawal_time' => $this->withdrawal_time,
            'welcome_bonus_percent' => $this->welcome_bonus_percent,
            'welcome_bonus_max' => $this->welcome_bonus_max,
            'wagering_requirement' => $this->wagering_requirement,
            'url_path' => $this->getUrlPath(),
            'meta_description' => $this->getMetaDescription(),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s')
        ];
    }

    /**
     * Convert to JSON for caching and API responses
     */
    public function toJson(): string
    {
        return json_encode($this->toArray(), JSON_THROW_ON_ERROR);
    }
}
