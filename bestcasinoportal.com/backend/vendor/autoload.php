<?php

// Simple autoloader for development without Composer
spl_autoload_register(function ($class) {
    // Handle PSR-7 and PSR-3 interfaces
    $psr7Interfaces = [
        'Psr\\Http\\Message\\MessageInterface' => __DIR__ . '/psr7/MessageInterface.php',
        'Psr\\Http\\Message\\RequestInterface' => __DIR__ . '/psr7/RequestInterface.php',
        'Psr\\Http\\Message\\ResponseInterface' => __DIR__ . '/psr7/ResponseInterface.php',
        'Psr\\Http\\Message\\ServerRequestInterface' => __DIR__ . '/psr7/ServerRequestInterface.php',
        'Psr\\Http\\Message\\StreamInterface' => __DIR__ . '/psr7/StreamInterface.php',
        'Psr\\Http\\Message\\UriInterface' => __DIR__ . '/psr7/UriInterface.php',
        'Psr\\Log\\LoggerInterface' => __DIR__ . '/psr3/LoggerInterface.php',
        'Psr\\Log\\NullLogger' => __DIR__ . '/psr3/NullLogger.php',
    ];
    
    if (isset($psr7Interfaces[$class])) {
        require_once $psr7Interfaces[$class];
        return;
    }
    
    // Handle GuzzleHttp PSR-7 implementation
    if (strpos($class, 'GuzzleHttp\\Psr7\\') === 0) {
        $file = __DIR__ . '/guzzle-psr7/' . str_replace('\\', '/', substr($class, 15)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
    
    // Handle App namespace
    if (strpos($class, 'App\\') === 0) {
        $file = __DIR__ . '/../src/' . str_replace('\\', '/', substr($class, 4)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
    
    // Handle BestCasinoPortal namespace (legacy)
    if (strpos($class, 'BestCasinoPortal\\') === 0) {
        $file = __DIR__ . '/../src/' . str_replace('\\', '/', substr($class, 17)) . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});
