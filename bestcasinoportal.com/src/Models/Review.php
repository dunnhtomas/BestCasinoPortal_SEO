<?php

declare(strict_types=1);

namespace App\Models;

use DateTime;

/**
 * Review Model for Casino Reviews
 * Following Context7 patterns for review system
 */
final readonly class Review
{
    public function __construct(
        public ?int $id = null,
        public int $casino_id = 0,
        public int $user_id = 0,
        public float $rating = 0.0, // 1-5 stars
        public string $title = '',
        public string $content = '',
        public array $pros = [],
        public array $cons = [],
        public bool $is_verified = false,
        public bool $is_published = false,
        public ?DateTime $created_at = null,
        public ?DateTime $updated_at = null
    ) {}

    /**
     * Check if review is positive (4+ stars)
     */
    public function isPositiveReview(): bool
    {
        return $this->rating >= 4.0;
    }

    /**
     * Get rating stars display
     */
    public function getRatingStars(): string
    {
        $fullStars = floor($this->rating);
        $halfStar = ($this->rating - $fullStars) >= 0.5 ? 1 : 0;
        $emptyStars = 5 - $fullStars - $halfStar;

        return str_repeat('★', (int) $fullStars) . 
               str_repeat('☆', $halfStar) . 
               str_repeat('☆', (int) $emptyStars);
    }

    /**
     * Get review quality score based on length and detail
     */
    public function getQualityScore(): int
    {
        $score = 0;
        
        // Content length scoring
        if (strlen($this->content) >= 100) $score += 20;
        if (strlen($this->content) >= 300) $score += 20;
        if (strlen($this->title) >= 10) $score += 10;
        
        // Pros/cons detail scoring
        if (count($this->pros) >= 2) $score += 15;
        if (count($this->cons) >= 1) $score += 15;
        
        // Verification bonus
        if ($this->is_verified) $score += 20;
        
        return min($score, 100); // Cap at 100
    }

    /**
     * Check if review is detailed enough for featuring
     */
    public function isFeaturable(): bool
    {
        return $this->getQualityScore() >= 70 && 
               $this->is_verified && 
               $this->is_published;
    }

    /**
     * Create from array data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            id: $data['id'] ?? null,
            casino_id: (int) ($data['casino_id'] ?? 0),
            user_id: (int) ($data['user_id'] ?? 0),
            rating: (float) ($data['rating'] ?? 0.0),
            title: $data['title'] ?? '',
            content: $data['content'] ?? '',
            pros: $data['pros'] ?? [],
            cons: $data['cons'] ?? [],
            is_verified: (bool) ($data['is_verified'] ?? false),
            is_published: (bool) ($data['is_published'] ?? false),
            created_at: isset($data['created_at']) ? new DateTime($data['created_at']) : null,
            updated_at: isset($data['updated_at']) ? new DateTime($data['updated_at']) : null
        );
    }

    /**
     * Convert to API response
     */
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'casino_id' => $this->casino_id,
            'user_id' => $this->user_id,
            'rating' => $this->rating,
            'rating_stars' => $this->getRatingStars(),
            'title' => $this->title,
            'content' => $this->content,
            'pros' => $this->pros,
            'cons' => $this->cons,
            'is_positive' => $this->isPositiveReview(),
            'quality_score' => $this->getQualityScore(),
            'is_featurable' => $this->isFeaturable(),
            'is_verified' => $this->is_verified,
            'is_published' => $this->is_published,
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s')
        ];
    }
}