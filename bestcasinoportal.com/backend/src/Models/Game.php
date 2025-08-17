<?php

declare(strict_types=1);

namespace BestCasinoPortal\Models;

use DateTime;

/**
 * Game Model for Casino Portal
 * Represents casino games with provider information and metadata
 */
final readonly class Game
{
    public function __construct(
        public ?int $id = null,
        public string $name = '',
        public string $slug = '',
        public string $provider = '',
        public string $category = '',
        public string $description = '',
        public float $rtp = 0.0, // Return to Player percentage
        public int $volatility = 1, // 1-5 scale
        public int $min_bet = 0, // In cents
        public int $max_bet = 0, // In cents
        public bool $is_active = true,
        public bool $is_featured = false,
        public string $thumbnail_url = '',
        public string $demo_url = '',
        public ?DateTime $created_at = null,
        public ?DateTime $updated_at = null
    ) {}

    /**
     * Check if game is high RTP (above 96%)
     * Business logic for casino recommendations
     */
    public function isHighRtp(): bool
    {
        return $this->rtp >= 96.0;
    }

    /**
     * Get volatility description
     */
    public function getVolatilityDescription(): string
    {
        return match ($this->volatility) {
            1 => 'Very Low',
            2 => 'Low',
            3 => 'Medium',
            4 => 'High',
            5 => 'Very High',
            default => 'Unknown'
        };
    }

    /**
     * Format bet range for display
     */
    public function getBetRange(): string
    {
        $minBet = $this->min_bet / 100; // Convert cents to dollars
        $maxBet = $this->max_bet / 100;
        
        return "$" . number_format($minBet, 2) . " - $" . number_format($maxBet, 2);
    }

    /**
     * Check if game is suitable for high rollers
     */
    public function isHighRollerGame(): bool
    {
        return $this->max_bet >= 50000; // $500+ max bet
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
            provider: $data['provider'] ?? '',
            category: $data['category'] ?? '',
            description: $data['description'] ?? '',
            rtp: (float) ($data['rtp'] ?? 0.0),
            volatility: (int) ($data['volatility'] ?? 1),
            min_bet: (int) ($data['min_bet'] ?? 0),
            max_bet: (int) ($data['max_bet'] ?? 0),
            is_active: (bool) ($data['is_active'] ?? true),
            is_featured: (bool) ($data['is_featured'] ?? false),
            thumbnail_url: $data['thumbnail_url'] ?? '',
            demo_url: $data['demo_url'] ?? '',
            created_at: isset($data['created_at']) ? new DateTime($data['created_at']) : null,
            updated_at: isset($data['updated_at']) ? new DateTime($data['updated_at']) : null
        );
    }

    /**
     * Convert to API response array
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'provider' => $this->provider,
            'category' => $this->category,
            'description' => $this->description,
            'rtp' => $this->rtp,
            'rtp_percentage' => $this->rtp . '%',
            'volatility' => $this->volatility,
            'volatility_description' => $this->getVolatilityDescription(),
            'bet_range' => $this->getBetRange(),
            'is_high_rtp' => $this->isHighRtp(),
            'is_high_roller' => $this->isHighRollerGame(),
            'is_active' => $this->is_active,
            'is_featured' => $this->is_featured,
            'thumbnail_url' => $this->thumbnail_url,
            'demo_url' => $this->demo_url,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')
        ];
    }
}