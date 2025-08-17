<?php

declare(strict_types=1);

namespace BestCasinoPortal\Cache;

/**
 * Cache Manager - Simple cache implementation
 * Provides caching functionality for improved performance
 */
final class CacheManager
{
    private array $cache = [];
    private array $timestamps = [];
    
    public function __construct(
        private int $defaultTtl = 300 // 5 minutes default
    ) {}

    /**
     * Remember a value in cache or compute it if not present
     */
    public function remember(string $key, int $ttl, callable $callback)
    {
        // Check if we have a valid cached value
        if ($this->has($key)) {
            return $this->cache[$key];
        }

        // Compute the value and cache it
        $value = $callback();
        $this->put($key, $value, $ttl);
        
        return $value;
    }

    /**
     * Store a value in cache
     */
    public function put(string $key, $value, int $ttl = null): void
    {
        $this->cache[$key] = $value;
        $this->timestamps[$key] = time() + ($ttl ?? $this->defaultTtl);
    }

    /**
     * Get a value from cache
     */
    public function get(string $key, $default = null)
    {
        if (!$this->has($key)) {
            return $default;
        }

        return $this->cache[$key];
    }

    /**
     * Check if a key exists and is not expired
     */
    public function has(string $key): bool
    {
        if (!isset($this->cache[$key]) || !isset($this->timestamps[$key])) {
            return false;
        }

        // Check if expired
        if (time() > $this->timestamps[$key]) {
            $this->forget($key);
            return false;
        }

        return true;
    }

    /**
     * Remove a key from cache
     */
    public function forget(string $key): void
    {
        unset($this->cache[$key], $this->timestamps[$key]);
    }

    /**
     * Clear all cache
     */
    public function flush(): void
    {
        $this->cache = [];
        $this->timestamps = [];
    }

    /**
     * Get cache statistics
     */
    public function getStats(): array
    {
        $now = time();
        $expired = 0;
        $valid = 0;

        foreach ($this->timestamps as $timestamp) {
            if ($now > $timestamp) {
                $expired++;
            } else {
                $valid++;
            }
        }

        return [
            'total_keys' => count($this->cache),
            'valid_keys' => $valid,
            'expired_keys' => $expired,
            'memory_usage' => memory_get_usage(true)
        ];
    }

    /**
     * Clean up expired entries
     */
    public function cleanup(): int
    {
        $now = time();
        $cleaned = 0;

        foreach ($this->timestamps as $key => $timestamp) {
            if ($now > $timestamp) {
                $this->forget($key);
                $cleaned++;
            }
        }

        return $cleaned;
    }
}
