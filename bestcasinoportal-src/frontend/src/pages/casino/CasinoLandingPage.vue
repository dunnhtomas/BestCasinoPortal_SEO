<template>
  <div class="casino-landing-page">
    <!-- SEO-optimized header with structured data -->
    <Head>
      <title>{{ seoTitle }}</title>
      <meta name="description" :content="seoDescription" />
      <meta name="keywords" :content="seoKeywords" />
      <link rel="canonical" :href="canonicalUrl" />
      
      <!-- Open Graph for social sharing -->
      <meta property="og:title" :content="seoTitle" />
      <meta property="og:description" :content="seoDescription" />
      <meta property="og:image" :content="casino.socialImage" />
      <meta property="og:url" :content="canonicalUrl" />
      <meta property="og:type" content="website" />
      
      <!-- Schema.org structured data -->
      <script type="application/ld+json" v-html="structuredData"></script>
    </Head>

    <!-- Hero section with casino branding -->
    <section class="hero-section" :style="{ backgroundImage: `url(${casino.heroImage})` }">
      <div class="hero-overlay">
        <div class="container mx-auto px-4 py-16">
          <div class="hero-content text-center text-white">
            <img 
              :src="casino.logo" 
              :alt="casino.name + ' logo'"
              class="casino-hero-logo mx-auto mb-6"
              width="200"
              height="100"
            />
            <h1 class="hero-title text-4xl md:text-6xl font-bold mb-4">
              {{ casino.name }} Review {{ new Date().getFullYear() }}
            </h1>
            <p class="hero-subtitle text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {{ casino.heroDescription }}
            </p>
            
            <!-- Primary CTA with bonus -->
            <div class="hero-cta bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
              <div class="bonus-display text-center">
                <div class="bonus-amount text-4xl font-bold mb-2">
                  {{ formatBonus(casino.bonus.amount) }}
                </div>
                <div class="bonus-type text-lg mb-4">
                  {{ casino.bonus.type }}
                </div>
                <div class="bonus-code" v-if="casino.bonus.code">
                  <span class="text-sm">Bonus Code:</span>
                  <span class="code-highlight bg-yellow-400 text-black px-3 py-1 rounded font-bold ml-2">
                    {{ casino.bonus.code }}
                  </span>
                </div>
              </div>
            </div>
            
            <button 
              @click="claimBonus"
              class="cta-button bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-4 px-8 rounded-full text-xl transition-all duration-300 transform hover:scale-105"
            >
              🎰 Claim {{ formatBonus(casino.bonus.amount) }} Bonus Now
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Casino quick facts -->
    <section class="quick-facts bg-gray-50 py-12">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-8">{{ casino.name }} Quick Facts</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="fact-card text-center bg-white p-6 rounded-lg shadow">
            <div class="fact-icon text-3xl mb-2">⭐</div>
            <div class="fact-value text-2xl font-bold text-blue-600">{{ casino.rating }}/5</div>
            <div class="fact-label text-gray-600">Overall Rating</div>
          </div>
          <div class="fact-card text-center bg-white p-6 rounded-lg shadow">
            <div class="fact-icon text-3xl mb-2">🎮</div>
            <div class="fact-value text-2xl font-bold text-blue-600">{{ casino.games.count }}+</div>
            <div class="fact-label text-gray-600">Casino Games</div>
          </div>
          <div class="fact-card text-center bg-white p-6 rounded-lg shadow">
            <div class="fact-icon text-3xl mb-2">💳</div>
            <div class="fact-value text-2xl font-bold text-blue-600">{{ casino.paymentMethods?.length || 10 }}+</div>
            <div class="fact-label text-gray-600">Payment Methods</div>
          </div>
          <div class="fact-card text-center bg-white p-6 rounded-lg shadow">
            <div class="fact-icon text-3xl mb-2">⚡</div>
            <div class="fact-value text-2xl font-bold text-blue-600">{{ casino.withdrawalTime }}</div>
            <div class="fact-label text-gray-600">Withdrawal Time</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Detailed review content - SEO optimized -->
    <section class="review-content py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <!-- Main content -->
          <div class="lg:col-span-2">
            <article class="casino-review">
              <header class="review-header mb-8">
                <h2 class="text-3xl font-bold mb-4">{{ casino.name }} Casino Review 2025</h2>
                <div class="review-meta flex items-center gap-4 text-gray-600">
                  <span>Updated: {{ formatDate(casino.lastUpdated) }}</span>
                  <span>•</span>
                  <span>By Casino Experts</span>
                  <span>•</span>
                  <span>{{ estimatedReadTime }} min read</span>
                </div>
              </header>

              <!-- Review summary -->
              <div class="review-summary bg-blue-50 p-6 rounded-lg mb-8">
                <h3 class="text-xl font-bold mb-4">Review Summary</h3>
                <p class="text-gray-700 leading-relaxed">
                  {{ casino.reviewSummary }}
                </p>
                <div class="pros-cons grid md:grid-cols-2 gap-6 mt-6">
                  <div class="pros">
                    <h4 class="font-bold text-green-600 mb-3">✅ Pros</h4>
                    <ul class="list-disc list-inside space-y-1">
                      <li v-for="pro in casino.pros" :key="pro">{{ pro }}</li>
                    </ul>
                  </div>
                  <div class="cons">
                    <h4 class="font-bold text-red-600 mb-3">❌ Cons</h4>
                    <ul class="list-disc list-inside space-y-1">
                      <li v-for="con in casino.cons" :key="con">{{ con }}</li>
                    </ul>
                  </div>
                </div>
              </div>

              <!-- Detailed sections -->
              <div class="review-sections space-y-12">
                <section class="games-section">
                  <h3 class="text-2xl font-bold mb-6">🎮 Games & Software</h3>
                  <p class="mb-4">{{ casino.gamesDescription }}</p>
                  <div class="game-categories grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="category in casino.gameCategories" :key="category.name" 
                         class="category-card bg-white p-4 rounded-lg shadow text-center">
                      <div class="category-icon text-2xl mb-2">{{ category.icon }}</div>
                      <div class="category-name font-bold">{{ category.name }}</div>
                      <div class="category-count text-gray-600">{{ category.count }}+ games</div>
                    </div>
                  </div>
                </section>

                <section class="bonuses-section">
                  <h3 class="text-2xl font-bold mb-6">🎁 Bonuses & Promotions</h3>
                  <div class="bonus-details space-y-6">
                    <div v-for="bonus in casino.bonuses" :key="bonus.id" 
                         class="bonus-card bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                      <h4 class="font-bold text-lg mb-2">{{ bonus.title }}</h4>
                      <p class="text-gray-700 mb-4">{{ bonus.description }}</p>
                      <div class="bonus-terms text-sm text-gray-600">
                        <strong>Terms:</strong> {{ bonus.terms }}
                      </div>
                    </div>
                  </div>
                </section>

                <section class="payment-section">
                  <h3 class="text-2xl font-bold mb-6">💳 Banking & Payments</h3>
                  <p class="mb-6">{{ casino.bankingDescription }}</p>
                  <div class="payment-methods grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div v-for="method in casino.paymentMethods" :key="method.name"
                         class="payment-method bg-white p-4 rounded-lg shadow text-center">
                      <img :src="method.logo" :alt="method.name" class="mx-auto mb-2 h-8" />
                      <div class="method-name text-sm">{{ method.name }}</div>
                    </div>
                  </div>
                </section>

                <section class="security-section">
                  <h3 class="text-2xl font-bold mb-6">🛡️ Security & Licensing</h3>
                  <p class="mb-4">{{ casino.securityDescription }}</p>
                  <div class="security-features grid md:grid-cols-2 gap-6">
                    <div class="license-info bg-green-50 p-4 rounded-lg">
                      <h4 class="font-bold mb-2">🏛️ License</h4>
                      <p>{{ casino.license }}</p>
                    </div>
                    <div class="encryption-info bg-blue-50 p-4 rounded-lg">
                      <h4 class="font-bold mb-2">🔐 Encryption</h4>
                      <p>{{ casino.encryption }}</p>
                    </div>
                  </div>
                </section>
              </div>

              <!-- Call to action -->
              <div class="final-cta bg-gradient-to-r from-yellow-400 to-orange-500 p-8 rounded-xl text-center mt-12">
                <h3 class="text-2xl font-bold mb-4">Ready to Play at {{ casino.name }}?</h3>
                <p class="mb-6">Join thousands of players and claim your {{ formatBonus(casino.bonus.amount) }} bonus today!</p>
                <button 
                  @click="claimBonus"
                  class="cta-button bg-white text-black font-bold py-4 px-8 rounded-full text-xl hover:bg-gray-100 transition-all duration-300"
                >
                  🚀 Play Now & Claim Bonus
                </button>
              </div>
            </article>
          </div>

          <!-- Sidebar -->
          <div class="lg:col-span-1">
            <aside class="sidebar space-y-8">
              
              <!-- Casino card -->
              <div class="casino-sidebar-card bg-white p-6 rounded-lg shadow-lg">
                <CasinoCard :casino="casino" :featured="true" variant="sidebar" />
              </div>

              <!-- Top casinos -->
              <div class="top-casinos bg-white p-6 rounded-lg shadow">
                <h3 class="font-bold text-lg mb-4">🏆 Top Rated Casinos</h3>
                <div class="space-y-4">
                  <div v-for="topCasino in topCasinos" :key="topCasino.id" 
                       class="top-casino-item flex items-center gap-3 p-3 bg-gray-50 rounded">
                    <img :src="topCasino.logo" :alt="topCasino.name" class="w-12 h-12 object-contain" />
                    <div class="flex-1">
                      <div class="font-bold">{{ topCasino.name }}</div>
                      <div class="text-sm text-gray-600">{{ topCasino.bonus.amount }}</div>
                    </div>
                    <div class="rating text-yellow-500">⭐ {{ topCasino.rating }}</div>
                  </div>
                </div>
              </div>

              <!-- Newsletter signup -->
              <div class="newsletter bg-blue-600 text-white p-6 rounded-lg">
                <h3 class="font-bold text-lg mb-4">📧 Casino Updates</h3>
                <p class="mb-4 text-sm">Get the latest bonuses and casino news!</p>
                <form @submit.prevent="subscribeNewsletter" class="space-y-3">
                  <input 
                    v-model="newsletter.email"
                    type="email" 
                    placeholder="Enter your email"
                    class="w-full p-3 rounded text-black"
                    required
                  />
                  <button 
                    type="submit"
                    class="w-full bg-yellow-500 text-black font-bold py-3 rounded hover:bg-yellow-600 transition-colors"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ section for SEO -->
    <section class="faq-section bg-gray-50 py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div class="max-w-4xl mx-auto">
          <div v-for="faq in faqs" :key="faq.id" 
               class="faq-item bg-white p-6 rounded-lg shadow mb-4">
            <button 
              @click="toggleFaq(faq.id)"
              class="w-full text-left font-bold text-lg flex justify-between items-center"
            >
              {{ faq.question }}
              <span class="text-2xl">{{ openFaqs.includes(faq.id) ? '−' : '+' }}</span>
            </button>
            <div v-show="openFaqs.includes(faq.id)" class="mt-4 text-gray-700">
              <p v-html="faq.answer"></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useHead } from '@unhead/vue';
