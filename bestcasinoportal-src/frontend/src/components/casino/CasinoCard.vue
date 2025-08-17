<template>
  <div class="casino-card" :class="cardClasses" @click="handleCardClick">
    <!-- Casino Header -->
    <div class="casino-header">
      <div class="casino-logo-container">
        <img 
          :src="casino.logo" 
          :alt="casino.name + ' logo'"
          class="casino-logo"
          loading="lazy"
          @error="handleImageError"
        />
        <div v-if="casino.featured" class="featured-badge">
          ⭐ Featured
        </div>
      </div>
      
      <div class="casino-info">
        <h3 class="casino-name">{{ casino.name }}</h3>
        <div class="casino-rating">
          <StarRating :rating="casino.rating" :max="5" />
          <span class="rating-text">{{ casino.rating }}/5</span>
        </div>
        <div class="casino-license" v-if="casino.license">
          🛡️ {{ casino.license }}
        </div>
      </div>
    </div>

    <!-- Bonus Information -->
    <div class="bonus-section">
      <div class="bonus-primary">
        <span class="bonus-amount">{{ formatBonus(casino.bonus.amount) }}</span>
        <span class="bonus-type">{{ casino.bonus.type }}</span>
      </div>
      <div class="bonus-details" v-if="casino.bonus.details">
        <small>{{ casino.bonus.details }}</small>
      </div>
      <div class="bonus-code" v-if="casino.bonus.code">
        <span class="code-label">Code:</span>
        <span class="code-value">{{ casino.bonus.code }}</span>
      </div>
    </div>

    <!-- Casino Features -->
    <div class="casino-features">
      <div class="feature-item">
        <span class="feature-icon">🎮</span>
        <span class="feature-text">{{ casino.games.count }}+ Games</span>
      </div>
      <div class="feature-item" v-if="casino.paymentMethods">
        <span class="feature-icon">💳</span>
        <span class="feature-text">{{ casino.paymentMethods.length }} Payment Methods</span>
      </div>
      <div class="feature-item" v-if="casino.withdrawalTime">
        <span class="feature-icon">⚡</span>
        <span class="feature-text">{{ casino.withdrawalTime }} Withdrawal</span>
      </div>
    </div>

    <!-- Call to Action -->
    <div class="casino-actions">
      <button 
        class="btn-primary"
        @click.stop="visitCasino"
        :disabled="loading"
        :aria-label="'Visit ' + casino.name"
      >
        <LoadingSpinner v-if="loading" />
        <span v-else>Play Now</span>
      </button>
      <button 
        class="btn-secondary"
        @click.stop="readReview"
        :aria-label="'Read ' + casino.name + ' review'"
      >
        Review
      </button>
      <button 
        class="btn-icon"
        @click.stop="toggleFavorite"
        :class="{ 'favorited': isFavorite }"
        :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
      >
        ❤️
      </button>
    </div>

    <!-- Mobile-First Responsive Design -->
    <div class="mobile-only-info" v-if="isMobile">
      <div class="mobile-bonus">
        <strong>{{ formatBonus(casino.bonus.amount) }}</strong>
        {{ casino.bonus.type }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, inject } from 'vue';
import { useRouter } from 'vue-router';
import { StarRating, LoadingSpinner } from '@/components';
import { useFavorites } from '@/composables/useFavorites';
import { useAnalytics } from '@/composables/useAnalytics';
import { useDeviceDetection } from '@/composables/useDeviceDetection';
import type { Casino } from '@/types/casino';

interface Props {
  casino: Casino;
  featured?: boolean;
  compact?: boolean;
  variant?: 'default' | 'grid' | 'list';
}

const props = withDefaults(defineProps<Props>(), {
  featured: false,
  compact: false,
  variant: 'default'
});

const router = useRouter();
const { isFavorite, toggleFavorite: toggleFav } = useFavorites();
const { trackEvent } = useAnalytics();
const { isMobile } = useDeviceDetection();

const loading = ref(false);

const cardClasses = computed(() => ({
  'casino-card--featured': props.featured,
  'casino-card--compact': props.compact,
  'casino-card--loading': loading.value,
  [`casino-card--${props.variant}`]: true
}));

const formatBonus = (amount: string | number): string => {
  if (typeof amount === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  }
  return amount.toString();
};

const visitCasino = async () => {
  loading.value = true;
  
  try {
    // Track casino visit (similar to casino.ca analytics)
    await trackEvent('casino_visit', {
      casino_id: props.casino.id,
      casino_name: props.casino.name,
      source: 'card_click',
      bonus_amount: props.casino.bonus.amount,
      featured: props.featured
    });
    
    // Open casino in new tab with security attributes
    window.open(
      props.casino.affiliateUrl || props.casino.url, 
      '_blank', 
      'noopener,noreferrer'
    );
  } finally {
    loading.value = false;
  }
};

