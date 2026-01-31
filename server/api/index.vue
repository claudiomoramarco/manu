<script lang="ts" setup>
import { ProductsOrderByEnum } from '#woo';
const { addToCart } = useCart();
const router = useRouter();

// --- DATI STANDARD WOONUXT ---
const { siteName, description, shortDescription, siteImage } = useAppConfig();
const { data } = await useAsyncGql('getProductCategories', { first: 6 });
const productCategories = data.value?.productCategories?.nodes || [];
const { data: productData } = await useAsyncGql('getProducts', { first: 5, orderby: ProductsOrderByEnum.POPULARITY });
const popularProducts = productData.value.products?.nodes || [];

useSeoMeta({
  title: `Servizio Riparazioni Online`,
  ogTitle: siteName,
  description: description,
  ogDescription: shortDescription,
  ogImage: siteImage,
  twitterCard: `summary_large_image`,
});

// --- CONFIGURAZIONE WIZARD ---
const repairOptions: Record<string, any> = {
  scarpe: {
    label: "Scarpe",
    description: "Tacchi, suole, lucidatura, cambio colore...",
    icon: "mdi:shoe-sneaker",
    services: ['Risuolatura Completa', 'Mezza Suola', 'Tacco', 'Lucidatura', 'Lavaggio', 'Incollaggio', 'Altro']
  },
  borse: {
    label: "Borse e Valigie",
    description: "Manici, zip, tintura, angoli rovinati...",
    icon: "mdi:bag-suitcase",
    services: ['Cucitura', 'Sostituzione Zip', 'Tintura', 'Pulizia', 'Manici', 'Ruote', 'Altro']
  },
  abbigliamento: {
    label: "Abbigliamento",
    description: "Strappi, buchi, cerniere, fodere, rammendo...",
    icon: "mdi:tshirt-crew-outline",
    services: ['Cerniera', 'Strappo', 'Tintura', 'Restauro', 'Fodera', 'Altro']
  },
  accessori: {
    label: "Accessori",
    description: "Cinture, portafogli, guanti, piccola pelletteria...",
    icon: "mdi:wallet-outline",
    services: ['Cucitura', 'Sostituzione Zip', 'Tintura', 'Accorciatura', 'Buchi']
  }
};

// --- STATO ---
const selectedCategory = ref<string | null>(null);
const selectedService = ref<string>("");
const repairNotes = ref<string>(""); 
const repairBrand = ref<string>("");
const customerEmail = ref<string>(""); // CAMPO EMAIL IMPORTANTE
const previewUrls = ref<string[]>([]);
const selectedFiles = ref<File[]>([]);
const MAX_FILES = 5;
const isSubmitting = ref(false);
const isSuccess = ref(false);

const scrollSection = ref<HTMLElement | null>(null);
const scrollTrack = ref<HTMLElement | null>(null);
const translateX = ref(0);
const sectionHeight = ref('auto');

const currentHeroSlide = ref(0);
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1605518216938-7f31b7b64712?q=80&w=1920&auto=format&fit=crop',
    title: 'Maestri Artigiani',
    subtitle: 'La tradizione del cuoio nelle nostre mani.'
  },
  {
    image: 'https://images.unsplash.com/photo-1459603677915-a62079ffd002?q=80&w=1920&auto=format&fit=crop',
    title: 'Riparazioni di Lusso',
    subtitle: 'Ridiamo vita ai tuoi accessori preferiti.'
  },
  {
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=1920&auto=format&fit=crop',
    title: 'Cura del Dettaglio',
    subtitle: 'Ogni cucitura racconta una storia.'
  }
];

