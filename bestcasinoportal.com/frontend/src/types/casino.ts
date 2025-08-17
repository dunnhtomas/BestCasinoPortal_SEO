/**
 * Casino Portal TypeScript Interfaces
 * Following Context7 Vue.js 3+ best practices for type safety
 */

export interface Casino {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly logo: string;
  readonly url: string;
  readonly description: string;
  readonly rating: number;
  readonly bonus: CasinoBonus;
  readonly games: CasinoGames;
  readonly features: CasinoFeature[];
  readonly licenses: string[];
  readonly isVerified: boolean;
  readonly isFeatured: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CasinoBonus {
  readonly amount: string;
  readonly type: 'welcome' | 'no-deposit' | 'free-spins' | 'cashback';
  readonly wagerRequirement: number;
  readonly maxCashout?: number;
  readonly expiryDays: number;
  readonly terms: string;
}

export interface CasinoGames {
  readonly count: number;
  readonly providers: string[];
  readonly categories: GameCategory[];
  readonly featuredGames: Game[];
}

export interface Game {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly provider: string;
  readonly category: GameCategory;
  readonly rtp: number;
  readonly volatility: 1 | 2 | 3 | 4 | 5;
  readonly minBet: number;
  readonly maxBet: number;
  readonly thumbnail: string;
  readonly demoUrl?: string;
  readonly isFeatured: boolean;
  readonly isPopular: boolean;
}

export interface GameCategory {
  readonly id: number;
  readonly name: string;
  readonly slug: string;
  readonly icon: string;
  readonly gameCount: number;
}

export interface CasinoFeature {
  readonly id: number;
  readonly name: string;
  readonly icon: string;
  readonly description: string;
  readonly isAvailable: boolean;
}

export interface Review {
  readonly id: number;
  readonly casinoId: number;
  readonly userId: number;
  readonly rating: number;
  readonly title: string;
  readonly content: string;
  readonly pros: string[];
  readonly cons: string[];
  readonly isVerified: boolean;
  readonly isPublished: boolean;
  readonly createdAt: string;
  readonly user: {
    readonly name: string;
    readonly avatar?: string;
    readonly isVerified: boolean;
  };
}

export interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: {
    readonly total?: number;
    readonly perPage?: number;
    readonly currentPage?: number;
    readonly totalPages?: number;
  };
  readonly success: boolean;
  readonly message?: string;
}

export interface CasinoFilters {
  readonly search?: string;
  readonly minRating?: number;
  readonly maxRating?: number;
  readonly bonusType?: CasinoBonus['type'][];
  readonly gameProviders?: string[];
  readonly features?: string[];
  readonly isVerified?: boolean;
  readonly sortBy?: 'rating' | 'name' | 'bonus' | 'games' | 'created';
  readonly sortOrder?: 'asc' | 'desc';
  readonly page?: number;
  readonly perPage?: number;
}

// Component Props interfaces following Context7 patterns
export interface CasinoCardProps {
  readonly casino: Casino;
  readonly variant?: 'default' | 'compact' | 'featured';
  readonly showBonus?: boolean;
  readonly showRating?: boolean;
  readonly showGames?: boolean;
  readonly clickable?: boolean;
}

export interface CasinoGridProps {
  readonly casinos: Casino[];
  readonly loading?: boolean;
  readonly variant?: 'grid' | 'list';
  readonly showFilters?: boolean;
  readonly showPagination?: boolean;
}

export interface GameCardProps {
  readonly game: Game;
  readonly variant?: 'default' | 'compact' | 'hero';
  readonly showProvider?: boolean;
  readonly showRtp?: boolean;
  readonly showDemo?: boolean;
  readonly lazy?: boolean;
}

// Event interfaces for type-safe emits
export interface CasinoCardEmits {
  (e: 'casino-click', casino: Casino): void;
  (e: 'play-click', casino: Casino): void;
  (e: 'review-click', casino: Casino): void;
}

export interface GameCardEmits {
  (e: 'game-click', game: Game): void;
  (e: 'demo-click', game: Game): void;
  (e: 'favorite-toggle', game: Game, isFavorite: boolean): void;
}

export interface FilterEmits {
  (e: 'filters-change', filters: CasinoFilters): void;
  (e: 'filters-reset'): void;
}