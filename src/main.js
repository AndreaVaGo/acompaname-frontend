import { createApp } from "vue";
// Tipografías propias, servidas desde la propia web (sin llamar a Google Fonts)
import "@fontsource-variable/fraunces/index.css";
import "@fontsource-variable/dm-sans/index.css";
import "./style.css";
import "./styles/variables.css";
import "./styles/base.css";
import "./styles/adminTabla.css";
import App from "./App.vue";
import router from "./router";
import pinia from "./pinia/pinia";

createApp(App).use(router).use(pinia).mount("#app");