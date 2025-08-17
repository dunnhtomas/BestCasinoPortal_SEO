<?php

declare(strict_types=1);

namespace BestCasinoPortal\Repositories;

use BestCasinoPortal\Models\Casino;
use BestCasinoPortal\DTOs\CasinoFilterDto;
use BestCasinoPortal\Database\Database;
use PDO;
use PDOException;
use Psr\Log\LoggerInterface;

/**
 * Casino Repository - Data access layer for casino operations
 * Implements repository pattern with PDO and performance optimization
 * Following Context7 best practices for database operations
 */
final readonly class CasinoRepository
{
    public function __construct(
        private Database $database,
        private LoggerInterface $logger
    ) {}

    /**
     * Find casinos with filters applied
     * Uses PDO prepared statements for security and performance
     */
    public function findWithFilters(CasinoFilterDto $filters): array
    {
        try {
            $pdo = $this->database->getConnection();
            
            $whereConditions = ['c.is_active = 1'];
            $params = [];
            $joins = [];

            // Build WHERE conditions based on filters
            if ($filters->search) {
                $whereConditions[] = "(c.name LIKE :search OR c.description LIKE :search)";
                $params['search'] = "%{$filters->search}%";
            }

            if ($filters->minRating !== null) {
                $whereConditions[] = "c.rating >= :min_rating";
                $params['min_rating'] = $filters->minRating;
            }

            if ($filters->maxRating !== null) {
                $whereConditions[] = "c.rating <= :max_rating";
                $params['max_rating'] = $filters->maxRating;
            }

            if ($filters->minBonus !== null) {
                $whereConditions[] = "c.bonus_amount >= :min_bonus";
                $params['min_bonus'] = $filters->minBonus;
            }

            if ($filters->maxBonus !== null) {
                $whereConditions[] = "c.bonus_amount <= :max_bonus";
                $params['max_bonus'] = $filters->maxBonus;
            }

            if ($filters->categories) {
                $joins[] = "INNER JOIN casino_categories cc ON c.id = cc.casino_id";
                $joins[] = "INNER JOIN categories cat ON cc.category_id = cat.id";
                $placeholders = implode(',', array_fill(0, count($filters->categories), '?'));
                $whereConditions[] = "cat.slug IN ($placeholders)";
                $params = array_merge($params, $filters->categories);
            }

            if ($filters->countries) {
                $joins[] = "INNER JOIN casino_countries ccoun ON c.id = ccoun.casino_id";
                $joins[] = "INNER JOIN countries coun ON ccoun.country_id = coun.id";
                $placeholders = implode(',', array_fill(0, count($filters->countries), '?'));
                $whereConditions[] = "coun.code IN ($placeholders) AND ccoun.is_restricted = 0";
                $params = array_merge($params, $filters->countries);
            }

            // Build ORDER BY clause
            $orderBy = match ($filters->sortBy) {
                'rating' => 'c.rating',
                'bonus_amount' => 'c.bonus_amount', 
                'name' => 'c.name',
                'created_at' => 'c.created_at',
                default => 'c.rating'
            };
            
            $orderDirection = ($filters->sortDirection === 'asc') ? 'ASC' : 'DESC';

            // Build final SQL query
            $joinSql = implode(' ', $joins);
            $whereSql = implode(' AND ', $whereConditions);
            
            $sql = "
                SELECT DISTINCT c.*
                FROM casinos c
                {$joinSql}
                WHERE {$whereSql}
                ORDER BY {$orderBy} {$orderDirection}
            ";

            // Add pagination
            if ($filters->limit) {
                $sql .= " LIMIT :limit";
                $params['limit'] = $filters->limit;
            }
            
            if ($filters->offset) {
                $sql .= " OFFSET :offset";
                $params['offset'] = $filters->offset;
            }

            $stmt = $pdo->prepare($sql);
            
            // Bind parameters with correct types
            foreach ($params as $key => $value) {
                $type = is_int($value) ? PDO::PARAM_INT : PDO::PARAM_STR;
                if (is_string($key)) {
                    $stmt->bindValue(":$key", $value, $type);
                } else {
                    $stmt->bindValue($key + 1, $value, $type);
                }
            }
            
            $stmt->execute();
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

            // Convert to Casino objects
            return array_map(fn($row) => Casino::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Database error in findWithFilters', [
                'message' => $e->getMessage(),
                'filters' => $filters->toArray()
            ]);
            throw $e;
        }
    }

    /**
     * Find casino by ID
     */
    public function findById(int $casinoId): ?Casino
    {
        try {
            $pdo = $this->database->getConnection();
            
            $sql = "SELECT * FROM casinos WHERE id = :id AND is_active = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':id', $casinoId, PDO::PARAM_INT);
            $stmt->execute();
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            
            return $result ? Casino::fromArray($result) : null;

        } catch (PDOException $e) {
            $this->logger->error('Database error in findById', [
                'casino_id' => $casinoId,
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Find related casinos based on similarity
     */
    public function findRelated(Casino $casino, int $limit = 3): array
    {
        try {
            $pdo = $this->database->getConnection();
            
            $sql = "
                SELECT c.*
                FROM casinos c
                WHERE c.id != :casino_id 
                  AND c.is_active = 1
                  AND c.rating BETWEEN :min_rating AND :max_rating
                ORDER BY c.rating DESC
                LIMIT :limit
            ";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':casino_id', $casino->id, PDO::PARAM_INT);
            $stmt->bindValue(':min_rating', max(0, $casino->rating - 0.5), PDO::PARAM_STR);
            $stmt->bindValue(':max_rating', min(5, $casino->rating + 0.5), PDO::PARAM_STR);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return array_map(fn($row) => Casino::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Database error in findRelated', [
                'casino_id' => $casino->id,
                'limit' => $limit,
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Find multiple casinos by IDs
     */
    public function findMultiple(array $casinoIds): array
    {
        try {
            if (empty($casinoIds)) {
                return [];
            }
            
            $pdo = $this->database->getConnection();
            
            $placeholders = implode(',', array_fill(0, count($casinoIds), '?'));
            $sql = "
                SELECT * 
                FROM casinos 
                WHERE id IN ($placeholders) 
                  AND is_active = 1
                ORDER BY rating DESC
            ";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute($casinoIds);
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return array_map(fn($row) => Casino::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Database error in findMultiple', [
                'casino_ids' => $casinoIds,
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Search casinos with full text search
     */
    public function search(string $query, CasinoFilterDto $filters): array
    {
        try {
            $pdo = $this->database->getConnection();
            
            $whereConditions = [
                'c.is_active = 1',
                "(c.name LIKE :search OR c.description LIKE :search)"
            ];
            $params = ['search' => "%{$query}%"];

            // Apply additional filters
            if ($filters->minRating !== null) {
                $whereConditions[] = "c.rating >= :min_rating";
                $params['min_rating'] = $filters->minRating;
            }

            if ($filters->maxRating !== null) {
                $whereConditions[] = "c.rating <= :max_rating";
                $params['max_rating'] = $filters->maxRating;
            }

            $whereSql = implode(' AND ', $whereConditions);
            
            $sql = "
                SELECT c.*
                FROM casinos c
                WHERE {$whereSql}
                ORDER BY c.rating DESC
                LIMIT :limit
            ";
            
            $stmt = $pdo->prepare($sql);
            foreach ($params as $key => $value) {
                $stmt->bindValue(":$key", $value);
            }
            $stmt->bindValue(':limit', $filters->limit ?: 20, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return array_map(fn($row) => Casino::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Database error in search', [
                'query' => $query,
                'filters' => $filters->toArray(),
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get casino statistics
     */
    public function getStatistics(): array
    {
        try {
            $pdo = $this->database->getConnection();
            
            // Get basic counts
            $countsStmt = $pdo->query("
                SELECT 
                    COUNT(*) as total_casinos,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_casinos,
                    COUNT(CASE WHEN is_featured = 1 AND is_active = 1 THEN 1 END) as featured_casinos
                FROM casinos
            ");
            $counts = $countsStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get rating statistics
            $ratingStmt = $pdo->query("
                SELECT 
                    ROUND(AVG(rating), 2) as average_rating,
                    MAX(bonus_amount) as highest_bonus
                FROM casinos 
                WHERE is_active = 1
            ");
            $ratings = $ratingStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get newest casino
            $newestStmt = $pdo->query("
                SELECT * 
                FROM casinos 
                WHERE is_active = 1 
                ORDER BY created_at DESC 
                LIMIT 1
            ");
            $newest = $newestStmt->fetch(PDO::FETCH_ASSOC);
            
            // Get top rated casinos
            $topRatedStmt = $pdo->query("
                SELECT * 
                FROM casinos 
                WHERE is_active = 1 
                ORDER BY rating DESC 
                LIMIT 5
            ");
            $topRated = $topRatedStmt->fetchAll(PDO::FETCH_ASSOC);

            return [
                'total_casinos' => (int) $counts['total_casinos'],
                'active_casinos' => (int) $counts['active_casinos'],
                'featured_casinos' => (int) $counts['featured_casinos'],
                'average_rating' => (float) $ratings['average_rating'],
                'highest_bonus' => (int) $ratings['highest_bonus'],
                'newest_casino' => $newest ? Casino::fromArray($newest) : null,
                'top_rated' => array_map(fn($row) => Casino::fromArray($row), $topRated)
            ];

        } catch (PDOException $e) {
            $this->logger->error('Database error in getStatistics', [
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }

    /**
     * Get featured casinos
     */
    public function getFeatured(int $limit = 10): array
    {
        try {
            $pdo = $this->database->getConnection();
            
            $sql = "
                SELECT * 
                FROM casinos 
                WHERE is_featured = 1 AND is_active = 1 
                ORDER BY rating DESC 
                LIMIT :limit
            ";
            
            $stmt = $pdo->prepare($sql);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->execute();
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return array_map(fn($row) => Casino::fromArray($row), $results);

        } catch (PDOException $e) {
            $this->logger->error('Database error in getFeatured', [
                'limit' => $limit,
                'message' => $e->getMessage()
            ]);
            return [];
        }
    }
}
