<?php

declare(strict_types=1);

namespace App\Security;

/**
 * Enterprise Security Configuration
 * Based on casino.ca security analysis and best practices
 */
final class SecurityConfig
{
    /**
     * Security headers configuration
     * A+ SSL Labs rating requirements
     */
    public static function getSecurityHeaders(): array
    {
        return [
            // HSTS - Force HTTPS for 1 year
            'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
            
            // Prevent clickjacking
            'X-Frame-Options' => 'DENY',
            
            // Prevent MIME type sniffing
            'X-Content-Type-Options' => 'nosniff',
            
            // XSS Protection
            'X-XSS-Protection' => '1; mode=block',
            
            // Content Security Policy
            'Content-Security-Policy' => implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                "font-src 'self' https://fonts.gstatic.com",
                "img-src 'self' data: https:",
                "connect-src 'self' https://api.bestcasinoportal.com",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'"
            ]),
            
            // Referrer Policy
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            
            // Permissions Policy
            'Permissions-Policy' => implode(', ', [
                'camera=()',
                'microphone=()',
                'geolocation=()',
                'payment=()'
            ])
        ];
    }

    /**
     * Input validation rules
     */
    public static function getValidationRules(): array
    {
        return [
            'email' => 'required|email|max:255',
            'password' => 'required|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/',
            'casino_name' => 'required|string|max:100|regex:/^[a-zA-Z0-9\s\-_]+$/',
            'search_query' => 'string|max:255|regex:/^[a-zA-Z0-9\s\-_]+$/',
            'rating' => 'numeric|min:0|max:5',
            'bonus_amount' => 'numeric|min:0|max:10000'
        ];
    }

    /**
     * Rate limiting configuration
     */
    public static function getRateLimits(): array
    {
        return [
            'api' => [
                'max_requests' => 1000,
                'window_minutes' => 60
            ],
            'search' => [
                'max_requests' => 100,
                'window_minutes' => 15
            ],
            'auth' => [
                'max_requests' => 5,
                'window_minutes' => 15
            ]
        ];
    }

    /**
     * CSRF protection configuration
     */
    public static function getCsrfConfig(): array
    {
        return [
            'lifetime' => 3600, // 1 hour
            'regenerate' => true,
            'httponly' => true,
            'secure' => true,
            'samesite' => 'strict'
        ];
    }
}