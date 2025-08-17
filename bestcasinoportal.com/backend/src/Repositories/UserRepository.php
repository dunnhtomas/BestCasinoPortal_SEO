<?php

declare(strict_types=1);

namespace BestCasinoPortal\Repositories;

use BestCasinoPortal\Models\User;
use BestCasinoPortal\Database\Database;
use Psr\Log\LoggerInterface;
use PDOException;

/**
 * User Repository - Handles user data access operations
 * Professional implementation following Context7 best practices
 */
final readonly class UserRepository
{
    public function __construct(
        private Database $database,
        private LoggerInterface $logger
    ) {}

    /**
     * Find user by ID
     */
    public function findById(int $id): ?User
    {
        try {
            $result = $this->database->fetchOne(
                'SELECT * FROM users WHERE id = ? AND deleted_at IS NULL',
                [$id]
            );

            return $result ? User::fromArray($result) : null;

        } catch (PDOException $e) {
            $this->logger->error('Failed to find user by ID', [
                'user_id' => $id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        try {
            $result = $this->database->fetchOne(
                'SELECT * FROM users WHERE email = ? AND deleted_at IS NULL',
                [$email]
            );

            return $result ? User::fromArray($result) : null;

        } catch (PDOException $e) {
            $this->logger->error('Failed to find user by email', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create new user
     */
    public function create(array $userData): int
    {
        try {
            $this->database->execute(
                'INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $userData['email'],
                    $userData['password_hash'],
                    $userData['first_name'],
                    $userData['last_name'],
                    $userData['is_active'] ? 1 : 0,
                    $userData['email_verified'] ? 1 : 0,
                    $userData['created_at'],
                    $userData['updated_at']
                ]
            );

            $userId = (int) $this->database->lastInsertId();

            $this->logger->info('User created successfully', [
                'user_id' => $userId,
                'email' => $userData['email']
            ]);

            return $userId;

        } catch (PDOException $e) {
            $this->logger->error('Failed to create user', [
                'email' => $userData['email'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Update user's last login timestamp
     */
    public function updateLastLogin(int $userId): bool
    {
        try {
            $now = date('Y-m-d H:i:s');
            $affectedRows = $this->database->executeUpdate(
                'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?',
                [$now, $now, $userId]
            );

            if ($affectedRows > 0) {
                $this->logger->info('Last login updated', ['user_id' => $userId]);
                return true;
            }

            return false;

        } catch (PDOException $e) {
            $this->logger->error('Failed to update last login', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Mark email as verified
     */
    public function markEmailAsVerified(int $userId): bool
    {
        try {
            $now = date('Y-m-d H:i:s');
            $affectedRows = $this->database->executeUpdate(
                'UPDATE users SET email_verified = 1, email_verified_at = ?, updated_at = ? WHERE id = ?',
                [$now, $now, $userId]
            );

            if ($affectedRows > 0) {
                $this->logger->info('Email verified', ['user_id' => $userId]);
                return true;
            }

            return false;

        } catch (PDOException $e) {
            $this->logger->error('Failed to mark email as verified', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Update user data
     */
    public function update(int $userId, array $data): bool
    {
        try {
            $fields = [];
            $values = [];

            foreach ($data as $field => $value) {
                $fields[] = "{$field} = ?";
                $values[] = $value;
            }

            $fields[] = 'updated_at = ?';
            $values[] = date('Y-m-d H:i:s');
            $values[] = $userId;

            $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = ?';
            $affectedRows = $this->database->executeUpdate($sql, $values);

            if ($affectedRows > 0) {
                $this->logger->info('User updated', [
                    'user_id' => $userId,
                    'fields' => array_keys($data)
                ]);
                return true;
            }

            return false;

        } catch (PDOException $e) {
            $this->logger->error('Failed to update user', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Soft delete user
     */
    public function delete(int $userId): bool
    {
        try {
            $now = date('Y-m-d H:i:s');
            $affectedRows = $this->database->executeUpdate(
                'UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?',
                [$now, $now, $userId]
            );

            if ($affectedRows > 0) {
                $this->logger->info('User soft deleted', ['user_id' => $userId]);
                return true;
            }

            return false;

        } catch (PDOException $e) {
            $this->logger->error('Failed to delete user', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Check if email exists
     */
    public function emailExists(string $email): bool
    {
        try {
            $result = $this->database->fetchOne(
                'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
                [$email]
            );
            
            return $result !== null;

        } catch (PDOException $e) {
            $this->logger->error('Failed to check email existence', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }

    /**
     * Get user statistics
     */
    public function getStatistics(): array
    {
        try {
            $totalUsers = $this->database->fetchOne(
                'SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL'
            );

            $activeUsers = $this->database->fetchOne(
                'SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND deleted_at IS NULL'
            );

            $verifiedUsers = $this->database->fetchOne(
                'SELECT COUNT(*) as count FROM users WHERE email_verified = 1 AND deleted_at IS NULL'
            );

            return [
                'total_users' => (int) ($totalUsers['count'] ?? 0),
                'active_users' => (int) ($activeUsers['count'] ?? 0),
                'verified_users' => (int) ($verifiedUsers['count'] ?? 0),
                'verification_rate' => $totalUsers['count'] > 0 
                    ? round(($verifiedUsers['count'] / $totalUsers['count']) * 100, 2) 
                    : 0
            ];

        } catch (PDOException $e) {
            $this->logger->error('Failed to get user statistics', [
                'error' => $e->getMessage()
            ]);
            
            return [
                'total_users' => 0,
                'active_users' => 0,
                'verified_users' => 0,
                'verification_rate' => 0
            ];
        }
    }

    /**
     * Find recently registered users
     */
    public function findRecentlyRegistered(int $limit = 10): array
    {
        try {
            $results = $this->database->fetchAll(
                'SELECT * FROM users 
                 WHERE deleted_at IS NULL 
                 ORDER BY created_at DESC 
                 LIMIT ?',
                [$limit]
            );

            return array_map(fn($row) => User::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Failed to find recently registered users', [
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Find users by activity status
     */
    public function findByActiveStatus(bool $isActive, int $limit = 50): array
    {
        try {
            $results = $this->database->fetchAll(
                'SELECT * FROM users 
                 WHERE is_active = ? AND deleted_at IS NULL 
                 ORDER BY created_at DESC 
                 LIMIT ?',
                [$isActive ? 1 : 0, $limit]
            );

            return array_map(fn($row) => User::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Failed to find users by active status', [
                'is_active' => $isActive,
                'error' => $e->getMessage()
            ]);
            return [];
        }
    }
}