import { CasinoCard } from '@/components/casino';
import { useAnalytics } from '@/composables/useAnalytics';
import type { Casino } from '@/types/casino';

interface Props {
  casino: Casino;
  topCasinos: Casino[];
}

const props = defineProps<Props>();
const { trackEvent } = useAnalytics();

const newsletter = ref({ email: '' });
const openFaqs = ref<number[]>([]);

// SEO computed properties
const seoTitle = computed(() => 
  `${props.casino.name} Casino Review 2025 | ${formatBonus(props.casino.bonus.amount)} Bonus | BestCasinoPortal`
);

const seoDescription = computed(() => 
  `Comprehensive ${props.casino.name} casino review 2025. Get ${formatBonus(props.casino.bonus.amount)} bonus + ${props.casino.games.count}+ games. Expert analysis, pros & cons, and exclusive bonuses.`
);

const seoKeywords = computed(() => 
  `${props.casino.name} casino, ${props.casino.name} review, online casino bonus, ${props.casino.bonus.type.toLowerCase()}, casino games, online gambling`
);

const canonicalUrl = computed(() => 
  `https://bestcasinoportal.com/casino/${props.casino.slug}/review`
);

const estimatedReadTime = computed(() => {
  const wordsPerMinute = 200;
  const wordCount = 1500; // Estimated based on content
  return Math.ceil(wordCount / wordsPerMinute);
});

