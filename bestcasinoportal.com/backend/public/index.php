<?php

declare(strict_types=1);

// Simple PSR-7 like Response class for demo
class SimpleResponse {
    private int $statusCode;
    private array $headers;
    private string $body;
    
    public function __construct(int $statusCode = 200, array $headers = [], string $body = '') {
        $this->statusCode = $statusCode;
        $this->headers = $headers;
        $this->body = $body;
    }
    
    public function getStatusCode(): int { return $this->statusCode; }
    public function getHeaders(): array { return $this->headers; }
    public function getBody(): string { return $this->body; }
}

// Simple logger class
class SimpleLogger {
    public function info($message, array $context = []): void {}
    public function error($message, array $context = []): void {}
    public function debug($message, array $context = []): void {}
}

// Simple cache class
class SimpleCache {
    private array $data = [];
    public function get(string $key, $default = null) { return $this->data[$key] ?? $default; }
    public function set(string $key, $value, int $ttl = 3600): void { $this->data[$key] = $value; }
    public function delete(string $key): void { unset($this->data[$key]); }
    public function clear(): void { $this->data = []; }
}

// Enable CORS for development
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Set content type for API responses
header('Content-Type: application/json; charset=utf-8');

// Security headers
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');
header('Strict-Transport-Security: max-age=31536000; includeSubDomains');

try {
    // Get request URI and method
    $requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $requestMethod = $_SERVER['REQUEST_METHOD'];
    
    // Initialize simple dependencies for demo
    $logger = new SimpleLogger();
    $cache = new SimpleCache();
    
    // Route requests
    switch (true) {
        case $requestUri === '/api/health' && $requestMethod === 'GET':
            $response = new SimpleResponse(200, [], json_encode([
                'status' => 'healthy',
                'timestamp' => date('c'),
                'server' => 'BestCasinoPortal PHP API',
                'version' => '1.0.0',
                'response_time_ms' => 0,
                'dependencies' => [
                    'cache' => 'active',
                    'logger' => 'initialized'
                ]
            ]));
            break;
            
        case $requestUri === '/api/casinos' && $requestMethod === 'GET':
            $filters = $_GET;
            
            // Mock casino data for demo
            $casinos = [
                [
                    'id' => 1,
                    'name' => 'Best Casino Portal',
                    'bonus' => ['amount' => '$500', 'type' => 'Welcome Bonus'],
                    'rating' => 4.8,
                    'games' => ['count' => 2500],
                    'logo' => '/images/casino-1.jpg',
                    'url' => 'https://bestcasinoportal.com',
                    'slug' => 'best-casino-portal'
                ],
                [
                    'id' => 2,
                    'name' => 'Premium Gaming Club',
                    'bonus' => ['amount' => '$750', 'type' => 'First Deposit Bonus'],
                    'rating' => 4.6,
                    'games' => ['count' => 1800],
                    'logo' => '/images/casino-2.jpg',
                    'url' => 'https://premiumgaming.com',
                    'slug' => 'premium-gaming-club'
                ]
            ];
            
            $response = new SimpleResponse(200, [], json_encode([
                'data' => $casinos,
                'meta' => [
                    'total' => count($casinos),
                    'response_time_ms' => 45,
                    'filters_applied' => $filters
                ]
            ]));
            break;
            
        case preg_match('/^\/api\/casinos\/(\d+)$/', $requestUri, $matches) && $requestMethod === 'GET':
            $casinoId = (int) $matches[1];
            
            // Mock single casino data
            if ($casinoId === 1) {
                $casino = [
                    'id' => 1,
                    'name' => 'Best Casino Portal',
                    'bonus' => ['amount' => '$500', 'type' => 'Welcome Bonus'],
                    'rating' => 4.8,
                    'games' => ['count' => 2500],
                    'logo' => '/images/casino-1.jpg',
                    'url' => 'https://bestcasinoportal.com',
                    'slug' => 'best-casino-portal',
                    'description' => 'Top-rated online casino with excellent games and bonuses.',
                    'features' => ['Live Chat Support', '24/7 Customer Service', 'Mobile Optimized']
                ];
                
                $response = new SimpleResponse(200, [], json_encode([
                    'data' => $casino,
                    'meta' => [
                        'response_time_ms' => 23
                    ]
                ]));
            } else {
                $response = new SimpleResponse(404, [], json_encode([
                    'error' => 'Casino not found',
                    'casino_id' => $casinoId
                ]));
            }
            break;
            
        case $requestUri === '/api/games' && $requestMethod === 'GET':
            // Mock games response
            $games = [
                [
                    'id' => 1,
                    'name' => 'Blackjack',
                    'category' => 'table-games',
                    'provider' => 'Evolution Gaming',
                    'rtp' => 99.29,
                    'thumbnail' => '/images/games/blackjack.jpg'
                ],
                [
                    'id' => 2, 
                    'name' => 'Starburst',
                    'category' => 'slots',
                    'provider' => 'NetEnt',
                    'rtp' => 96.09,
                    'thumbnail' => '/images/games/starburst.jpg'
                ],
                [
                    'id' => 3,
                    'name' => 'European Roulette',
                    'category' => 'table-games',
                    'provider' => 'Microgaming',
                    'rtp' => 97.30,
                    'thumbnail' => '/images/games/roulette.jpg'
                ]
            ];
            
            $response = new SimpleResponse(200, [], json_encode([
                'data' => $games,
                'meta' => [
                    'total' => count($games),
                    'response_time_ms' => 67
                ]
            ]));
            break;
            
        case $requestUri === '/api/auth/login' && $requestMethod === 'POST':
            $body = file_get_contents('php://input');
            $input = json_decode($body, true);
            
            // Mock authentication for development
            if (($input['email'] ?? '') === 'admin@bestcasinoportal.com' && 
                ($input['password'] ?? '') === 'password') {
                $response = new SimpleResponse(200, [], json_encode([
                    'success' => true,
                    'token' => 'mock-jwt-token-' . time(),
                    'user' => [
                        'id' => 1,
                        'email' => 'admin@bestcasinoportal.com',
                        'role' => 'admin'
                    ]
                ]));
            } else {
                $response = new SimpleResponse(401, [], json_encode([
                    'error' => 'Invalid credentials'
                ]));
            }
            break;
            
        default:
            $response = new SimpleResponse(404, [], json_encode([
                'error' => 'Endpoint not found',
                'path' => $requestUri,
                'method' => $requestMethod,
                'available_endpoints' => [
                    'GET /api/health',
                    'GET /api/casinos',
                    'GET /api/casinos/{id}',
                    'GET /api/games',
                    'POST /api/auth/login'
                ]
            ]));
            break;
    }
    
    // Send response
    http_response_code($response->getStatusCode());
    foreach ($response->getHeaders() as $name => $values) {
        if (is_array($values)) {
            header($name . ': ' . implode(', ', $values));
        } else {
            header($name . ': ' . $values);
        }
    }
    echo $response->getBody();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage(),
        'timestamp' => date('c'),
        'trace' => $e->getTraceAsString()
    ]);
    
    // Log error for debugging
    error_log("API Error: " . $e->getMessage() . " in " . $e->getFile() . ":" . $e->getLine());
}
