import { ref, computed, onMounted, type Ref } from 'vue'
import type { Casino, CasinoFilters, ApiResponse } from '@/types/casino'

/**
 * useCasinos Composable
 * Following Context7 Vue.js 3+ Composition API best practices
 * Provides reactive casino data management with type safety
 */
export function useCasinos() {
  // Reactive state using Context7 patterns
  const casinos: Ref<Casino[]> = ref([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters: Ref<CasinoFilters> = ref({
    page: 1,
    perPage: 12,
    sortBy: 'rating',
    sortOrder: 'desc'
  })

  // Computed properties following Context7 single responsibility
  const featuredCasinos = computed(() => 
    casinos.value.filter(casino => casino.isFeatured)
  )

  const verifiedCasinos = computed(() => 
    casinos.value.filter(casino => casino.isVerified)
  )

  const topRatedCasinos = computed(() => 
    casinos.value
      .filter(casino => casino.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
  )

  const totalGames = computed(() => 
    casinos.value.reduce((total, casino) => total + casino.games.count, 0)
  )

  /**
   * Fetch casinos from API
   * Following Context7 error handling patterns
   */
  async function fetchCasinos(customFilters?: Partial<CasinoFilters>): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const queryFilters = { ...filters.value, ...customFilters }
      const queryParams = new URLSearchParams()

      // Build query string from filters
      Object.entries(queryFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(`${key}[]`, v.toString()))
          } else {
            queryParams.append(key, value.toString())
          }
        }
      })

      const response = await fetch(`/api/casinos?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch casinos: ${response.statusText}`)
      }

      const data: ApiResponse<Casino[]> = await response.json()
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch casinos')
      }

      casinos.value = data.data
      
      // Update filters if pagination info is available
      if (data.meta) {
        filters.value = {
          ...filters.value,
          ...customFilters,
          page: data.meta.currentPage || 1,
          perPage: data.meta.perPage || 12
        }
      }

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Error fetching casinos:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Update filters and refetch casinos
   * Following Context7 reactive patterns
   */
  async function updateFilters(newFilters: Partial<CasinoFilters>): Promise<void> {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
    await fetchCasinos()
  }

  /**
   * Reset filters to default values
   */
  async function resetFilters(): Promise<void> {
    filters.value = {
      page: 1,
      perPage: 12,
      sortBy: 'rating',
      sortOrder: 'desc'
    }
    await fetchCasinos()
  }

  /**
   * Load more casinos (pagination)
   */
  async function loadMore(): Promise<void> {
    if (!loading.value) {
      const nextPage = (filters.value.page || 1) + 1
      await fetchCasinos({ page: nextPage })
    }
  }

  /**
   * Get casino by slug
   * Following Context7 single responsibility principle
   */
  function getCasinoBySlug(slug: string): Casino | undefined {
    return casinos.value.find(casino => casino.slug === slug)
  }

  /**
   * Search casinos by name
   */
  function searchCasinos(query: string): Casino[] {
    if (!query.trim()) return casinos.value

    const searchTerm = query.toLowerCase().trim()
    return casinos.value.filter(casino => 
      casino.name.toLowerCase().includes(searchTerm) ||
      casino.description.toLowerCase().includes(searchTerm)
    )
  }

  // Initialize data on mount following Context7 lifecycle patterns
  onMounted(() => {
    fetchCasinos()
  })

  // Return reactive state and methods following Context7 composable patterns
  return {
    // State
    casinos: readonly(casinos),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),
    
    // Computed
    featuredCasinos,
    verifiedCasinos,
    topRatedCasinos,
    totalGames,
    
    // Methods
    fetchCasinos,
    updateFilters,
    resetFilters,
    loadMore,
    getCasinoBySlug,
    searchCasinos
  }
}

/**
 * useCasinoPerformance Composable
 * Performance optimization following Context7 patterns
 */
export function useCasinoPerformance() {
  const performanceMetrics = ref({
    lcp: 0,
    fid: 0,
    cls: 0,
    timestamp: Date.now()
  })

  /**
   * Measure Core Web Vitals following casino.ca standards
   */
  function measurePerformance(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        performanceMetrics.value.lcp = lastEntry.startTime
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          performanceMetrics.value.fid = entry.processingStart - entry.startTime
        })
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        performanceMetrics.value.cls = clsValue
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    }
  }

  onMounted(() => {
    measurePerformance()
  })

  return {
    performanceMetrics: readonly(performanceMetrics),
    measurePerformance
  }
}