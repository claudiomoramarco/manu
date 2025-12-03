import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   nitro: {
      envPrefix: string,
   },

   "graphql-client": {
      clients: any,
   },

   icon: {
      serverKnownCssClasses: Array<any>,
   },
  }
  interface SharedPublicRuntimeConfig {
   "graphql-client": {
      clients: {
         default: {
            token: {
               type: string,

               name: string,
            },

            proxyCookies: boolean,

            tokenStorage: {
               mode: string,

               cookieOptions: {
                  maxAge: number,

                  secure: boolean,
               },

               name: string,
            },

            preferGETQueries: boolean,

            host: string,

            headers: {
               Origin: string,
            },

            fetchOptions: {
               mode: string,

               credentials: string,
            },
         },
      },
   },

   LOGO: any,

   PRODUCTS_PER_PAGE: number,

   GLOBAL_PRODUCT_ATTRIBUTES: Array<any>,

   MAX_PRICE: number,

   FRONT_END_URL: any,

   BACKEND_URL: string,

   CURRENCY_CODE: string,

   CURRENCY_SYMBOL: string,

   WOO_NUXT_SEO: Array<any>,

   STRIPE_PUBLISHABLE_KEY: string,

   i18n: {
      baseUrl: string,

      defaultLocale: string,

      rootRedirect: any,

      redirectStatusCode: number,

      skipSettingLocaleOnNavigate: boolean,

      locales: Array<{

      }>,

      detectBrowserLanguage: {
         alwaysRedirect: boolean,

         cookieCrossOrigin: boolean,

         cookieDomain: any,

         cookieKey: string,

         cookieSecure: boolean,

         fallbackLocale: string,

         redirectOn: string,

         useCookie: boolean,
      },

      experimental: {
         localeDetector: string,

         typedPages: boolean,

         typedOptionsAndMessages: boolean,

         alternateLinkCanonicalQueries: boolean,

         devCache: boolean,

         cacheLifetime: any,

         stripMessagesPayload: boolean,

         preload: boolean,

         strictSeo: boolean,

         nitroContextDetection: boolean,

         httpCacheDuration: number,
      },

      domainLocales: {
         en_US: {
            domain: string,
         },

         de_DE: {
            domain: string,
         },

         es_ES: {
            domain: string,
         },

         fr_FR: {
            domain: string,
         },

         it_IT: {
            domain: string,
         },

         pt_BR: {
            domain: string,
         },
      },
   },
  }
declare module '@nuxt/schema' {
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }