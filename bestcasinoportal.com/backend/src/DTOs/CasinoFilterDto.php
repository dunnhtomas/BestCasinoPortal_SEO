<?php

declare(strict_types=1);

namespace BestCasinoPortal\DTOs;

use Psr\Http\Message\ServerRequestInterface;
use InvalidArgumentException;

/**
 * Casino Filter DTO - Data Transfer Object for casino filtering
 * Implements immutable pattern for thread safety
 */
final readonly class CasinoFilterDto
{
    public function __construct(
        public ?string $search = null,
        public ?array $categories = null,
        public ?float $minRating = null,
        public ?float $maxRating = null,
        public ?int $minBonus = null,
        public ?int $maxBonus = null,
        public ?array $countries = null,
        public ?array $languages = null,
        public ?array $licenses = null,
        public ?string $sortBy = 'rating',
        public ?string $sortDirection = 'desc',
        public ?int $limit = 20,
        public ?int $offset = 0
    ) {
        $this->validateFilters();
    }

    /**
     * Create DTO from PSR-7 request
     */
    public static function fromRequest(ServerRequestInterface $request): self
    {
        $queryParams = $request->getQueryParams();
        
        return new self(
            search: $queryParams['search'] ?? null,
            categories: isset($queryParams['categories']) ? explode(',', $queryParams['categories']) : null,
            minRating: isset($queryParams['min_rating']) ? (float) $queryParams['min_rating'] : null,
            maxRating: isset($queryParams['max_rating']) ? (float) $queryParams['max_rating'] : null,
            minBonus: isset($queryParams['min_bonus']) ? (int) $queryParams['min_bonus'] : null,
            maxBonus: isset($queryParams['max_bonus']) ? (int) $queryParams['max_bonus'] : null,
            countries: isset($queryParams['countries']) ? explode(',', $queryParams['countries']) : null,
            languages: isset($queryParams['languages']) ? explode(',', $queryParams['languages']) : null,
            licenses: isset($queryParams['licenses']) ? explode(',', $queryParams['licenses']) : null,
            sortBy: $queryParams['sort_by'] ?? 'rating',
            sortDirection: $queryParams['sort_direction'] ?? 'desc',
            limit: isset($queryParams['limit']) ? (int) $queryParams['limit'] : 20,
            offset: isset($queryParams['offset']) ? (int) $queryParams['offset'] : 0
        );
    }

    /**
     * Convert DTO to array for caching and logging
     */
    public function toArray(): array
    {
        return [
            'search' => $this->search,
            'categories' => $this->categories,
            'min_rating' => $this->minRating,
            'max_rating' => $this->maxRating,
            'min_bonus' => $this->minBonus,
            'max_bonus' => $this->maxBonus,
            'countries' => $this->countries,
            'languages' => $this->languages,
            'licenses' => $this->licenses,
            'sort_by' => $this->sortBy,
            'sort_direction' => $this->sortDirection,
            'limit' => $this->limit,
            'offset' => $this->offset
        ];
    }

    /**
     * Check if any filters are applied
     */
    public function hasFilters(): bool
    {
        return $this->search !== null
            || $this->categories !== null
            || $this->minRating !== null
            || $this->maxRating !== null
            || $this->minBonus !== null
            || $this->maxBonus !== null
            || $this->countries !== null
            || $this->languages !== null
            || $this->licenses !== null;
    }

    /**
     * Get cache key for this filter combination
     */
    public function getCacheKey(): string
    {
        return md5(serialize($this->toArray()));
    }

    /**
     * Validate filter values
     */
    private function validateFilters(): void
    {
        if ($this->minRating !== null && ($this->minRating < 0 || $this->minRating > 5)) {
            throw new InvalidArgumentException('Min rating must be between 0 and 5');
        }

        if ($this->maxRating !== null && ($this->maxRating < 0 || $this->maxRating > 5)) {
            throw new InvalidArgumentException('Max rating must be between 0 and 5');
        }

        if ($this->minRating !== null && $this->maxRating !== null && $this->minRating > $this->maxRating) {
            throw new InvalidArgumentException('Min rating cannot be greater than max rating');
        }

        if ($this->minBonus !== null && $this->minBonus < 0) {
            throw new InvalidArgumentException('Min bonus cannot be negative');
        }

        if ($this->maxBonus !== null && $this->maxBonus < 0) {
            throw new InvalidArgumentException('Max bonus cannot be negative');
        }

        if ($this->minBonus !== null && $this->maxBonus !== null && $this->minBonus > $this->maxBonus) {
            throw new InvalidArgumentException('Min bonus cannot be greater than max bonus');
        }

        if ($this->limit !== null && ($this->limit < 1 || $this->limit > 100)) {
            throw new InvalidArgumentException('Limit must be between 1 and 100');
        }

        if ($this->offset !== null && $this->offset < 0) {
            throw new InvalidArgumentException('Offset cannot be negative');
        }

        $validSortFields = ['rating', 'bonus_amount', 'name', 'created_at', 'updated_at'];
        if ($this->sortBy !== null && !in_array($this->sortBy, $validSortFields)) {
            throw new InvalidArgumentException('Invalid sort field: ' . $this->sortBy);
        }

        $validSortDirections = ['asc', 'desc'];
        if ($this->sortDirection !== null && !in_array($this->sortDirection, $validSortDirections)) {
            throw new InvalidArgumentException('Invalid sort direction: ' . $this->sortDirection);
        }
    }
}
