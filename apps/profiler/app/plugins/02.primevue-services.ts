import ConfirmationService from 'primevue/confirmationservice';
import DialogService from 'primevue/dialogservice';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.use(ConfirmationService);
  nuxtApp.vueApp.use(DialogService);
});
