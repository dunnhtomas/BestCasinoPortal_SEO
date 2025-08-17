<template>
  <article 
    :class="cardClasses"
    @click="handleCasinoClick"
    @keydown.enter="handleCasinoClick"
    @keydown.space.prevent="handleCasinoClick"
    :tabindex="clickable ? 0 : -1"
    role="button"
    :aria-label="`Visit ${casino.name} casino`"
  >
    <!-- Casino Header -->
    <header class="casino-header">
      <div class="casino-logo-container">
        <img 
          :src="casino.logo" 
          :alt="`${casino.name} logo`"
          class="casino-logo"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-if="casino.isVerified" class="verified-badge" title="Verified Casino">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
      </div>
      
      <div class="casino-info">
        <h3 class="casino-name">{{ casino.name }}</h3>
        <div v-if="showRating" class="casino-rating">
          <StarRating 
            :rating="casino.rating" 
            :readonly="true"
            size="sm"
          />
          <span class="rating-text">{{ casino.rating.toFixed(1) }}</span>
        </div>
      </div>
    </header>

    <!-- Casino Features -->
    <section v-if="showBonus || showGames" class="casino-features">
      <div v-if="showBonus" class="bonus-section">
        <div class="bonus-badge" :class="`bonus-${casino.bonus.type}`">
          {{ casino.bonus.type.replace('-', ' ').toUpperCase() }}
        </div>
        <div class="bonus-details">
          <span class="bonus-amount">{{ casino.bonus.amount }}</span>
          <span class="bonus-terms">{{ formatBonusTerms(casino.bonus) }}</span>
        </div>
      </div>

      <div v-if="showGames" class="games-section">
        <div class="games-count">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ casino.games.count }}+ Games</span>
        </div>
        <div class="providers-list">
          <span v-for="provider in casino.games.providers.slice(0, 3)" 
                :key="provider" 
                class="provider-tag">
            {{ provider }}
          </span>
          <span v-if="casino.games.providers.length > 3" class="provider-more">
            +{{ casino.games.providers.length - 3 }} more
          </span>
        </div>
      </div>
    </section>

    <!-- Casino Actions -->
    <footer class="casino-actions">
      <button 
        class="btn-primary"
        @click.stop="handlePlayClick"
        :disabled="loading"
        :aria-label="`Play at ${casino.name}`"
      >
        <span v-if="!loading">Play Now</span>
        <LoadingSpinner v-else size="sm" />
      </button>
      
      <button 
        class="btn-secondary"
        @click.stop="handleReviewClick"
        :aria-label="`Read ${casino.name} review`"
      >
        Read Review
      </button>
    </footer>

    <!-- Featured Badge -->
    <div v-if="casino.isFeatured && variant === 'featured'" class="featured-badge">
      <span>Featured</span>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CasinoCardProps, CasinoCardEmits } from '@/types/casino'
import StarRating from './StarRating.vue'
import LoadingSpinner from './LoadingSpinner.vue'

/**
 * CasinoCard Component
 * Following Context7 Vue.js 3+ best practices with TypeScript
 * Implements casino.ca design patterns and performance standards
 */

// Props with Context7 type-based declaration patterns
const props = withDefaults(defineProps<CasinoCardProps>(), {
  variant: 'default',
  showBonus: true,
  showRating: true,
  showGames: true,
  clickable: true
})

// Emits with Context7 type-safe event patterns
const emit = defineEmits<CasinoCardEmits>()

// Reactive state following Context7 patterns
const loading = ref(false)

// Computed properties following Context7 single responsibility
const cardClasses = computed(() => ({
  'casino-card': true,
  'casino-card--default': props.variant === 'default',
  'casino-card--compact': props.variant === 'compact',
  'casino-card--featured': props.variant === 'featured',
  'casino-card--clickable': props.clickable,
  'casino-card--verified': props.casino.isVerified,
  'casino-card--loading': loading.value
}))

/**
 * Format bonus terms for display
 * Following Context7 single responsibility principle
 */
function formatBonusTerms(bonus: typeof props.casino.bonus): string {
  const terms = []
  
  if (bonus.wagerRequirement > 0) {
    terms.push(`${bonus.wagerRequirement}x wagering`)
  }
  
  if (bonus.expiryDays > 0) {
    terms.push(`${bonus.expiryDays} days`)
  }
  
  return terms.join(' • ')
}

/**
 * Handle casino card click
 * Following Context7 event handling patterns
 */
function handleCasinoClick(): void {
  if (props.clickable) {
    emit('casino-click', props.casino)
  }
}

