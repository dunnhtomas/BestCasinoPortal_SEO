<?php

declare(strict_types=1);

namespace App\Logger;

use Psr\Log\LoggerInterface;
use Psr\Log\LogLevel;

/**
 * Simple Logger Implementation
 * Basic PSR-3 compliant logger for development
 */
class SimpleLogger implements LoggerInterface
{
    private string $logPath;
    
    public function __construct(?string $logPath = null)
    {
        $this->logPath = $logPath ?? (__DIR__ . '/../../storage/logs/app.log');
        
        // Create log directory if it doesn't exist
        $logDir = dirname($this->logPath);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
    }

    public function emergency($message, array $context = []): void
    {
        $this->log(LogLevel::EMERGENCY, $message, $context);
    }

    public function alert($message, array $context = []): void
    {
        $this->log(LogLevel::ALERT, $message, $context);
    }

    public function critical($message, array $context = []): void
    {
        $this->log(LogLevel::CRITICAL, $message, $context);
    }

    public function error($message, array $context = []): void
    {
        $this->log(LogLevel::ERROR, $message, $context);
    }

    public function warning($message, array $context = []): void
    {
        $this->log(LogLevel::WARNING, $message, $context);
    }

    public function notice($message, array $context = []): void
    {
        $this->log(LogLevel::NOTICE, $message, $context);
    }

    public function info($message, array $context = []): void
    {
        $this->log(LogLevel::INFO, $message, $context);
    }

    public function debug($message, array $context = []): void
    {
        $this->log(LogLevel::DEBUG, $message, $context);
    }

    public function log($level, $message, array $context = []): void
    {
        $timestamp = date('Y-m-d H:i:s');
        $contextStr = empty($context) ? '' : ' ' . json_encode($context);
        
        $logMessage = sprintf(
            "[%s] %s: %s%s" . PHP_EOL,
            $timestamp,
            strtoupper($level),
            $message,
            $contextStr
        );
        
        file_put_contents($this->logPath, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Global helper functions
if (!function_exists('logger')) {
    /**
     * Get a logger instance
     */
    function logger(?string $message = null, array $context = []): LoggerInterface
    {
        static $logger = null;
        
        if ($logger === null) {
            $logger = new SimpleLogger();
        }
        
        if ($message !== null) {
            $logger->info($message, $context);
        }
        
        return $logger;
    }
}
