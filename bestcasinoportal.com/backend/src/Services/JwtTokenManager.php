<?php

declare(strict_types=1);

namespace BestCasinoPortal\Services;

use BestCasinoPortal\Models\User;

/**
 * JWT Token Manager - Simplified JWT implementation for authentication
 */
final readonly class JwtTokenManager
{
    private const ALGORITHM = 'HS256';
    private const ACCESS_TOKEN_TTL = 3600; // 1 hour
    private const REFRESH_TOKEN_TTL = 604800; // 7 days
    private const EMAIL_VERIFICATION_TTL = 86400; // 24 hours

    public function __construct(
        private string $secretKey = 'casino-portal-secret-key-change-in-production'
    ) {}

    /**
     * Generate access token for user
     */
    public function generateAccessToken(User $user): string
    {
        $payload = [
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'type' => 'access',
            'iat' => time(),
            'exp' => time() + self::ACCESS_TOKEN_TTL
        ];

        return $this->encodeToken($payload);
    }

    /**
     * Generate refresh token for user
     */
    public function generateRefreshToken(User $user): string
    {
        $payload = [
            'user_id' => $user->getId(),
            'type' => 'refresh',
            'iat' => time(),
            'exp' => time() + self::REFRESH_TOKEN_TTL
        ];

        return $this->encodeToken($payload);
    }

    /**
     * Generate email verification token
     */
    public function generateEmailVerificationToken(User $user): string
    {
        $payload = [
            'user_id' => $user->getId(),
            'email' => $user->getEmail(),
            'type' => 'email_verification',
            'iat' => time(),
            'exp' => time() + self::EMAIL_VERIFICATION_TTL
        ];

        return $this->encodeToken($payload);
    }

    /**
     * Validate access token
     */
    public function validateAccessToken(string $token): array
    {
        $payload = $this->decodeToken($token);
        
        if ($payload['type'] !== 'access') {
            throw new \Exception('Invalid token type');
        }

        return $payload;
    }

    /**
     * Validate refresh token
     */
    public function validateRefreshToken(string $token): array
    {
        $payload = $this->decodeToken($token);
        
        if ($payload['type'] !== 'refresh') {
            throw new \Exception('Invalid token type');
        }

        return $payload;
    }

    /**
     * Validate email verification token
     */
    public function validateEmailVerificationToken(string $token): array
    {
        $payload = $this->decodeToken($token);
        
        if ($payload['type'] !== 'email_verification') {
            throw new \Exception('Invalid token type');
        }

        return $payload;
    }

    /**
     * Get access token TTL
     */
    public function getAccessTokenTtl(): int
    {
        return self::ACCESS_TOKEN_TTL;
    }

    /**
     * Invalidate token (placeholder - would implement with blacklist)
     */
    public function invalidateToken(string $token): bool
    {
        // In production, this would add the token to a blacklist
        // For now, just return true as a placeholder
        return true;
    }

    /**
     * Encode JWT token (simplified implementation)
     */
    private function encodeToken(array $payload): string
    {
        $header = [
            'typ' => 'JWT',
            'alg' => self::ALGORITHM
        ];

        $headerEncoded = $this->base64urlEncode(json_encode($header));
        $payloadEncoded = $this->base64urlEncode(json_encode($payload));
        
        $signature = $this->sign($headerEncoded . '.' . $payloadEncoded);
        
        return $headerEncoded . '.' . $payloadEncoded . '.' . $signature;
    }

    /**
     * Decode JWT token (simplified implementation)
     */
    private function decodeToken(string $token): array
    {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            throw new \Exception('Invalid token format');
        }

        [$headerEncoded, $payloadEncoded, $signature] = $parts;
        
        // Verify signature
        $expectedSignature = $this->sign($headerEncoded . '.' . $payloadEncoded);
        if (!hash_equals($signature, $expectedSignature)) {
            throw new \Exception('Invalid token signature');
        }

        $payload = json_decode($this->base64urlDecode($payloadEncoded), true);
        
        if (!$payload) {
            throw new \Exception('Invalid token payload');
        }

        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new \Exception('Token has expired');
        }

        return $payload;
    }

    /**
     * Sign data with secret key
     */
    private function sign(string $data): string
    {
        return $this->base64urlEncode(hash_hmac('sha256', $data, $this->secretKey, true));
    }

    /**
     * Base64 URL encode
     */
    private function base64urlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    /**
     * Base64 URL decode
     */
    private function base64urlDecode(string $data): string
    {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
}