/**
 * Handle play button click
 * Following Context7 async action patterns
 */
async function handlePlayClick(): Promise<void> {
  loading.value = true
  
  try {
    // Track analytics event
    if (typeof gtag !== 'undefined') {
      gtag('event', 'casino_play_click', {
        casino_id: props.casino.id,
        casino_name: props.casino.name,
        event_category: 'casino_interaction'
      })
    }
    
    emit('play-click', props.casino)
    
    // Small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300))
    
  } finally {
    loading.value = false
  }
}

/**
 * Handle review button click
 */
function handleReviewClick(): void {
  emit('review-click', props.casino)
}

/**
 * Handle image load error
 * Following Context7 error handling patterns
 */
function handleImageError(event: Event): void {
  const target = event.target as HTMLImageElement
  target.src = '/images/casino-placeholder.svg'
  target.alt = 'Casino logo placeholder'
}
</script>

<style scoped>
/* Casino Card Styles following casino.ca design patterns */
.casino-card {
  @apply bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300;
  @apply border border-gray-200 overflow-hidden relative;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.casino-card--clickable {
  @apply cursor-pointer;
}

.casino-card--clickable:hover {
  @apply transform scale-105 shadow-2xl;
}

.casino-card--featured {
  @apply ring-2 ring-yellow-400 shadow-2xl;
  @apply bg-gradient-to-br from-yellow-50 to-white;
}

.casino-card--compact {
  @apply p-4;
}

.casino-card--loading {
  @apply opacity-75 pointer-events-none;
}

/* Header Styles */
.casino-header {
  @apply flex items-center p-6 pb-4;
}

.casino-logo-container {
  @apply relative flex-shrink-0 mr-4;
}

.casino-logo {
  @apply w-16 h-16 object-contain rounded-lg shadow-sm;
  @apply ring-1 ring-gray-200;
}

.verified-badge {
  @apply absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1;
  @apply shadow-md;
}

.casino-info {
  @apply flex-1 min-w-0;
}

.casino-name {
  @apply text-xl font-bold text-gray-900 mb-1 truncate;
}

.casino-rating {
  @apply flex items-center gap-2;
}

.rating-text {
  @apply text-sm font-semibold text-gray-600;
}

/* Features Section */
.casino-features {
  @apply px-6 pb-4 space-y-3;
}

.bonus-section {
  @apply space-y-2;
}

.bonus-badge {
  @apply inline-block px-2 py-1 text-xs font-semibold rounded-full;
}

.bonus-welcome {
  @apply bg-blue-100 text-blue-800;
}

.bonus-no-deposit {
  @apply bg-green-100 text-green-800;
}

.bonus-free-spins {
  @apply bg-purple-100 text-purple-800;
}

.bonus-cashback {
  @apply bg-orange-100 text-orange-800;
}

.bonus-details {
  @apply space-y-1;
}

.bonus-amount {
  @apply block text-2xl font-bold text-green-600;
}

.bonus-terms {
  @apply text-sm text-gray-500;
}

.games-section {
  @apply space-y-2;
}

.games-count {
  @apply flex items-center gap-2 text-sm font-medium text-gray-700;
}

.providers-list {
  @apply flex flex-wrap gap-1;
}

.provider-tag {
  @apply px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded;
}

.provider-more {
  @apply px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded font-medium;
}

/* Actions Section */
.casino-actions {
  @apply flex gap-3 p-6 pt-0;
}

.btn-primary {
  @apply flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400;
  @apply text-white font-semibold py-3 px-6 rounded-lg;
  @apply transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-lg;
  @apply transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500;
}

.featured-badge {
  @apply absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1;
  @apply text-xs font-bold rounded-bl-lg;
}

/* Responsive Design following casino.ca mobile-first patterns */
@media (max-width: 640px) {
  .casino-card {
    @apply mx-2;
  }
  
  .casino-header {
    @apply p-4 pb-3;
  }
  
  .casino-logo {
    @apply w-12 h-12;
  }
  
  .casino-name {
    @apply text-lg;
  }
  
  .casino-actions {
    @apply flex-col p-4 pt-0 gap-2;
  }
  
  .casino-features {
    @apply px-4;
  }
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .casino-card {
    @apply border-2 border-gray-600;
  }
  
  .btn-primary {
    @apply border-2 border-blue-800;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .casino-card {
    @apply transition-none;
  }
  
  .casino-card--clickable:hover {
    @apply transform-none;
  }
}
</style>