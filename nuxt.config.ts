export default defineNuxtConfig({
  // Get all the pages, components, composables and plugins from the parent theme
  extends: ["./woonuxt_base"],

  components: [{ path: "./components", pathPrefix: false }],

  colorMode: {
    classSuffix: "",
    preference: "dark",
  },

  css: ['~/assets/css/tailwind.css'],

  icon: {
    // Explicitly include icons used in the color mode switcher
    clientBundle: {
      icons: [
        'ion:sun-outline',
        'ion:moon-outline',
      ]
    }
  },

  /**
   * Depending on your servers capabilities, you may need to adjust the following settings.
   * It will affect the build time but also increase the reliability of the build process.
   * If you have a server with a lot of memory and CPU, you can remove the following settings.
   * @property {number} concurrency - How many pages to prerender at once
   * @property {number} interval - How long to wait between prerendering pages
   * @property {boolean} failOnError - This stops the build from failing but the page will not be statically generated
   */
  nitro: {
    prerender: {
      concurrency: 10,
      interval: 1000,
      failOnError: false,
    },
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      // Disable autoprefixer as it's included in @tailwindcss/postcss
      autoprefixer: false,
    },
  },
  runtimeConfig: {
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN,
  },
});
