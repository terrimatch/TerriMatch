import { createApp } from 'vue';  // sau React, în funcție de ce folosești
import App from './App.vue';      // componenta principală pentru TWA

const app = createApp(App);

// Aici poți adăuga store, router și alte configurări necesare
app.mount('#app');
