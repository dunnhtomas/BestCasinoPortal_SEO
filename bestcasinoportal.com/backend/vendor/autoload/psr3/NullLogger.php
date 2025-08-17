<?php

namespace Psr\Log;

/**
 * PSR-3 compliant NullLogger implementation
 * This logger simply discards all log messages.
 * 
 * @package Psr\Log
 */
class NullLogger implements LoggerInterface
{
    /**
     * System is unusable.
     */
    public function emergency($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Action must be taken immediately.
     */
    public function alert($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Critical conditions.
     */
    public function critical($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Runtime errors that do not require immediate action.
     */
    public function error($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Exceptional occurrences that are not errors.
     */
    public function warning($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Normal but significant events.
     */
    public function notice($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Interesting events.
     */
    public function info($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Detailed debug information.
     */
    public function debug($message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }

    /**
     * Logs with an arbitrary level.
     */
    public function log($level, $message, array $context = []): void
    {
        // Intentionally empty - null logger discards all messages
    }
}
