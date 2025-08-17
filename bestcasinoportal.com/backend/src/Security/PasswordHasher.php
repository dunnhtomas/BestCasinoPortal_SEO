<?php

declare(strict_types=1);

namespace BestCasinoPortal\Security;

/**
 * Password Hasher - Secure password hashing using PHP's built-in functions
 * Professional implementation following Context7 security best practices
 */
final readonly class PasswordHasher
{
    private const ALGORITHM = PASSWORD_ARGON2ID;
    private const OPTIONS = [
        'memory_cost' => 65536, // 64 MB
        'time_cost' => 4,       // 4 iterations
        'threads' => 3,         // 3 threads
    ];

    /**
     * Hash password securely
     */
    public function hash(string $password): string
    {
        return password_hash($password, self::ALGORITHM, self::OPTIONS);
    }

    /**
     * Verify password against hash
     */
    public function verify(string $password, string $hash): bool
    {
        return password_verify($password, $hash);
    }

    /**
     * Check if password needs rehashing (for algorithm upgrades)
     */
    public function needsRehash(string $hash): bool
    {
        return password_needs_rehash($hash, self::ALGORITHM, self::OPTIONS);
    }

    /**
     * Generate secure random password
     */
    public function generateRandomPassword(int $length = 16): string
    {
        $characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        $password = '';
        
        for ($i = 0; $i < $length; $i++) {
            $password .= $characters[random_int(0, strlen($characters) - 1)];
        }
        
        return $password;
    }

    /**
     * Validate password strength
     */
    public function validateStrength(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters long';
        }
        
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        
        if (!preg_match('/\d/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        
        if (!preg_match('/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return $errors;
    }

    /**
     * Calculate password entropy
     */
    public function calculateEntropy(string $password): float
    {
        $charsetSize = 0;
        
        if (preg_match('/[a-z]/', $password)) {
            $charsetSize += 26;
        }
        
        if (preg_match('/[A-Z]/', $password)) {
            $charsetSize += 26;
        }
        
        if (preg_match('/\d/', $password)) {
            $charsetSize += 10;
        }
        
        if (preg_match('/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]/', $password)) {
            $charsetSize += 32;
        }
        
        return strlen($password) * log($charsetSize, 2);
    }

    /**
     * Check if password is commonly used
     */
    public function isCommonPassword(string $password): bool
    {
        $commonPasswords = [
            'password', '123456', 'password123', 'admin', 'qwerty',
            'letmein', 'welcome', 'monkey', 'dragon', 'master',
            'shadow', 'superman', 'michael', 'jesus', 'trustno1'
        ];
        
        return in_array(strtolower($password), $commonPasswords, true);
    }

    /**
     * Get password strength score (0-100)
     */
    public function getStrengthScore(string $password): int
    {
        $score = 0;
        
        // Length bonus
        $score += min(25, strlen($password) * 2);
        
        // Character variety bonus
        if (preg_match('/[a-z]/', $password)) $score += 5;
        if (preg_match('/[A-Z]/', $password)) $score += 5;
        if (preg_match('/\d/', $password)) $score += 5;
        if (preg_match('/[!@#$%^&*()_+\-=\[\]{};:"\\|,.<>\?]/', $password)) $score += 10;
        
        // Entropy bonus
        $entropy = $this->calculateEntropy($password);
        $score += min(30, intval($entropy / 2));
        
        // Penalties
        if ($this->isCommonPassword($password)) $score -= 20;
        if (strlen($password) < 8) $score -= 20;
        
        return max(0, min(100, $score));
    }

    /**
     * Get password strength level
     */
    public function getStrengthLevel(string $password): string
    {
        $score = $this->getStrengthScore($password);
        
        return match (true) {
            $score >= 80 => 'Very Strong',
            $score >= 60 => 'Strong',
            $score >= 40 => 'Medium',
            $score >= 20 => 'Weak',
            default => 'Very Weak'
        };
    }
}
