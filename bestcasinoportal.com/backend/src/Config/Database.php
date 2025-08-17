<?php

declare(strict_types=1);

namespace BestCasinoPortal\Config;

use PDO;
use PDOException;
use Psr\Log\LoggerInterface;

/**
 * Database Configuration and Connection Manager
 * Following Context7 Laravel best practices for dependency injection
 */
final readonly class Database
{
    public function __construct(
        private LoggerInterface $logger,
        private string $host = 'localhost',
        private string $database = 'casino_portal',
        private string $username = 'casino_user',
        private string $password = '',
        private int $port = 5432
    ) {}

    /**
     * Create PDO connection with optimized settings for casino portal
     * Sub-200ms connection target following casino.ca standards
     */
    public function getConnection(): PDO
    {
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->database}";
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_PERSISTENT => true, // Performance optimization
                PDO::ATTR_TIMEOUT => 5, // 5 second timeout for performance
            ];

            $pdo = new PDO($dsn, $this->username, $this->password, $options);
            
            // PostgreSQL specific optimizations for casino portal
            $pdo->exec("SET timezone = 'UTC'");
            $pdo->exec("SET statement_timeout = '30s'"); // Prevent long queries
            
            $this->logger->info('Database connection established successfully');
            
            return $pdo;
            
        } catch (PDOException $e) {
            $this->logger->error('Database connection failed', [
                'error' => $e->getMessage(),
                'host' => $this->host,
                'database' => $this->database
            ]);
            
            throw new \RuntimeException(
                'Unable to connect to database: ' . $e->getMessage(),
                0,
                $e
            );
        }
    }

    /**
     * Test database connection health
     * Used for monitoring and health checks
     */
    public function testConnection(): bool
    {
        try {
            $pdo = $this->getConnection();
            $pdo->query('SELECT 1');
            return true;
        } catch (\Throwable $e) {
            $this->logger->warning('Database health check failed', [
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
}