const beforeAfterSlides = ref([
    { title: 'Risuolatura Completa', description: 'Sostituzione suola in cuoio e lucidatura profonda su Oxford classica.', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop', filter: 'grayscale' },
    { title: 'Restauro Sneakers', description: 'Whitening della suola, pulizia tecnica e ripristino colore.', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop', filter: 'sepia' },
    { title: 'Cambio Colore Borsa', description: 'Da pelle rovinata a un nuovo colore nero intenso con trattamento nutriente.', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=400&auto=format&fit=crop', filter: 'contrast-125 brightness-75' },
]);

const luxuryBrands = [
    'simple-icons:gucci', 'simple-icons:prada', 'simple-icons:nike', 'simple-icons:adidas', 
    'simple-icons:hermes', 'simple-icons:chanel', 'simple-icons:dior', 'simple-icons:louisvuitton', 
    'simple-icons:burberry', 'simple-icons:fendi', 'simple-icons:balenciaga', 'simple-icons:versace',
    'simple-icons:saintlaurent', 'simple-icons:goldengoose', 'simple-icons:christianlouboutin',
    'simple-icons:salvatoreferragamo', 'simple-icons:bottegaveneta', 'simple-icons:alexandermcqueen',
    'simple-icons:valentino', 'simple-icons:dolceandgabbana', 'simple-icons:givenchy', 'simple-icons:tods',
    'simple-icons:hogan', 'simple-icons:churchs', 'simple-icons:jimmychoo', 'simple-icons:manoloblahnik',
    'simple-icons:timberland', 'simple-icons:drmartens', 'simple-icons:ugg', 'simple-icons:crocs',
    'simple-icons:newbalance', 'simple-icons:asics', 'simple-icons:puma', 'simple-icons:reebok',
    'simple-icons:vans', 'simple-icons:converse', 'simple-icons:jordan', 'simple-icons:underarmour'
];

const currentCategoryData = computed(() => {
  if (selectedCategory.value && repairOptions[selectedCategory.value]) {
    return repairOptions[selectedCategory.value];
  }
  return null;
});

let slideInterval: any;
onMounted(() => {
  slideInterval = setInterval(() => {
    currentHeroSlide.value = (currentHeroSlide.value + 1) % heroSlides.length;
  }, 5000);
  
  window.addEventListener('scroll', updateScroll);
  window.addEventListener('resize', updateScroll);
  // Give time for DOM to render
  setTimeout(updateScroll, 500);
});

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval);
  window.removeEventListener('scroll', updateScroll);
  window.removeEventListener('resize', updateScroll);
});

// --- FUNZIONI ---
const updateScroll = () => {
  if (!scrollSection.value || !scrollTrack.value) return;

  const sectionRect = scrollSection.value.getBoundingClientRect();
  const trackWidth = scrollTrack.value.scrollWidth;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Calculate scroll limits
  const maxScroll = trackWidth - windowWidth + 48; // + padding
  if (maxScroll <= 0) {
      sectionHeight.value = 'auto';
      translateX.value = 0;
      return;
  }

  const totalHeight = maxScroll + windowHeight;
  sectionHeight.value = `${totalHeight}px`;

  // Calculate progress based on how far the section top has moved up
  let progress = -sectionRect.top;
  
  if (progress < 0) progress = 0;
  if (progress > maxScroll) progress = maxScroll;
  
  translateX.value = progress;
};

const selectCategory = (key: string) => {
  selectedCategory.value = key;
  selectedService.value = "";
  repairNotes.value = "";
};

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files ? Array.from(target.files) : [];
  if (!files.length) return;
  if (selectedFiles.value.length + files.length > MAX_FILES) {
      alert(`Puoi caricare massimo ${MAX_FILES} foto.`);
      return;
  }
  files.forEach(file => {
    selectedFiles.value.push(file);
    previewUrls.value.push(URL.createObjectURL(file));
  });
  target.value = ''; 
};

const removeImage = (index: number) => {
  const urlToRemove = previewUrls.value[index];
  if (urlToRemove) URL.revokeObjectURL(urlToRemove);
  previewUrls.value.splice(index, 1);
  selectedFiles.value.splice(index, 1);
};