// Structured data for SEO
const structuredData = computed(() => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Review",
  "itemReviewed": {
    "@type": "Organization",
    "name": props.casino.name,
    "image": props.casino.logo,
    "url": props.casino.url,
    "sameAs": props.casino.socialLinks
  },
  "reviewRating": {
    "@type": "Rating",
    "ratingValue": props.casino.rating,
    "bestRating": 5,
    "worstRating": 1
  },
  "author": {
    "@type": "Organization",
    "name": "BestCasinoPortal Expert Team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "BestCasinoPortal",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bestcasinoportal.com/logo.png"
    }
  },
  "datePublished": props.casino.publishedDate,
  "dateModified": props.casino.lastUpdated,
  "reviewBody": props.casino.reviewSummary
}));

// FAQ data for SEO
const faqs = ref([
  {
    id: 1,
    question: `Is ${props.casino.name} casino safe and legit?`,
    answer: `Yes, ${props.casino.name} is fully licensed and regulated by ${props.casino.license}. They use advanced SSL encryption to protect player data and funds.`
  },
  {
    id: 2,
    question: `What bonuses does ${props.casino.name} offer?`,
    answer: `${props.casino.name} offers a ${formatBonus(props.casino.bonus.amount)} ${props.casino.bonus.type} plus ongoing promotions for existing players.`
  },
  {
    id: 3,
    question: `How long do withdrawals take at ${props.casino.name}?`,
    answer: `Withdrawal times at ${props.casino.name} are typically ${props.casino.withdrawalTime}, depending on your chosen payment method.`
  },
  {
    id: 4,
    question: `Can I play ${props.casino.name} games on mobile?`,
    answer: `Yes, ${props.casino.name} offers a fully optimized mobile casino experience with ${props.casino.games.count}+ games available on smartphones and tablets.`
  }
]);

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

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const claimBonus = async () => {
  await trackEvent('bonus_claim', {
    casino_id: props.casino.id,
    casino_name: props.casino.name,
    bonus_amount: props.casino.bonus.amount,
    source: 'landing_page'
  });
  
  window.open(props.casino.affiliateUrl, '_blank', 'noopener,noreferrer');
};

