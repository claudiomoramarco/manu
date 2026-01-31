import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
    './woonuxt_base/components/**/*.{vue,js,ts}',
    './woonuxt_base/layouts/**/*.vue',
    './woonuxt_base/pages/**/*.vue',
    './woonuxt_base/composables/**/*.{js,ts}',
    './woonuxt_base/plugins/**/*.{js,ts}',
    './woonuxt_base/app.vue',
    './woonuxt_base/error.vue',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
