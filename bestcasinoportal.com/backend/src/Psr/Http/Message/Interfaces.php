<?php

declare(strict_types=1);

namespace Psr\Http\Message;

/**
 * PSR-7 Message Interface
 */
interface MessageInterface
{
    public function getProtocolVersion(): string;
    public function withProtocolVersion(string $version): MessageInterface;
    public function getHeaders(): array;
    public function hasHeader(string $name): bool;
    public function getHeader(string $name): array;
    public function getHeaderLine(string $name): string;
    public function withHeader(string $name, $value): MessageInterface;
    public function withAddedHeader(string $name, $value): MessageInterface;
    public function withoutHeader(string $name): MessageInterface;
    public function getBody(): StreamInterface;
    public function withBody(StreamInterface $body): MessageInterface;
}

/**
 * PSR-7 Request Interface
 */
interface RequestInterface extends MessageInterface
{
    public function getRequestTarget(): string;
    public function withRequestTarget(string $requestTarget): RequestInterface;
    public function getMethod(): string;
    public function withMethod(string $method): RequestInterface;
    public function getUri(): UriInterface;
    public function withUri(UriInterface $uri, bool $preserveHost = false): RequestInterface;
}

/**
 * PSR-7 Server Request Interface
 */
interface ServerRequestInterface extends RequestInterface
{
    public function getServerParams(): array;
    public function getCookieParams(): array;
    public function withCookieParams(array $cookies): ServerRequestInterface;
    public function getQueryParams(): array;
    public function withQueryParams(array $query): ServerRequestInterface;
    public function getUploadedFiles(): array;
    public function withUploadedFiles(array $uploadedFiles): ServerRequestInterface;
    public function getParsedBody();
    public function withParsedBody($data): ServerRequestInterface;
    public function getAttributes(): array;
    public function getAttribute(string $name, $default = null);
    public function withAttribute(string $name, $value): ServerRequestInterface;
    public function withoutAttribute(string $name): ServerRequestInterface;
}

/**
 * PSR-7 Response Interface
 */
interface ResponseInterface extends MessageInterface
{
    public function getStatusCode(): int;
    public function withStatus(int $code, string $reasonPhrase = ''): ResponseInterface;
    public function getReasonPhrase(): string;
}

/**
 * PSR-7 Stream Interface
 */
interface StreamInterface
{
    public function __toString(): string;
    public function close(): void;
    public function detach();
    public function getSize(): ?int;
    public function tell(): int;
    public function eof(): bool;
    public function isSeekable(): bool;
    public function seek(int $offset, int $whence = SEEK_SET): void;
    public function rewind(): void;
    public function isWritable(): bool;
    public function write(string $string): int;
    public function isReadable(): bool;
    public function read(int $length): string;
    public function getContents(): string;
    public function getMetadata(?string $key = null);
}

/**
 * PSR-7 URI Interface
 */
interface UriInterface
{
    public function getScheme(): string;
    public function getAuthority(): string;
    public function getUserInfo(): string;
    public function getHost(): string;
    public function getPort(): ?int;
    public function getPath(): string;
    public function getQuery(): string;
    public function getFragment(): string;
    public function withScheme(string $scheme): UriInterface;
    public function withUserInfo(string $user, ?string $password = null): UriInterface;
    public function withHost(string $host): UriInterface;
    public function withPort(?int $port): UriInterface;
    public function withPath(string $path): UriInterface;
    public function withQuery(string $query): UriInterface;
    public function withFragment(string $fragment): UriInterface;
    public function __toString(): string;
}

/**
 * PSR-17 Response Factory Interface
 */
interface ResponseFactoryInterface
{
    public function createResponse(int $code = 200, string $reasonPhrase = ''): ResponseInterface;
}

/**
 * PSR-17 Stream Factory Interface
 */
interface StreamFactoryInterface
{
    public function createStream(string $content = ''): StreamInterface;
    public function createStreamFromFile(string $filename, string $mode = 'r'): StreamInterface;
    public function createStreamFromResource($resource): StreamInterface;
}