const subscribeNewsletter = async () => {
  // Newsletter subscription logic
  await trackEvent('newsletter_signup', {
    email: newsletter.value.email,
    source: 'casino_landing_page'
  });
  
  newsletter.value.email = '';
  alert('Thank you for subscribing!');
};

const toggleFaq = (faqId: number) => {
  const index = openFaqs.value.indexOf(faqId);
  if (index > -1) {
    openFaqs.value.splice(index, 1);
  } else {
    openFaqs.value.push(faqId);
  }
};

// Set up SEO meta tags
useHead({
  title: seoTitle,
  meta: [
    { name: 'description', content: seoDescription },
    { name: 'keywords', content: seoKeywords },
    { property: 'og:title', content: seoTitle },
    { property: 'og:description', content: seoDescription },
    { property: 'og:image', content: props.casino.socialImage },
    { property: 'og:url', content: canonicalUrl }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl }
  ]
});

onMounted(() => {
  // Track page view
  trackEvent('casino_landing_page_view', {
    casino_id: props.casino.id,
    casino_name: props.casino.name
  });
});
</script>

<style scoped>
/* Landing page specific styles */
.hero-section {
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 80vh;
  position: relative;
}

.hero-overlay {
  background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.4));
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.casino-hero-logo {
  max-width: 200px;
  height: auto;
  filter: brightness(1.1) contrast(1.1);
}

.code-highlight {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.fact-card:hover {
  transform: translateY(-2px);
  transition: transform 0.3s ease;
}

.review-content {
  line-height: 1.7;
}

.review-content h3 {
  color: #1e40af;
  border-bottom: 2px solid #3b82f6;
  padding-bottom: 0.5rem;
}

.faq-item:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1.125rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
</style>