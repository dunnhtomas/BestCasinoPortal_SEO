<?php

declare(strict_types=1);

namespace BestCasinoPortal\Services;

use BestCasinoPortal\Models\User;
use BestCasinoPortal\Database\Database;
use Psr\Log\LoggerInterface;

/**
 * User Repository - Handles user data access operations
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
            $stmt = $this->database->prepare('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL');
            $stmt->execute([$id]);
            $userData = $stmt->fetch();

            return $userData ? User::fromArray($userData) : null;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL');
            $stmt->execute([$email]);
            $userData = $stmt->fetch();

            return $userData ? User::fromArray($userData) : null;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare(
                'INSERT INTO users (email, password_hash, first_name, last_name, is_active, email_verified, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            );
            
            $stmt->execute([
                $userData['email'],
                $userData['password_hash'],
                $userData['first_name'],
                $userData['last_name'],
                $userData['is_active'] ? 1 : 0,
                $userData['email_verified'] ? 1 : 0,
                $userData['created_at'],
                $userData['updated_at']
            ]);

            $userId = (int) $this->database->lastInsertId();

            $this->logger->info('User created successfully', [
                'user_id' => $userId,
                'email' => $userData['email']
            ]);

            return $userId;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare(
                'UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?'
            );
            
            $now = date('Y-m-d H:i:s');
            $result = $stmt->execute([$now, $now, $userId]);

            if ($result) {
                $this->logger->info('Last login updated', ['user_id' => $userId]);
            }

            return $result;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare(
                'UPDATE users SET email_verified = 1, email_verified_at = ?, updated_at = ? WHERE id = ?'
            );
            
            $now = date('Y-m-d H:i:s');
            $result = $stmt->execute([$now, $now, $userId]);

            if ($result) {
                $this->logger->info('Email verified', ['user_id' => $userId]);
            }

            return $result;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare($sql);
            
            $result = $stmt->execute($values);

            if ($result) {
                $this->logger->info('User updated', [
                    'user_id' => $userId,
                    'fields' => array_keys($data)
                ]);
            }

            return $result;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare(
                'UPDATE users SET deleted_at = ?, updated_at = ? WHERE id = ?'
            );
            
            $now = date('Y-m-d H:i:s');
            $result = $stmt->execute([$now, $now, $userId]);

            if ($result) {
                $this->logger->info('User soft deleted', ['user_id' => $userId]);
            }

            return $result;

        } catch (\Exception $e) {
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
            $stmt = $this->database->prepare('SELECT id FROM users WHERE email = ? AND deleted_at IS NULL');
            $stmt->execute([$email]);
            
            return $stmt->fetch() !== false;

        } catch (\Exception $e) {
            $this->logger->error('Failed to check email existence', [
                'email' => $email,
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}
