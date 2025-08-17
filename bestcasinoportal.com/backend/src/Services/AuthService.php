<?php

declare(strict_types=1);

namespace BestCasinoPortal\Services;

use BestCasinoPortal\Models\User;
use BestCasinoPortal\DTOs\LoginDto;
use BestCasinoPortal\DTOs\RegisterDto;
use BestCasinoPortal\Exceptions\AuthenticationException;
use BestCasinoPortal\Exceptions\ValidationException;
use Psr\Log\LoggerInterface;

/**
 * Professional Authentication Service
 * 
 * Handles user authentication, registration, and session management
 * following casino.ca security standards.
 */
final readonly class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private PasswordHasher $passwordHasher,
        private JwtTokenManager $tokenManager,
        private LoggerInterface $logger
    ) {}

    /**
     * Authenticate user with email and password
     * 
     * @throws AuthenticationException
     * @throws ValidationException
     */
    public function authenticate(LoginDto $loginDto): array
    {
        $this->logger->info('Authentication attempt', [
            'email' => $loginDto->email,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);

        // Rate limiting check
        $this->checkRateLimit($loginDto->email);

        // Find user by email
        $user = $this->userRepository->findByEmail($loginDto->email);
        if (!$user) {
            $this->logger->warning('Authentication failed - user not found', [
                'email' => $loginDto->email
            ]);
            throw new AuthenticationException('Invalid credentials');
        }

        // Verify password
        if (!$this->passwordHasher->verify($loginDto->password, $user->getPasswordHash())) {
            $this->logger->warning('Authentication failed - invalid password', [
                'email' => $loginDto->email,
                'user_id' => $user->getId()
            ]);
            throw new AuthenticationException('Invalid credentials');
        }

        // Check if account is active
        if (!$user->isActive()) {
            $this->logger->warning('Authentication failed - inactive account', [
                'email' => $loginDto->email,
                'user_id' => $user->getId()
            ]);
            throw new AuthenticationException('Account is not active');
        }

        // Generate JWT tokens
        $accessToken = $this->tokenManager->generateAccessToken($user);
        $refreshToken = $this->tokenManager->generateRefreshToken($user);

        // Update last login
        $this->userRepository->updateLastLogin($user->getId());

        $this->logger->info('Authentication successful', [
            'user_id' => $user->getId(),
            'email' => $user->getEmail()
        ]);

        return [
            'user' => $user->toArray(),
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => $this->tokenManager->getAccessTokenTtl()
        ];
    }

    /**
     * Register new user account
     * 
     * @throws ValidationException
     */
    public function register(RegisterDto $registerDto): array
    {
        $this->logger->info('Registration attempt', [
            'email' => $registerDto->email,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
        ]);

        // Check if email already exists
        if ($this->userRepository->findByEmail($registerDto->email)) {
            throw new ValidationException([
                'email' => ['Email address is already registered']
            ]);
        }

        // Hash password
        $passwordHash = $this->passwordHasher->hash($registerDto->password);

        // Create user
        $userData = [
            'email' => $registerDto->email,
            'password_hash' => $passwordHash,
            'first_name' => $registerDto->firstName,
            'last_name' => $registerDto->lastName,
            'is_active' => true,
            'email_verified' => false,
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s')
        ];

        $userId = $this->userRepository->create($userData);
        $user = $this->userRepository->findById($userId);

        // Generate email verification token
        $verificationToken = $this->tokenManager->generateEmailVerificationToken($user);

        // Send verification email (would be implemented with email service)
        // $this->emailService->sendVerificationEmail($user, $verificationToken);

        $this->logger->info('Registration successful', [
            'user_id' => $userId,
            'email' => $registerDto->email
        ]);

        return [
            'user' => $user->toArray(),
            'message' => 'Registration successful. Please check your email for verification instructions.',
            'verification_required' => true
        ];
    }

    /**
     * Refresh access token using refresh token
     * 
     * @throws AuthenticationException
     */
    public function refreshToken(string $refreshToken): array
    {
        try {
            $payload = $this->tokenManager->validateRefreshToken($refreshToken);
            $user = $this->userRepository->findById($payload['user_id']);

            if (!$user || !$user->isActive()) {
                throw new AuthenticationException('Invalid refresh token');
            }

            $newAccessToken = $this->tokenManager->generateAccessToken($user);

            return [
                'access_token' => $newAccessToken,
                'token_type' => 'Bearer',
                'expires_in' => $this->tokenManager->getAccessTokenTtl()
            ];

        } catch (\Exception $e) {
            $this->logger->warning('Token refresh failed', [
                'error' => $e->getMessage()
            ]);
            throw new AuthenticationException('Invalid refresh token');
        }
    }

    /**
     * Logout user by invalidating tokens
     */
    public function logout(string $accessToken): bool
    {
        try {
            $this->tokenManager->invalidateToken($accessToken);
            
            $this->logger->info('User logged out successfully');
            return true;

        } catch (\Exception $e) {
            $this->logger->error('Logout failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Verify email with verification token
     * 
     * @throws AuthenticationException
     */
    public function verifyEmail(string $token): bool
    {
        try {
            $payload = $this->tokenManager->validateEmailVerificationToken($token);
            $user = $this->userRepository->findById($payload['user_id']);

            if (!$user) {
                throw new AuthenticationException('Invalid verification token');
            }

            $this->userRepository->markEmailAsVerified($user->getId());

            $this->logger->info('Email verified successfully', [
                'user_id' => $user->getId()
            ]);

            return true;

        } catch (\Exception $e) {
            $this->logger->warning('Email verification failed', [
                'error' => $e->getMessage()
            ]);
            throw new AuthenticationException('Invalid verification token');
        }
    }

    /**
     * Get user from access token
     * 
     * @throws AuthenticationException
     */
    public function getUserFromToken(string $accessToken): ?User
    {
        try {
            $payload = $this->tokenManager->validateAccessToken($accessToken);
            $user = $this->userRepository->findById($payload['user_id']);

            if (!$user || !$user->isActive()) {
                throw new AuthenticationException('Invalid token');
            }

            return $user;

        } catch (\Exception $e) {
            $this->logger->warning('Token validation failed', [
                'error' => $e->getMessage()
            ]);
            throw new AuthenticationException('Invalid token');
        }
    }

    /**
     * Check rate limiting for authentication attempts
     * 
     * @throws AuthenticationException
     */
    private function checkRateLimit(string $email): void
    {
        // Implementation would check rate limiting
        // For now, just a placeholder
        $attempts = $this->getCachedAttempts($email);
        
        if ($attempts >= 5) {
            $this->logger->warning('Rate limit exceeded', [
                'email' => $email,
                'attempts' => $attempts
            ]);
            throw new AuthenticationException('Too many login attempts. Please try again later.');
        }
    }

    /**
     * Get cached authentication attempts (placeholder)
     */
    private function getCachedAttempts(string $email): int
    {
        // Would implement with Redis or cache system
        return 0;
    }
}