const scrollToWizard = () => {
  const element = document.getElementById('wizard-section');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

// --- INVIO AL BACKEND ---
const startQuoteRequest = async () => {
    if(!selectedCategory.value || !selectedService.value || selectedFiles.value.length === 0 || !customerEmail.value) {
        alert("Per favore compila tutti i campi, inclusa la mail e le foto.");
        return;
    }
    
    isSubmitting.value = true;

    try {
        // 1. Upload Images to R2
        let uploadedImageUrls: string[] = [];
        if (selectedFiles.value.length > 0) {
            const uploadFormData = new FormData();
            selectedFiles.value.forEach((file) => {
                uploadFormData.append('files', file);
            });

            const uploadResponse = await $fetch<{ urls: string[] }>('/api/upload-r2', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (uploadResponse && uploadResponse.urls) {
                uploadedImageUrls = uploadResponse.urls;
            }
        }

        // 2. Add "Preventivo" Product to Cart with Meta Data
        const { data: preventivoData } = await useAsyncGql('getProduct', { slug: 'preventivo' });
        const preventivoProduct = preventivoData.value?.product;

        if (preventivoProduct) {
            // Prepare metadata for the cart item
            const metaData = [
                { key: 'Categoria', value: repairOptions[selectedCategory.value].label },
                { key: 'Servizio', value: selectedService.value },
                { key: 'Marca', value: repairBrand.value || 'N/A' },
                { key: 'Email Cliente', value: customerEmail.value },
                { key: 'Note', value: repairNotes.value || 'Nessuna nota' },
                { key: 'Foto', value: uploadedImageUrls.length > 0 ? uploadedImageUrls.join(', ') : 'Nessuna foto' }
            ];

            // Add to cart with metadata
            await addToCart({ 
                productId: preventivoProduct.databaseId, 
                quantity: 1,
                metaData 
            });
            
            router.push('/checkout');
        } else {
            // Fallback if product not found (just show success message)
            console.warn("Product 'preventivo' not found. Showing success message instead.");
            isSuccess.value = true;
        }
    } catch (error) {
        alert("Errore nell'invio. Controlla la console per i dettagli.");
        console.error(error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
  <main class="bg-white min-h-screen">
    <section class="relative h-[600px] overflow-hidden mb-20">
      <div 
        v-for="(slide, index) in heroSlides" 
        :key="index"
        class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
        :class="index === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'"
      >
        <div class="absolute inset-0 bg-black/40 z-10"></div>
        <img :src="slide.image" class="w-full h-full object-cover" :alt="slide.title" />
        <div class="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 class="text-5xl md:text-7xl font-bold mb-4 tracking-tight animate-fade-in-up">{{ slide.title }}</h1>
          <p class="text-xl md:text-2xl font-light max-w-2xl animate-fade-in-up animation-delay-200">{{ slide.subtitle }}</p>
          <button @click="scrollToWizard" class="mt-8 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 px-8 rounded-full transition-all transform hover:scale-105 animate-fade-in-up animation-delay-400">
            Inizia la Riparazione
          </button>
        </div>
      </div>
      
      <!-- Indicators -->
      <div class="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
        <button 
          v-for="(_, index) in heroSlides" 
          :key="index"
          @click="currentHeroSlide = index"
          class="w-3 h-3 rounded-full transition-all"
          :class="index === currentHeroSlide ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'"
        ></button>
      </div>
    </section>

    <div id="wizard-section" class="container mx-auto px-4 -mt-10 mb-16 relative z-10">
      
      <div v-if="isSuccess" class="bg-white rounded-2xl shadow-xl p-12 text-center max-w-3xl mx-auto border border-green-100 animate-fade-in-up">
        <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="ion:checkmark" size="40" />
        </div>
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Richiesta Ricevuta!</h2>
        <p class="text-gray-600 mb-8">Abbiamo preso in carico la tua richiesta. Un nostro artigiano la valuterà e ti risponderà al più presto.</p>
        <button @click="isSuccess = false; selectedCategory = null; selectedFiles = []; repairNotes = ''; customerEmail = ''" class="text-amber-700 font-semibold hover:underline">
            Invia una nuova richiesta
        </button>
      </div>

      <div v-else class="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-5xl mx-auto ring-1 ring-gray-900/5">
        
        <div class="bg-gray-900 text-white p-8 text-center relative overflow-hidden">
            <div class="relative z-10">
                <h2 class="text-2xl md:text-3xl font-bold mb-2">Riparazione Online</h2>
                <p class="text-gray-400">Raccontaci il problema, carica le foto, ricevi il preventivo.</p>
            </div>
            <div class="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
        </div>

        <div class="p-6 md:p-10">
            
            <div class="mb-12">
                <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center">
                    <span class="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">1</span>
                    Cosa dobbiamo riparare?
                </h3>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div 
                        v-for="(option, key) in repairOptions" :key="key"
                        @click="selectCategory(key as string)"
                        class="cursor-pointer border-2 rounded-2xl p-6 flex flex-col items-center justify-center transition-all duration-300 group"
                        :class="selectedCategory === key 
                            ? 'border-amber-700 bg-amber-50 shadow-md transform scale-105' 
                            : 'border-gray-100 hover:border-gray-300 hover:bg-gray-50'"
                    >
                        <Icon :name="option.icon" class="w-10 h-10 mb-3 transition-colors" :class="selectedCategory === key ? 'text-amber-800' : 'text-gray-400 group-hover:text-gray-600'" size="40" />
                        <span class="font-bold text-sm uppercase tracking-wide" :class="selectedCategory === key ? 'text-amber-900' : 'text-gray-500'">{{ option.label }}</span>
                        <span class="text-xs text-center mt-2 leading-tight" :class="selectedCategory === key ? 'text-amber-800/80' : 'text-gray-400'">{{ option.description }}</span>
                    </div>
                </div>
            </div>

            <div v-if="currentCategoryData" class="grid md:grid-cols-2 gap-10 animate-fade-in-up border-t border-gray-100 pt-8 mt-8">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">2</span>
                        Tipo di intervento
                    </h3>
                    <select v-model="selectedService" class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:border-amber-800 outline-none transition-all">
                        <option value="" disabled selected>Seleziona dalla lista...</option>
                        <option v-for="service in currentCategoryData.services" :key="service" :value="service">
                            {{ service }}
                        </option>
                    </select>
                    <div class="mt-3 text-sm text-amber-800 flex items-start gap-2 bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <Icon name="ion:information-circle-outline" class="flex-shrink-0 mt-0.5" size="18" />
                        <p>Non sai cosa scegliere? Seleziona <strong>Altro</strong> e descrivi il problema nelle note.</p>
                    </div>
                </div>

                <div :class="{ 'opacity-50 pointer-events-none': !selectedService }">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">3</span>
                        Foto del danno
                    </h3>
                    <div class="grid grid-cols-4 gap-2 mb-4">
                        <div v-for="(url, index) in previewUrls" :key="url" class="relative group rounded-lg overflow-hidden aspect-square border border-gray-200 shadow-sm">
                            <img :src="url" class="w-full h-full object-cover" />
                            <button @click="removeImage(index)" class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                <Icon name="ion:close" size="12" />
                            </button>
                        </div>
                        <label v-if="selectedFiles.length < MAX_FILES" class="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-amber-500 transition-all group">
                            <Icon name="ion:camera-outline" size="24" class="text-gray-400 group-hover:text-amber-600 mb-1" />
                            <span class="text-xs text-gray-500 font-medium">Aggiungi</span>
                            <input type="file" class="hidden" @change="handleImageUpload" accept="image/*" multiple>
                        </label>
                    </div>
                </div>
            </div>

            <div v-if="selectedFiles.length > 0" class="mb-6 animate-fade-in-up border-t border-gray-100 pt-8 mt-8 grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-amber-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">4</span>
                        I tuoi contatti
                    </h3>
                    <label class="block text-sm font-medium text-gray-700 mb-2">La tua Email (Obbligatoria)</label>
                    <input 
                        type="email" 
                        v-model="customerEmail" 
                        placeholder="nome@email.com" 
                        class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:border-amber-800 outline-none"
                    />
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">+</span>
                        Note aggiuntive
                    </h3>
                    <textarea
                        v-model="repairNotes"
                        rows="3"
                        class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:border-amber-800 outline-none resize-none"
                        placeholder="Dettagli extra..."
                    ></textarea>
                </div>
                <div>
                    <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span class="bg-gray-200 text-gray-600 w-8 h-8 rounded-full flex items-center justify-center text-sm mr-3 font-bold">?</span>
                        Marca (Opzionale)
                    </h3>
                    <input type="text" v-model="repairBrand" placeholder="Es. Gucci, Nike, Samsonite..." class="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-800 focus:border-amber-800 outline-none" />
                    <p class="text-xs text-gray-400 mt-2">Conoscere la marca ci aiuta a preparare un preventivo più accurato.</p>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                <button 
                    @click="startQuoteRequest" 
                    :disabled="!selectedService || selectedFiles.length === 0 || !customerEmail || isSubmitting"
                    class="bg-black text-white text-lg font-bold py-4 px-10 rounded-xl shadow-xl hover:bg-gray-800 hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 transform active:scale-95"
                >
                    <span v-if="!isSubmitting">Invia Richiesta</span>
                    <span v-else>Invio in corso...</span>
                    <Icon v-if="!isSubmitting" name="ion:paper-plane-outline" size="20" />
                    <Icon v-else name="eos-icons:loading" size="24" />
                </button>
            </div>

        </div>
      </div>
    </div>
    
    <!-- SEZIONE COME FUNZIONA -->
    <section class="container mx-auto px-4 mb-24">
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Come Funziona</h2>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">Dal tuo armadio al nostro laboratorio, in 4 semplici passi.</p>
      </div>
      
      <div class="grid md:grid-cols-4 gap-8 relative">
        <!-- Connecting line for desktop -->
        <div class="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10 transform -translate-y-1/2"></div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
          <div class="relative w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 ring-4 ring-white">
            <Icon name="ion:create-outline" size="32" />
            <span class="absolute -top-1 -right-1 bg-amber-800 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">1</span>
          </div>
          <h3 class="font-bold text-xl mb-3">Compila il Modulo</h3>
          <p class="text-gray-500">Descrivi il danno e carica le foto qui sopra. Più dettagli ci dai, più preciso sarà il preventivo.</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
          <div class="relative w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 ring-4 ring-white">
            <Icon name="ion:receipt-outline" size="32" />
            <span class="absolute -top-1 -right-1 bg-amber-800 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">2</span>
          </div>
          <h3 class="font-bold text-xl mb-3">Ricevi Preventivo</h3>
          <p class="text-gray-500">Analizziamo le foto e ti inviamo una quotazione su misura via email o WhatsApp.</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
          <div class="relative w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 ring-4 ring-white">
            <Icon name="ion:cube-outline" size="32" />
            <span class="absolute -top-1 -right-1 bg-amber-800 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">3</span>
          </div>
          <h3 class="font-bold text-xl mb-3">Ritiro a Domicilio</h3>
          <p class="text-gray-500">Accetta il preventivo e il corriere passerà a ritirare le tue scarpe dove vuoi tu.</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center relative flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group">
          <div class="relative w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 ring-4 ring-white">
            <Icon name="ion:sparkles-outline" size="32" />
            <span class="absolute -top-1 -right-1 bg-amber-800 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">4</span>
          </div>
          <h3 class="font-bold text-xl mb-3">Torna come Nuovo</h3>
          <p class="text-gray-500">I nostri artigiani lavorano con passione. Riceverai il tuo accessorio rigenerato.</p>
        </div>
      </div>
    </section>

    <!-- SEZIONE CHI SIAMO -->
    <section class="container mx-auto px-4 mb-24 flex flex-col md:flex-row items-center gap-24 py-12">
        <div class="md:w-1/2 relative h-[500px] flex items-center justify-center group">
            <div class="absolute w-72 h-[28rem] rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform transition-all duration-700 ease-out group-hover:-translate-x-24 group-hover:-rotate-12 rotate-[-6deg] z-10 origin-bottom-left bg-gray-100">
                <img src="https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=800&auto=format&fit=crop" alt="Strumenti" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity">
            </div>
            <div class="absolute w-72 h-[28rem] rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform transition-all duration-700 ease-out group-hover:-translate-y-6 z-20 bg-gray-100">
                <img src="https://images.unsplash.com/photo-1605518216938-7f31b7b64712?q=80&w=800&auto=format&fit=crop" alt="Pellame" class="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity">
            </div>
            <div class="absolute w-72 h-[28rem] rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform transition-all duration-700 ease-out group-hover:translate-x-24 group-hover:rotate-12 rotate-[6deg] z-30 origin-bottom-right bg-gray-100">
                <img src="https://images.unsplash.com/photo-1459603677915-a62079ffd002?q=80&w=800&auto=format&fit=crop" alt="Il Calzolaio" class="w-full h-full object-cover">
            </div>
        </div>
        <div class="md:w-1/2">
            <span class="text-amber-800 font-bold tracking-wider uppercase text-sm">La Nostra Storia</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-6">Più che Calzolai, Custodi di Storie.</h2>
            <p class="text-gray-600 text-lg mb-6 leading-relaxed">
                Ogni scarpa ha una strada percorsa e una storia da raccontare. Nel nostro laboratorio, non ci limitiamo a riparare suole o tacchi. 
                Noi ridiamo dignità ai tuoi accessori preferiti, utilizzando tecniche antiche unite a prodotti moderni per garantire durata ed estetica.
            </p>
            <p class="text-gray-600 text-lg mb-8 leading-relaxed">
                Che sia una scarpa elegante tramandata dal nonno o la tua sneaker preferita consumata dai concerti, la trattiamo con lo stesso rispetto.
            </p>
            <div class="flex gap-4">
                <div class="flex flex-col">
                    <span class="text-3xl font-bold text-amber-800">40+</span>
                    <span class="text-sm text-gray-500">Anni di Esperienza</span>
                </div>
                <div class="w-px bg-gray-300 h-12"></div>
                <div class="flex flex-col">
                    <span class="text-3xl font-bold text-amber-800">10k+</span>
                    <span class="text-sm text-gray-500">Riparazioni Effettuate</span>
                </div>
            </div>
        </div>
    </section>

    <!-- SEZIONE PRIMA E DOPO -->
    <section ref="scrollSection" class="bg-stone-100 mb-24 relative" :style="{ height: sectionHeight }">
      <div class="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        <div class="container mx-auto px-4 mb-12">
            <div class="text-center">
            <span class="text-amber-800 font-bold tracking-wider uppercase text-sm">Il Nostro Laboratorio</span>
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">Prima & Dopo</h2>
            <p class="text-gray-600 text-lg max-w-2xl mx-auto">Non buttare le tue scarpe preferite. Guarda cosa possiamo fare con un po' di amore e artigianalità.</p>
            </div>
        </div>
        
        <div ref="scrollTrack" class="flex gap-8 px-4 w-max will-change-transform" :style="{ transform: `translateX(-${translateX}px)` }">
              <!-- 4 sets of slides for seamless infinite scroll on large screens -->
              <template v-for="i in 4" :key="i">
                <div v-for="(slide, index) in beforeAfterSlides" :key="`${i}-${index}`" class="w-[350px] flex-shrink-0 group">
                  <div class="bg-white rounded-2xl overflow-hidden shadow-lg h-full flex flex-col transform transition-transform hover:scale-105 duration-300">
                      <div class="relative h-64 overflow-hidden">
                          <div class="absolute inset-0 flex">
                              <div class="w-1/2 relative border-r border-white/20">
                                  <img :src="slide.image" class="w-full h-full object-cover filter transition-all duration-300 group-hover:filter-none" :class="slide.filter" alt="Prima">
                                  <span class="absolute top-4 left-4 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">PRIMA</span>
                              </div>
                              <div class="w-1/2 relative">
                                  <img :src="slide.image" class="w-full h-full object-cover transition-all duration-300" alt="Dopo">
                                  <span class="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded">DOPO</span>
                              </div>
                          </div>
                      </div>
                      <div class="p-6">
                          <h3 class="font-bold text-xl mb-2" v-text="slide.title"></h3>
                          <p class="text-gray-500 text-sm" v-text="slide.description"></p>
                      </div>
                  </div>
                </div>
              </template>
        </div>

        <div class="container mx-auto px-4 mt-12">
            <div class="text-center">
            <button @click="scrollToWizard" class="inline-flex items-center gap-2 text-amber-800 font-bold hover:text-amber-900 transition-colors">
                Richiedi un preventivo per il tuo restauro <Icon name="ion:arrow-forward" />
            </button>
            </div>
        </div>
      </div>
    </section>

    <!-- LOGO SLIDER -->
    <section class="py-12 bg-white overflow-hidden border-b border-gray-100 mb-24">
      <div class="container mx-auto px-4 mb-8 text-center">
        <p class="text-gray-400 uppercase tracking-widest text-xs font-bold">Trattiamo i migliori marchi</p>
      </div>
      <div class="slider-container !py-0">
          <div class="slider-track !animation-duration-[60s]">
              <template v-for="i in 2" :key="i">
                <div v-for="brand in luxuryBrands" :key="`${i}-${brand}`" class="w-[100px] mx-8 flex-shrink-0 flex items-center justify-center opacity-40 hover:opacity-100 transition-all duration-300 hover:scale-110">
                   <Icon :name="brand" size="48" class="text-gray-800" />
                </div>
              </template>
          </div>
      </div>
    </section>

    <section class="container my-16 px-4">
      <div class="flex items-end justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Le Collezioni</h2>
        <NuxtLink class="text-amber-800 font-semibold hover:underline" to="/categories">Vedi tutte</NuxtLink>
      </div>
      <div class="grid justify-center grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <CategoryCard v-for="(category, i) in productCategories" :key="i" class="w-full" :node="category" />
      </div>
    </section>

    <section class="container my-16 px-4" v-if="popularProducts">
      <div class="flex items-end justify-between mb-8">
        <h2 class="text-2xl font-bold text-gray-900">I più venduti</h2>
        <NuxtLink class="text-amber-800 font-semibold hover:underline" to="/products">Vedi tutti</NuxtLink>
      </div>
      <ProductRow :products="popularProducts" class="grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6" />
    </section>

    <section class="container grid gap-6 my-24 md:grid-cols-4 px-4">
      <div class="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Icon name="ion:cube-outline" size="40" class="text-amber-800 mb-4" />
        <h3 class="font-bold text-lg">Spedizione Comoda</h3>
        <p class="text-sm text-gray-500">Ritiro e consegna a casa tua</p>
      </div>
      <div class="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Icon name="ion:shield-checkmark-outline" size="40" class="text-amber-800 mb-4" />
        <h3 class="font-bold text-lg">Preventivo Chiaro</h3>
        <p class="text-sm text-gray-500">Sai subito quanto spendi</p>
      </div>
      <div class="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Icon name="ion:hammer-outline" size="40" class="text-amber-800 mb-4" />
        <h3 class="font-bold text-lg">Mastro Calzolaio</h3>
        <p class="text-sm text-gray-500">Esperienza da generazioni</p>
      </div>
      <div class="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
        <Icon name="ion:chatbubbles-outline" size="40" class="text-amber-800 mb-4" />
        <h3 class="font-bold text-lg">Supporto Diretto</h3>
        <p class="text-sm text-gray-500">Sempre attivi</p>
      </div>
    </section>
  </main>
</template>

<style lang="postcss" scoped>
@import "tailwindcss";

@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
    animation: fadeInUp 0.4s ease-out forwards;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

@keyframes scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.slider-container {
  @apply relative py-4 overflow-hidden;
}

.slider-track {
  @apply flex w-max;
  animation: scroll 40s linear infinite;
}

.slider-container:hover .slider-track {
  animation-play-state: paused;
}
</style>