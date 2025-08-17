<?php

declare(strict_types=1);

/**
 * Helper Functions for BestCasinoPortal
 * 
 * Global utility functions following casino.ca architecture patterns
 * Provides common functionality used across the application
 */

/**
 * Format currency amount with proper localization
 */
function formatCurrency(float $amount, string $currency = 'USD'): string
{
    return match ($currency) {
        'USD' => '$' . number_format($amount, 0),
        'EUR' => '€' . number_format($amount, 0),
        'GBP' => '£' . number_format($amount, 0),
        'CAD' => 'C$' . number_format($amount, 0),
        default => $currency . ' ' . number_format($amount, 2)
    };
}

/**
 * Sanitize string for safe HTML output
 */
function sanitizeString(string $input): string
{
    return htmlspecialchars(trim($input), ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Generate secure random string
 */
function generateRandomString(int $length = 32): string
{
    return bin2hex(random_bytes($length / 2));
}

/**
 * Validate email address
 */
function isValidEmail(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Check if string is valid URL
 */
function isValidUrl(string $url): bool
{
    return filter_var($url, FILTER_VALIDATE_URL) !== false;
}

/**
 * Calculate rating stars HTML
 */
function generateStarRating(float $rating): string
{
    $stars = '';
    $fullStars = floor($rating);
    $hasHalfStar = ($rating - $fullStars) >= 0.5;
    
    // Full stars
    for ($i = 0; $i < $fullStars; $i++) {
        $stars .= '<span class="star star-full">★</span>';
    }
    
    // Half star
    if ($hasHalfStar) {
        $stars .= '<span class="star star-half">☆</span>';
    }
    
    // Empty stars
    $emptyStars = 5 - $fullStars - ($hasHalfStar ? 1 : 0);
    for ($i = 0; $i < $emptyStars; $i++) {
        $stars .= '<span class="star star-empty">☆</span>';
    }
    
    return $stars;
}

/**
 * Format file size in human readable format
 */
function formatFileSize(int $bytes): string
{
    $units = ['B', 'KB', 'MB', 'GB', 'TB'];
    $factor = floor(log($bytes, 1024));
    
    return sprintf('%.1f %s', $bytes / (1024 ** $factor), $units[$factor]);
}

/**
 * Generate URL-friendly slug from string
 */
function generateSlug(string $string): string
{
    $slug = strtolower($string);
    $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
    $slug = trim($slug, '-');
    
    return $slug;
}

/**
 * Check if request is AJAX
 */
function isAjaxRequest(): bool
{
    return isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
           strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
}

/**
 * Get client IP address
 */
function getClientIp(): string
{
    $ipKeys = ['HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
    
    foreach ($ipKeys as $key) {
        if (!empty($_SERVER[$key])) {
            $ips = explode(',', $_SERVER[$key]);
            return trim($ips[0]);
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? 'unknown';
}

/**
 * Get current timestamp in microseconds
 */
function getMicrotimeFloat(): float
{
    return microtime(true);
}

/**
 * Format execution time
 */
function formatExecutionTime(float $startTime): string
{
    $executionTime = getMicrotimeFloat() - $startTime;
    
    if ($executionTime < 0.001) {
        return sprintf('%.2f µs', $executionTime * 1000000);
    } elseif ($executionTime < 1) {
        return sprintf('%.2f ms', $executionTime * 1000);
    } else {
        return sprintf('%.2f s', $executionTime);
    }
}

/**
 * Debug function for development
 */
function debugDump($data, bool $exit = false): void
{
    if (defined('APP_ENV') && constant('APP_ENV') === 'production') {
        return;
    }
    
    echo '<pre>';
    var_dump($data);
    echo '</pre>';
    
    if ($exit) {
        exit;
    }
}

/**
 * Log error with context
 */
function logError(string $message, array $context = []): void
{
    error_log(sprintf(
        '[%s] %s %s',
        date('Y-m-d H:i:s'),
        $message,
        !empty($context) ? json_encode($context) : ''
    ));
}

/**
 * Environment-aware configuration getter
 */
function env(string $key, $default = null)
{
    $value = $_ENV[$key] ?? getenv($key);
    
    if ($value === false) {
        return $default;
    }
    
    // Convert string booleans
    if (in_array(strtolower($value), ['true', 'false'])) {
        return strtolower($value) === 'true';
    }
    
    // Convert numeric strings
    if (is_numeric($value)) {
        return str_contains($value, '.') ? (float) $value : (int) $value;
    }
    
    return $value;
}

/**
 * Redirect to URL
 */
function redirect(string $url, int $statusCode = 302): void
{
    header("Location: $url", true, $statusCode);
    exit;
}

/**
 * Check if value is empty or null
 */
function isEmpty($value): bool
{
    return $value === null || $value === '' || $value === [];
}

/**
 * Array helper - get value by key with default
 */
function arrayGet(array $array, string $key, $default = null)
{
    return $array[$key] ?? $default;
}

/**
 * Array helper - check if key exists and is not empty
 */
function arrayHas(array $array, string $key): bool
{
    return isset($array[$key]) && !isEmpty($array[$key]);
}

/**
 * Generate CSRF token
 */
function generateCsrfToken(): string
{
    $token = generateRandomString(32);
    $_SESSION['csrf_token'] = $token;
    return $token;
}

/**
 * Verify CSRF token
 */
function verifyCsrfToken(string $token): bool
{
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Casino-specific: Format bonus amount
 */
function formatBonus(int $amount, string $type = 'deposit'): string
{
    $formatted = formatCurrency($amount);
    
    return match ($type) {
        'deposit' => "$formatted Welcome Bonus",
        'no_deposit' => "$formatted No Deposit Bonus",
        'free_spins' => "$amount Free Spins",
        default => "$formatted Bonus"
    };
}

/**
 * Casino-specific: Calculate trust score color
 */
function getTrustScoreColor(float $score): string
{
    return match (true) {
        $score >= 90 => 'text-green-600',
        $score >= 75 => 'text-yellow-600',
        $score >= 60 => 'text-orange-600',
        default => 'text-red-600'
    };
}