const readReview = () => {
  trackEvent('review_click', {
    casino_id: props.casino.id,
    casino_name: props.casino.name
  });
  
  router.push(`/casino/${props.casino.slug}/review`);
};

const toggleFavorite = async () => {
  await toggleFav(props.casino.id);
  
  trackEvent('favorite_toggle', {
    casino_id: props.casino.id,
    casino_name: props.casino.name,
    action: isFavorite(props.casino.id) ? 'add' : 'remove'
  });
};

const handleCardClick = () => {
  trackEvent('card_view', {
    casino_id: props.casino.id,
    casino_name: props.casino.name
  });
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = '/images/casino-placeholder.svg';
};
</script>

<style scoped>
/* Casino Card Styling - Based on casino.ca design patterns */
.casino-card {
  @apply bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300;
  @apply border border-gray-200 overflow-hidden cursor-pointer;
  @apply transform hover:-translate-y-1;
}

.casino-card--featured {
  @apply ring-2 ring-yellow-400 shadow-yellow-100;
  @apply bg-gradient-to-br from-yellow-50 to-white;
}

.casino-card--compact {
  @apply p-4;
}

.casino-card--grid {
  @apply max-w-sm;
}

.casino-card--list {
  @apply flex flex-row items-center p-4;
}

/* Header Section */
.casino-header {
  @apply flex items-start p-6 pb-4;
}

.casino-logo-container {
  @apply relative mr-4;
}

.casino-logo {
  @apply w-16 h-16 object-contain rounded-lg shadow-sm;
  @apply border border-gray-100;
}

.featured-badge {
  @apply absolute -top-2 -right-2 bg-yellow-400 text-yellow-900;
  @apply text-xs font-bold px-2 py-1 rounded-full shadow-sm;
}

.casino-info {
  @apply flex-1;
}

.casino-name {
  @apply text-xl font-bold text-gray-900 mb-2;
  @apply truncate;
}

.casino-rating {
  @apply flex items-center gap-2 mb-1;
}

.rating-text {
  @apply text-sm text-gray-600 font-medium;
}

.casino-license {
  @apply text-xs text-green-600 font-medium;
}

/* Bonus Section */
.bonus-section {
  @apply px-6 pb-4;
}

.bonus-primary {
  @apply flex items-baseline gap-2 mb-2;
}

.bonus-amount {
  @apply text-2xl font-bold text-green-600;
}

.bonus-type {
  @apply text-gray-700 font-medium;
}

.bonus-details {
  @apply text-sm text-gray-600 mb-2;
}

.bonus-code {
  @apply flex items-center gap-2 text-sm;
}

.code-label {
  @apply text-gray-600;
}

.code-value {
  @apply bg-gray-100 px-2 py-1 rounded font-mono text-blue-600;
}

/* Features Section */
.casino-features {
  @apply flex flex-wrap gap-3 px-6 pb-4;
}

.feature-item {
  @apply flex items-center gap-1 text-sm text-gray-700;
}

.feature-icon {
  @apply text-blue-500;
}

/* Actions Section */
.casino-actions {
  @apply flex gap-2 p-6 pt-0;
}

.btn-primary {
  @apply flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold;
  @apply py-3 px-6 rounded-lg transition-colors duration-200;
  @apply disabled:opacity-50 disabled:cursor-not-allowed;
  @apply flex items-center justify-center gap-2;
}

.btn-secondary {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold;
  @apply py-3 px-4 rounded-lg transition-colors duration-200;
}

.btn-icon {
  @apply w-12 h-12 rounded-lg bg-gray-100 hover:bg-red-50;
  @apply flex items-center justify-center transition-colors duration-200;
}

.btn-icon.favorited {
  @apply bg-red-100 text-red-600;
}

/* Mobile Optimizations */
.mobile-only-info {
  @apply md:hidden p-4 bg-gray-50 border-t border-gray-200;
}

.mobile-bonus {
  @apply text-center text-lg font-semibold text-green-600;
}

/* Responsive Design */
@media (max-width: 768px) {
  .casino-card {
    @apply mx-2 mb-4;
  }
  
  .casino-actions {
    @apply flex-col;
  }
  
  .casino-header {
    @apply p-4 pb-3;
  }
  
  .casino-features {
    @apply px-4;
  }
  
  .bonus-section {
    @apply px-4;
  }
}

/* Loading States */
.casino-card--loading {
  @apply pointer-events-none opacity-75;
}

/* Accessibility */
.casino-card:focus-within {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

/* Performance Optimizations */
.casino-card {
  contain: layout style paint;
  will-change: transform;
}
</style>