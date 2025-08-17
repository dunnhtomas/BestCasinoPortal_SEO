<?php

namespace Psr\Log;

/**
 * PSR-3 Logger Interface
 * 
 * Describes a logger instance.
 * 
 * The message MUST be a string or object implementing __toString().
 * 
 * The message MAY contain placeholders in the form: {foo} where foo
 * will be replaced by the context data in key "foo".
 * 
 * The context array can contain arbitrary data, the only assumption that
 * can be made by implementors is that if an Exception instance is given
 * to produce a stack trace, it MUST be in a key named "exception".
 * 
 * See https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-3-logger-interface.md
 * for the full interface specification.
 */
interface LoggerInterface
{
    /**
     * System is unusable.
     */
    public function emergency($message, array $context = []): void;

    /**
     * Action must be taken immediately.
     */
    public function alert($message, array $context = []): void;

    /**
     * Critical conditions.
     */
    public function critical($message, array $context = []): void;

    /**
     * Runtime errors that do not require immediate action but should typically
     * be logged and monitored.
     */
    public function error($message, array $context = []): void;

    /**
     * Exceptional occurrences that are not errors.
     */
    public function warning($message, array $context = []): void;

    /**
     * Normal but significant events.
     */
    public function notice($message, array $context = []): void;

    /**
     * Interesting events.
     */
    public function info($message, array $context = []): void;

    /**
     * Detailed debug information.
     */
    public function debug($message, array $context = []): void;

    /**
     * Logs with an arbitrary level.
     */
    public function log($level, $message, array $context = []): void;
}
