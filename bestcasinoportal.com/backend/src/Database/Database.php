<?php

declare(strict_types=1);

namespace BestCasinoPortal\Database;

use PDO;
use PDOException;
use Psr\Log\LoggerInterface;

/**
 * Database Connection Manager
 * 
 * Professional database abstraction layer following Context7 best practices
 * Provides connection management, query execution, and error handling
 */
final class Database
{
    private ?PDO $connection = null;
    private array $config;

    public function __construct(
        array $config,
        private LoggerInterface $logger
    ) {
        $this->config = $config;
    }

    /**
     * Get PDO connection instance
     */
    public function getConnection(): PDO
    {
        if ($this->connection === null) {
            $this->connect();
        }

        return $this->connection;
    }

    /**
     * Execute a prepared statement with parameters
     */
    public function execute(string $sql, array $params = []): \PDOStatement
    {
        try {
            $statement = $this->getConnection()->prepare($sql);
            $statement->execute($params);
            
            return $statement;
        } catch (PDOException $e) {
            $this->logger->error('Database query failed', [
                'sql' => $sql,
                'params' => $params,
                'error' => $e->getMessage()
            ]);
            
            throw $e;
        }
    }

    /**
     * Fetch all results from a query
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $statement = $this->execute($sql, $params);
        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Fetch single result from a query
     */
    public function fetchOne(string $sql, array $params = []): ?array
    {
        $statement = $this->execute($sql, $params);
        $result = $statement->fetch(PDO::FETCH_ASSOC);
        
        return $result ?: null;
    }

    /**
     * Execute query and return affected rows count
     */
    public function executeUpdate(string $sql, array $params = []): int
    {
        $statement = $this->execute($sql, $params);
        return $statement->rowCount();
    }

    /**
     * Get last insert ID
     */
    public function lastInsertId(): string
    {
        return $this->getConnection()->lastInsertId();
    }

    /**
     * Begin transaction
     */
    public function beginTransaction(): bool
    {
        return $this->getConnection()->beginTransaction();
    }

    /**
     * Commit transaction
     */
    public function commit(): bool
    {
        return $this->getConnection()->commit();
    }

    /**
     * Rollback transaction
     */
    public function rollback(): bool
    {
        return $this->getConnection()->rollBack();
    }

    /**
     * Check if currently in transaction
     */
    public function inTransaction(): bool
    {
        return $this->getConnection()->inTransaction();
    }

    /**
     * Execute a transaction with callback
     */
    public function transaction(callable $callback): mixed
    {
        $this->beginTransaction();
        
        try {
            $result = $callback($this);
            $this->commit();
            
            return $result;
        } catch (\Exception $e) {
            $this->rollback();
            
            $this->logger->error('Transaction failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Get database connection info
     */
    public function getConnectionInfo(): array
    {
        return [
            'driver' => $this->config['driver'] ?? 'unknown',
            'host' => $this->config['host'] ?? 'unknown',
            'database' => $this->config['database'] ?? 'unknown',
            'charset' => $this->config['charset'] ?? 'utf8mb4'
        ];
    }

    /**
     * Establish database connection
     */
    private function connect(): void
    {
        try {
            $dsn = $this->buildDsn();
            $options = $this->getConnectionOptions();
            
            $this->connection = new PDO(
                $dsn,
                $this->config['username'] ?? '',
                $this->config['password'] ?? '',
                $options
            );

            $this->logger->info('Database connection established', [
                'driver' => $this->config['driver'] ?? 'unknown',
                'host' => $this->config['host'] ?? 'unknown'
            ]);

        } catch (PDOException $e) {
            $this->logger->error('Database connection failed', [
                'error' => $e->getMessage(),
                'config' => $this->getSafeConfig()
            ]);
            
            throw $e;
        }
    }

    /**
     * Build DSN string from config
     */
    private function buildDsn(): string
    {
        $driver = $this->config['driver'] ?? 'mysql';
        $host = $this->config['host'] ?? 'localhost';
        $port = $this->config['port'] ?? 3306;
        $database = $this->config['database'] ?? '';
        $charset = $this->config['charset'] ?? 'utf8mb4';

        return match ($driver) {
            'mysql' => "mysql:host={$host};port={$port};dbname={$database};charset={$charset}",
            'pgsql' => "pgsql:host={$host};port={$port};dbname={$database}",
            'sqlite' => "sqlite:{$database}",
            default => throw new \InvalidArgumentException("Unsupported database driver: {$driver}")
        };
    }

    /**
     * Get PDO connection options
     */
    private function getConnectionOptions(): array
    {
        return [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::ATTR_STRINGIFY_FETCHES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];
    }

    /**
     * Get safe config for logging (without sensitive data)
     */
    private function getSafeConfig(): array
    {
        $safe = $this->config;
        unset($safe['password']);
        
        return $safe;
    }
}
