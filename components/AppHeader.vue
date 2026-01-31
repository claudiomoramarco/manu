<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

// --- LOGICA SCROLL E MENU ---
const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);
const isSearchOpen = ref(false);
const { cart, toggleCart } = useCart();

// Gestione dello scroll per l'effetto "pillola"
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// --- LOGICA RICERCA REAL TIME ---
const searchQuery = ref('');
const searchInput = ref<HTMLInputElement | null>(null);
const router = useRouter();

// Apre il popup e mette il focus sull'input
const openSearch = () => {
  isSearchOpen.value = true;
  nextTick(() => searchInput.value?.focus());
};

// Esegue la ricerca vera e propria (invio)
const performSearch = () => {
  if (searchQuery.value.trim()) {
    isSearchOpen.value = false;
    router.push({ path: '/products', query: { search: searchQuery.value } });
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div>
    <div 
      class="fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-1000 ease-in-out"
      :class="isScrolled ? 'pt-4' : 'pt-0'"
    >
      <header 
        class="transition-all duration-1000 ease-in-out flex items-center justify-between px-6"
        :class="[
          isScrolled 
            ? 'w-[90%] max-w-6xl h-16 rounded-full bg-white dark:bg-gray-800 shadow-[0_0_50px_-10px_rgba(120,53,15,0.3)]' 
            : 'w-full h-20 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800'
        ]"
      >

        <NuxtLink to="/" class="flex items-center gap-1 group z-10">
          <span class="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-500 transition-colors">
            MANU<span class="text-amber-800">.</span>
          </span>
        </NuxtLink>

        <nav class="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <NuxtLink to="/products" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            Shop
          </NuxtLink>
          <NuxtLink to="/categories" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            Collezioni
          </NuxtLink>
          <NuxtLink to="/contact" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition">
            Contatti
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-3 z-10">
          
          <button 
            @click="openSearch" 
            class="p-2 text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-full transition"
            title="Cerca"
          >
            <Icon name="ion:search-outline" size="22" />
          </button>

          <UiColorModeSwitcher />

          <button @click="toggleCart()" class="p-2 text-gray-600 dark:text-gray-300 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-gray-800 rounded-full transition relative" title="Carrello" aria-label="Carrello">
            <Icon name="ion:cart-outline" size="24" />
            <span v-if="cart?.contents?.itemCount" class="absolute top-0 right-0 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-amber-800 rounded-full">
              {{ cart?.contents?.itemCount }}
            </span>
          </button>

          <NuxtLink to="/contact" class="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-amber-800 text-white rounded-full font-medium hover:bg-amber-900 hover:shadow-lg hover:shadow-amber-800/40 transition-all">
            <span class="text-sm">Contact</span>
            <span class="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center">
              <Icon name="ion:arrow-forward" size="14" />
            </span>
          </NuxtLink>

          <button 
            class="md:hidden p-2 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
             <Icon name="ion:menu-outline" size="28" />
          </button>
        </div>

      </header>
    </div>

    <Transition name="fade">
      <div v-if="isSearchOpen" class="fixed inset-0 z-[100] bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl flex flex-col pt-32 px-6">
        
        <button 
          @click="isSearchOpen = false" 
          class="absolute top-8 right-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Icon name="ion:close-outline" size="32" class="text-gray-500 dark:text-gray-400" />
        </button>

        <div class="w-full max-w-3xl mx-auto">
          <div class="relative border-b-2 border-gray-200 dark:border-gray-700 focus-within:border-amber-800 dark:focus-within:border-amber-500 transition-colors duration-300">
            <Icon name="ion:search-outline" class="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size="32" />
            <input 
              ref="searchInput"
              v-model="searchQuery"
              @keydown.enter="performSearch"
              type="text" 
              placeholder="Cosa stai cercando?" 
              class="w-full bg-transparent text-4xl md:text-5xl font-bold text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 py-6 pl-12 focus:outline-none"
            />
          </div>
          <div class="mt-4 text-gray-500 dark:text-gray-400">
            Premi invio per cercare.
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="slide">
      <div v-if="isMobileMenuOpen" class="fixed inset-0 z-[90] bg-white dark:bg-gray-900 flex flex-col p-6">
         <div class="flex justify-between items-center mb-8">
            <span class="text-2xl font-bold dark:text-white">Menu</span>
            <button @click="isMobileMenuOpen = false" class="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-900 dark:text-white">
              <Icon name="ion:close" size="24" />
            </button>
         </div>
         <nav class="flex flex-col gap-6 text-2xl font-bold text-gray-800 dark:text-white">
            <NuxtLink @click="isMobileMenuOpen = false" to="/">Home</NuxtLink>
            <NuxtLink @click="isMobileMenuOpen = false" to="/products">Shop</NuxtLink>
            <NuxtLink @click="isMobileMenuOpen = false" to="/contact">Contatti</NuxtLink>
         </nav>
      </div>
    </Transition>

  </div>
</template>

<style lang="postcss" scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>