<?php

declare(strict_types=1);

namespace Illuminate\Database\Eloquent;

/**
 * Mock Eloquent Collection for type safety
 */
class Collection implements \IteratorAggregate, \Countable, \ArrayAccess
{
    protected array $items = [];

    public function __construct(array $items = [])
    {
        $this->items = $items;
    }

    public function count(): int
    {
        return count($this->items);
    }

    public function first()
    {
        return reset($this->items) ?: null;
    }

    public function last()
    {
        return end($this->items) ?: null;
    }

    public function toArray(): array
    {
        return $this->items;
    }

    public function pluck(string $key): array
    {
        return array_column($this->items, $key);
    }

    public function sum(string $key): float
    {
        return array_sum($this->pluck($key));
    }

    public function avg(string $key): float
    {
        $values = $this->pluck($key);
        return count($values) > 0 ? array_sum($values) / count($values) : 0;
    }

    public function min(string $key)
    {
        $values = $this->pluck($key);
        return count($values) > 0 ? min($values) : null;
    }

    public function max(string $key)
    {
        $values = $this->pluck($key);
        return count($values) > 0 ? max($values) : null;
    }

    public function sortBy(string $key)
    {
        $items = $this->items;
        usort($items, function ($a, $b) use ($key) {
            return $a->$key <=> $b->$key;
        });
        return new static($items);
    }

    public function sortByDesc(string $key)
    {
        $items = $this->items;
        usort($items, function ($a, $b) use ($key) {
            return $b->$key <=> $a->$key;
        });
        return new static($items);
    }

    public function getIterator(): \ArrayIterator
    {
        return new \ArrayIterator($this->items);
    }

    public function offsetExists($offset): bool
    {
        return isset($this->items[$offset]);
    }

    public function offsetGet($offset)
    {
        return $this->items[$offset] ?? null;
    }

    public function offsetSet($offset, $value): void
    {
        if ($offset === null) {
            $this->items[] = $value;
        } else {
            $this->items[$offset] = $value;
        }
    }

    public function offsetUnset($offset): void
    {
        unset($this->items[$offset]);
    }

    public function push($value): void
    {
        $this->items[] = $value;
    }

    public function pop()
    {
        return array_pop($this->items);
    }

    public function shift()
    {
        return array_shift($this->items);
    }

    public function unshift($value): void
    {
        array_unshift($this->items, $value);
    }
}
