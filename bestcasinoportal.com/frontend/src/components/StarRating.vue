<template>
  <div 
    class="star-rating"
    :class="sizeClasses"
    role="img"
    :aria-label="`Rating: ${rating} out of 5 stars`"
  >
    <template v-for="(star, index) in stars" :key="index">
      <button
        v-if="!readonly"
        type="button"
        class="star-button"
        :class="{ 'star-active': star.filled, 'star-half': star.half }"
        @click="handleStarClick(index + 1)"
        @mouseenter="handleStarHover(index + 1)"
        @mouseleave="handleStarLeave"
        :aria-label="`Rate ${index + 1} star${index + 1 > 1 ? 's' : ''}`"
      >
        <StarIcon :filled="star.filled" :half="star.half" />
      </button>
      
      <span v-else class="star-display" :class="{ 'star-active': star.filled, 'star-half': star.half }">
        <StarIcon :filled="star.filled" :half="star.half" />
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

/**
 * StarRating Component
 * Following Context7 Vue.js 3+ accessibility and usability patterns
 */

interface Props {
  rating: number
  maxStars?: number
  readonly?: boolean
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  allowHalf?: boolean
}

interface Emits {
  (e: 'rating-change', rating: number): void
}

// Props with Context7 defaults pattern
const props = withDefaults(defineProps<Props>(), {
  maxStars: 5,
  readonly: false,
  size: 'md',
  allowHalf: true
})

const emit = defineEmits<Emits>()

// Reactive state
const hoverRating = ref(0)

// Computed properties following Context7 patterns
const sizeClasses = computed(() => ({
  'star-rating--xs': props.size === 'xs',
  'star-rating--sm': props.size === 'sm',
  'star-rating--md': props.size === 'md',
  'star-rating--lg': props.size === 'lg',
  'star-rating--xl': props.size === 'xl',
  'star-rating--readonly': props.readonly,
  'star-rating--interactive': !props.readonly
}))

const stars = computed(() => {
  const activeRating = hoverRating.value || props.rating
  
  return Array.from({ length: props.maxStars }, (_, index) => {
    const starValue = index + 1
    const filled = activeRating >= starValue
    const half = props.allowHalf && activeRating >= starValue - 0.5 && activeRating < starValue
    
    return { filled, half }
  })
})

/**
 * Handle star click for rating
 */
function handleStarClick(rating: number): void {
  if (!props.readonly) {
    emit('rating-change', rating)
  }
}

/**
 * Handle star hover for preview
 */
function handleStarHover(rating: number): void {
  if (!props.readonly) {
    hoverRating.value = rating
  }
}

/**
 * Handle mouse leave to reset hover
 */
function handleStarLeave(): void {
  hoverRating.value = 0
}
</script>

<!-- StarIcon child component -->
<script setup lang="ts" name="StarIcon">
interface StarIconProps {
  filled: boolean
  half: boolean
}

defineProps<StarIconProps>()
</script>

<template name="StarIcon">
  <svg 
    class="star-icon" 
    fill="currentColor" 
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs v-if="half">
      <linearGradient :id="`star-gradient-${Math.random()}`" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="50%" style="stop-color: currentColor; stop-opacity: 1" />
        <stop offset="50%" style="stop-color: transparent; stop-opacity: 0" />
      </linearGradient>
    </defs>
    
    <path 
      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      :fill="half ? `url(#star-gradient-${Math.random()})` : 'currentColor'"
    />
  </svg>
</template>

<style scoped>
/* Star Rating Styles following Context7 design patterns */
.star-rating {
  @apply flex items-center gap-1;
}

.star-rating--readonly {
  @apply cursor-default;
}

.star-rating--interactive {
  @apply cursor-pointer;
}

/* Size variations */
.star-rating--xs .star-icon {
  @apply w-3 h-3;
}

.star-rating--sm .star-icon {
  @apply w-4 h-4;
}

.star-rating--md .star-icon {
  @apply w-5 h-5;
}

.star-rating--lg .star-icon {
  @apply w-6 h-6;
}

.star-rating--xl .star-icon {
  @apply w-8 h-8;
}

/* Star button styles */
.star-button {
  @apply p-0 border-0 bg-transparent cursor-pointer transition-colors duration-150;
  @apply focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded;
}

.star-display {
  @apply transition-colors duration-150;
}

/* Star states */
.star-button, .star-display {
  @apply text-gray-300;
}

.star-button:hover,
.star-button.star-active,
.star-display.star-active {
  @apply text-yellow-400;
}

.star-button.star-half,
.star-display.star-half {
  @apply text-yellow-300;
}

/* Interactive states */
.star-rating--interactive .star-button:hover {
  @apply text-yellow-500 transform scale-110;
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .star-button, .star-display {
    @apply text-gray-600;
  }
  
  .star-button:hover,
  .star-button.star-active,
  .star-display.star-active {
    @apply text-orange-600;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .star-button, .star-display {
    @apply transition-none;
  }
  
  .star-button:hover {
    @apply transform-none;
  }
}
</style>