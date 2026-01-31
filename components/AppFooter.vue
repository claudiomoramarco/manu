<script setup lang="ts">
const { siteName } = useAppConfig();
</script>

<template>
  <footer class="mt-auto py-8 px-4">
    <div class="max-w-6xl mx-auto bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/20 dark:border-gray-700 rounded-3xl p-8 shadow-lg">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div class="text-center md:text-left">
          <span class="text-2xl font-bold tracking-tighter text-gray-900 dark:text-white transition-colors">
            MANU<span class="text-amber-800 dark:text-amber-400">.</span>
          </span>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
            &copy; {{ new Date().getFullYear() }} {{ siteName }}. All rights reserved.
          </p>
        </div>

        <nav class="flex gap-6 text-sm font-medium text-gray-600 dark:text-gray-300">
          <NuxtLink to="/privacy" class="hover:text-amber-800 dark:hover:text-amber-400 transition">Privacy Policy</NuxtLink>
          <NuxtLink to="/terms" class="hover:text-amber-800 dark:hover:text-amber-400 transition">Terms of Service</NuxtLink>
          <NuxtLink to="/contact" class="hover:text-amber-800 dark:hover:text-amber-400 transition">Contact</NuxtLink>
        </nav>

        <div class="flex gap-4">
          <a href="#" class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-amber-50 dark:hover:bg-gray-600 hover:text-amber-800 dark:hover:text-amber-400 transition">
            <Icon name="ion:logo-instagram" size="20" />
          </a>
          <a href="#" class="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-amber-50 dark:hover:bg-gray-600 hover:text-amber-800 dark:hover:text-amber-400 transition">
            <Icon name="ion:logo-facebook" size="20" />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>