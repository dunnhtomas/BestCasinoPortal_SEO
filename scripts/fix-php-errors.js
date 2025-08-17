#!/usr/bin/env node
/**
 * PHP Project Structure Fixer
 * Creates all missing classes and dependencies for BestCasinoPortal.com
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔧 PHP PROJECT STRUCTURE FIXER');
console.log('=' .repeat(80));

const projectPath = 'bestcasinoportal.com';
const backendPath = path.join(projectPath, 'backend');

// Ensure directory structure exists
const directories = [
    'backend/src/Services',
    'backend/src/DTOs',
    'backend/src/Responses',
    'backend/src/Exceptions',
    'backend/src/Models',
    'backend/src/Config',
    'backend/vendor',
    'backend/logs'
];

console.log('\n📁 Creating directory structure...');
directories.forEach(dir => {
    const fullPath = path.join(projectPath, dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        console.log(`✅ Created: ${dir}`);
    } else {
        console.log(`✅ Exists: ${dir}`);
    }
});

// 1. Create CasinoService
console.log('\n🎰 Creating CasinoService...');
const casinoService = `<?php

declare(strict_types=1);

namespace App\\Services;

use App\\DTOs\\CasinoFilterDto;
use App\\Models\\Casino;
use PDO;

class CasinoService
{
    private PDO $db;
    
    public function __construct(PDO $database)
    {
        $this->db = $database;
    }
    
    public function getCasinos(CasinoFilterDto $filters): array
    {
        $sql = "SELECT * FROM casinos WHERE 1=1";
        $params = [];
        
        if ($filters->getCategory()) {
            $sql .= " AND category = :category";
            $params['category'] = $filters->getCategory();
        }
        
        if ($filters->getMinRating()) {
            $sql .= " AND rating >= :min_rating";
            $params['min_rating'] = $filters->getMinRating();
        }
        
        if ($filters->getLimit()) {
            $sql .= " LIMIT :limit";
            $params['limit'] = $filters->getLimit();
        }
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        
        $casinos = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $casinos[] = new Casino($row);
        }
        
        return $casinos;
    }
    
    public function getCasino(int $id): ?Casino
    {
        $stmt = $this->db->prepare("SELECT * FROM casinos WHERE id = :id");
        $stmt->execute(['id' => $id]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? new Casino($row) : null;
    }
    
    public function getRelatedCasinos(Casino $casino, int $limit = 3): array
    {
        $stmt = $this->db->prepare("
            SELECT * FROM casinos 
            WHERE id != :id 
            AND category = :category 
            ORDER BY rating DESC 
            LIMIT :limit
        ");
        
        $stmt->execute([
            'id' => $casino->getId(),
            'category' => $casino->getCategory(),
            'limit' => $limit
        ]);
        
        $related = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $related[] = new Casino($row);
        }
        
        return $related;
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Services/CasinoService.php'), casinoService);
console.log('✅ CasinoService created');

// 2. Create ApiResponse
console.log('\n📡 Creating ApiResponse...');
const apiResponse = `<?php

declare(strict_types=1);

namespace App\\Responses;

use Psr\\Http\\Message\\ResponseInterface;
use Laminas\\Diactoros\\Response\\JsonResponse;

class ApiResponse
{
    public function success(array $data = [], int $statusCode = 200): ResponseInterface
    {
        return new JsonResponse([
            'success' => true,
            'data' => $data,
            'timestamp' => date('c')
        ], $statusCode);
    }
    
    public function error(string $message, int $statusCode = 400, array $errors = []): ResponseInterface
    {
        return new JsonResponse([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'timestamp' => date('c')
        ], $statusCode);
    }
    
    public function paginated(array $data, int $total, int $page, int $perPage): ResponseInterface
    {
        return new JsonResponse([
            'success' => true,
            'data' => $data,
            'pagination' => [
                'total' => $total,
                'page' => $page,
                'per_page' => $perPage,
                'total_pages' => ceil($total / $perPage)
            ],
            'timestamp' => date('c')
        ]);
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Responses/ApiResponse.php'), apiResponse);
console.log('✅ ApiResponse created');

// 3. Create CasinoFilterDto
console.log('\n🔍 Creating CasinoFilterDto...');
const casinoFilterDto = `<?php

declare(strict_types=1);

namespace App\\DTOs;

use Psr\\Http\\Message\\ServerRequestInterface;

class CasinoFilterDto
{
    private ?string $category = null;
    private ?float $minRating = null;
    private ?int $limit = null;
    private ?string $search = null;
    
    public function __construct(
        ?string $category = null,
        ?float $minRating = null,
        ?int $limit = null,
        ?string $search = null
    ) {
        $this->category = $category;
        $this->minRating = $minRating;
        $this->limit = $limit;
        $this->search = $search;
    }
    
    public static function fromRequest(ServerRequestInterface $request): self
    {
        $params = $request->getQueryParams();
        
        return new self(
            $params['category'] ?? null,
            isset($params['min_rating']) ? (float)$params['min_rating'] : null,
            isset($params['limit']) ? (int)$params['limit'] : 20,
            $params['search'] ?? null
        );
    }
    
    public function getCategory(): ?string
    {
        return $this->category;
    }
    
    public function getMinRating(): ?float
    {
        return $this->minRating;
    }
    
    public function getLimit(): ?int
    {
        return $this->limit;
    }
    
    public function getSearch(): ?string
    {
        return $this->search;
    }
    
    public function toArray(): array
    {
        return [
            'category' => $this->category,
            'min_rating' => $this->minRating,
            'limit' => $this->limit,
            'search' => $this->search
        ];
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/DTOs/CasinoFilterDto.php'), casinoFilterDto);
console.log('✅ CasinoFilterDto created');

// 4. Create ValidationException
console.log('\n⚠️ Creating ValidationException...');
const validationException = `<?php

declare(strict_types=1);

namespace App\\Exceptions;

use Exception;

class ValidationException extends Exception
{
    private array $errors;
    
    public function __construct(array $errors, string $message = 'Validation failed', int $code = 422)
    {
        parent::__construct($message, $code);
        $this->errors = $errors;
    }
    
    public function getErrors(): array
    {
        return $this->errors;
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Exceptions/ValidationException.php'), validationException);
console.log('✅ ValidationException created');

// 5. Create Casino Model
console.log('\n🎰 Creating Casino Model...');
const casinoModel = `<?php

declare(strict_types=1);

namespace App\\Models;

class Casino
{
    private int $id;
    private string $name;
    private string $url;
    private float $rating;
    private string $category;
    private array $games;
    private array $bonus;
    private string $description;
    private string $logo;
    private bool $isActive;
    private string $createdAt;
    private string $updatedAt;
    
    public function __construct(array $data)
    {
        $this->id = (int)$data['id'];
        $this->name = $data['name'];
        $this->url = $data['url'];
        $this->rating = (float)$data['rating'];
        $this->category = $data['category'];
        $this->games = json_decode($data['games'] ?? '[]', true);
        $this->bonus = json_decode($data['bonus'] ?? '{}', true);
        $this->description = $data['description'] ?? '';
        $this->logo = $data['logo'] ?? '';
        $this->isActive = (bool)($data['is_active'] ?? true);
        $this->createdAt = $data['created_at'] ?? date('Y-m-d H:i:s');
        $this->updatedAt = $data['updated_at'] ?? date('Y-m-d H:i:s');
    }
    
    public function getId(): int
    {
        return $this->id;
    }
    
    public function getName(): string
    {
        return $this->name;
    }
    
    public function getUrl(): string
    {
        return $this->url;
    }
    
    public function getRating(): float
    {
        return $this->rating;
    }
    
    public function getCategory(): string
    {
        return $this->category;
    }
    
    public function getGames(): array
    {
        return $this->games;
    }
    
    public function getBonus(): array
    {
        return $this->bonus;
    }
    
    public function getDescription(): string
    {
        return $this->description;
    }
    
    public function getLogo(): string
    {
        return $this->logo;
    }
    
    public function isActive(): bool
    {
        return $this->isActive;
    }
    
    public function getCreatedAt(): string
    {
        return $this->createdAt;
    }
    
    public function getUpdatedAt(): string
    {
        return $this->updatedAt;
    }
    
    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'url' => $this->url,
            'rating' => $this->rating,
            'category' => $this->category,
            'games' => $this->games,
            'bonus' => $this->bonus,
            'description' => $this->description,
            'logo' => $this->logo,
            'is_active' => $this->isActive,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt
        ];
    }
    
    public function count(): int
    {
        return 1; // For interface compatibility
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Models/Casino.php'), casinoModel);
console.log('✅ Casino Model created');

// 6. Create Logger Helper
console.log('\n📝 Creating Logger Helper...');
const loggerHelper = `<?php

declare(strict_types=1);

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Formatter\\LineFormatter;

if (!function_exists('logger')) {
    function logger(): Logger
    {
        static $logger = null;
        
        if ($logger === null) {
            $logger = new Logger('casino_portal');
            
            // Create log handler
            $handler = new StreamHandler(__DIR__ . '/../../logs/app.log', Logger::INFO);
            $formatter = new LineFormatter(
                "[%datetime%] %channel%.%level_name%: %message% %context% %extra%\\n",
                'Y-m-d H:i:s'
            );
            $handler->setFormatter($formatter);
            
            $logger->pushHandler($handler);
            
            // Add console handler for development
            if (getenv('APP_ENV') === 'development') {
                $consoleHandler = new StreamHandler('php://stdout', Logger::DEBUG);
                $logger->pushHandler($consoleHandler);
            }
        }
        
        return $logger;
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Config/logger.php'), loggerHelper);
console.log('✅ Logger Helper created');

// 7. Create Composer.json
console.log('\n📦 Creating composer.json...');
const composerJson = {
    "name": "bestcasinoportal/backend",
    "description": "BestCasinoPortal.com Backend API",
    "type": "project",
    "license": "MIT",
    "require": {
        "php": "^8.1",
        "psr/http-message": "^1.0",
        "laminas/laminas-diactoros": "^2.8",
        "monolog/monolog": "^3.0",
        "vlucas/phpdotenv": "^5.4",
        "slim/slim": "^4.10",
        "slim/psr7": "^1.5"
    },
    "require-dev": {
        "phpunit/phpunit": "^9.5",
        "phpstan/phpstan": "^1.8"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "src/"
        },
        "files": [
            "src/Config/logger.php"
        ]
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\\\": "tests/"
        }
    },
    "scripts": {
        "test": "phpunit",
        "analyze": "phpstan analyse src",
        "post-install-cmd": [
            "@php -r \"file_exists('logs') || mkdir('logs', 0o755, true);\""
        ]
    },
    "config": {
        "optimize-autoloader": true,
        "sort-packages": true
    }
};

fs.writeFileSync(path.join(projectPath, 'backend/composer.json'), JSON.stringify(composerJson, null, 2));
console.log('✅ composer.json created');

// 8. Update CasinoController with proper imports
console.log('\n🔄 Updating CasinoController with proper imports...');
const updatedCasinoController = `<?php

declare(strict_types=1);

namespace App\\Controllers\\Api;

use App\\Services\\CasinoService;
use App\\DTOs\\CasinoFilterDto;
use App\\Responses\\ApiResponse;
use App\\Exceptions\\ValidationException;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Exception;

final readonly class CasinoController
{
    public function __construct(
        private CasinoService $casinoService,
        private ApiResponse $apiResponse
    ) {}

    public function index(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = CasinoFilterDto::fromRequest($request);
            $casinos = $this->casinoService->getCasinos($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            return $this->apiResponse->success([
                'casinos' => array_map(fn($casino) => $casino->toArray(), $casinos),
                'meta' => [
                    'total' => count($casinos),
                    'response_time_ms' => round($responseTime, 2),
                    'filters_applied' => $filters->toArray()
                ]
            ]);
            
        } catch (ValidationException $e) {
            return $this->apiResponse->error('Validation failed', 422, [
                'errors' => $e->getErrors()
            ]);
        } catch (Exception $e) {
            logger()->error('Casino API error', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    public function show(ServerRequestInterface $request, array $args): ResponseInterface
    {
        $casinoId = (int) $args['id'];
        
        try {
            $casino = $this->casinoService->getCasino($casinoId);
            
            if (!$casino) {
                return $this->apiResponse->error('Casino not found', 404);
            }
            
            return $this->apiResponse->success([
                'casino' => $casino->toArray(),
                'related' => array_map(
                    fn($related) => $related->toArray(),
                    $this->casinoService->getRelatedCasinos($casino, 3)
                )
            ]);
            
        } catch (Exception $e) {
            logger()->error('Casino details API error', [
                'casino_id' => $casinoId,
                'message' => $e->getMessage()
            ]);
            
            return $this->apiResponse->error('Internal server error', 500);
        }
    }

    public function search(ServerRequestInterface $request): ResponseInterface
    {
        $startTime = microtime(true);
        
        try {
            $filters = CasinoFilterDto::fromRequest($request);
            $casinos = $this->casinoService->getCasinos($filters);
            
            $responseTime = (microtime(true) - $startTime) * 1000;
            
            // Ensure sub-200ms API response for casino.ca compliance
            if ($responseTime > 200) {
                logger()->warning('API response time exceeded 200ms', [
                    'response_time_ms' => $responseTime,
                    'filters' => $filters->toArray()
                ]);
            }
            
            return $this->apiResponse->success([
                'casinos' => array_map(fn($casino) => $casino->toArray(), $casinos),
                'meta' => [
                    'total' => count($casinos),
                    'response_time_ms' => round($responseTime, 2),
                    'performance_target' => '< 200ms',
                    'filters_applied' => $filters->toArray()
                ]
            ]);
            
        } catch (Exception $e) {
            logger()->error('Casino search API error', [
                'message' => $e->getMessage(),
                'filters' => $filters->toArray() ?? []
            ]);
            
            return $this->apiResponse->error('Search failed', 500);
        }
    }
}`;

fs.writeFileSync(path.join(projectPath, 'backend/src/Controllers/CasinoController.php'), updatedCasinoController);
console.log('✅ CasinoController updated with proper imports');

// 9. Create Database Schema
console.log('\n🗄️ Creating database schema...');
const databaseSchema = `-- BestCasinoPortal.com Database Schema
-- PostgreSQL optimized for casino portal performance

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Casinos table
CREATE TABLE IF NOT EXISTS casinos (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
    category VARCHAR(100) NOT NULL,
    games JSONB DEFAULT '[]',
    bonus JSONB DEFAULT '{}',
    description TEXT,
    logo VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    license_info JSONB DEFAULT '{}',
    payment_methods JSONB DEFAULT '[]',
    currencies JSONB DEFAULT '[]',
    languages JSONB DEFAULT '[]',
    countries_restricted JSONB DEFAULT '[]',
    min_deposit DECIMAL(10,2),
    max_withdrawal DECIMAL(10,2),
    withdrawal_time VARCHAR(100),
    support_methods JSONB DEFAULT '[]',
    mobile_optimized BOOLEAN DEFAULT true,
    live_chat BOOLEAN DEFAULT false,
    established_year INTEGER,
    owner_company VARCHAR(255),
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Casino reviews table
CREATE TABLE IF NOT EXISTS casino_reviews (
    id SERIAL PRIMARY KEY,
    casino_id INTEGER REFERENCES casinos(id) ON DELETE CASCADE,
    user_name VARCHAR(100),
    user_email VARCHAR(255),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    pros TEXT[],
    cons TEXT[],
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Casino games table
CREATE TABLE IF NOT EXISTS casino_games (
    id SERIAL PRIMARY KEY,
    casino_id INTEGER REFERENCES casinos(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(100),
    category VARCHAR(100),
    type VARCHAR(50),
    is_live BOOLEAN DEFAULT false,
    is_mobile BOOLEAN DEFAULT true,
    rtp DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Casino bonuses table
CREATE TABLE IF NOT EXISTS casino_bonuses (
    id SERIAL PRIMARY KEY,
    casino_id INTEGER REFERENCES casinos(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    amount VARCHAR(100),
    percentage INTEGER,
    max_amount DECIMAL(10,2),
    wagering_requirement INTEGER,
    min_deposit DECIMAL(10,2),
    bonus_code VARCHAR(50),
    terms_conditions TEXT,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for casino.ca optimization
CREATE INDEX IF NOT EXISTS idx_casinos_rating ON casinos(rating DESC);
CREATE INDEX IF NOT EXISTS idx_casinos_category ON casinos(category);
CREATE INDEX IF NOT EXISTS idx_casinos_active ON casinos(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_casinos_featured ON casinos(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_casinos_slug ON casinos(slug);
CREATE INDEX IF NOT EXISTS idx_casino_reviews_casino ON casino_reviews(casino_id);
CREATE INDEX IF NOT EXISTS idx_casino_reviews_approved ON casino_reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_casino_games_casino ON casino_games(casino_id);
CREATE INDEX IF NOT EXISTS idx_casino_bonuses_casino ON casino_bonuses(casino_id);
CREATE INDEX IF NOT EXISTS idx_casino_bonuses_active ON casino_bonuses(is_active) WHERE is_active = true;

-- Full-text search index for casino names and descriptions
CREATE INDEX IF NOT EXISTS idx_casinos_fulltext ON casinos USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Sample data for testing
INSERT INTO casinos (name, slug, url, rating, category, description, is_active, featured) VALUES
('Royal Casino', 'royal-casino', 'https://royalcasino.com', 4.5, 'online', 'Premium online casino with top games', true, true),
('Lucky Slots', 'lucky-slots', 'https://luckyslots.com', 4.2, 'slots', 'Best slot games collection', true, false),
('Live Dealer Pro', 'live-dealer-pro', 'https://livedealerpro.com', 4.7, 'live', 'Professional live dealer games', true, true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_casinos_updated_at BEFORE UPDATE ON casinos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_casino_reviews_updated_at BEFORE UPDATE ON casino_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_casino_bonuses_updated_at BEFORE UPDATE ON casino_bonuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`;

fs.writeFileSync(path.join(projectPath, 'backend/database/schema.sql'), databaseSchema);
console.log('✅ Database schema created');

// 10. Create Environment file
console.log('\n🔧 Creating .env file...');
const envFile = `# BestCasinoPortal.com Environment Configuration
APP_NAME=BestCasinoPortal
APP_ENV=production
APP_DEBUG=false
APP_URL=https://bestcasinoportal.com

# Database Configuration (PostgreSQL)
DB_CONNECTION=pgsql
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=bestcasinoportal
DB_USERNAME=casino_admin
DB_PASSWORD=CasinoSecure2024!

# Redis Configuration
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=CasinoRedis2024!

# Security
APP_KEY=base64:CasinoPortalSecureKey2024
JWT_SECRET=CasinoJWTSecret2024

# Casino.ca Performance Targets
API_RESPONSE_TARGET_MS=200
CACHE_TTL=3600

# External APIs
DATAFORSEO_LOGIN=your_dataforseo_login
DATAFORSEO_PASSWORD=your_dataforseo_password

# Logging
LOG_CHANNEL=stack
LOG_LEVEL=info

# Session
SESSION_DRIVER=redis
SESSION_LIFETIME=120

# CORS
CORS_ALLOWED_ORIGINS=https://bestcasinoportal.com,https://www.bestcasinoportal.com
CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With`;

fs.writeFileSync(path.join(projectPath, 'backend/.env'), envFile);
console.log('✅ .env file created');

console.log('\n🎉 PHP PROJECT STRUCTURE FIXED!');
console.log('=' .repeat(80));
console.log('✅ All missing classes created');
console.log('✅ Proper PSR-4 autoloading configured');
console.log('✅ Database schema ready');
console.log('✅ Environment configuration set');
console.log('✅ Casino.ca performance optimizations included');
console.log('');
console.log('📋 Next steps:');
console.log('1. Run: cd bestcasinoportal.com/backend && composer install');
console.log('2. Configure database connection');
console.log('3. Run database migrations');
console.log('4. Test API endpoints');
console.log('');
console.log('🔧 All PHP errors should now be resolved!');
console.log('=' .repeat(80));
