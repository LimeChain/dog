import Vue from 'vue';
import BootstrapVue from 'bootstrap-vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueFormWizard from 'vue-form-wizard';

import 'vue-form-wizard/dist/vue-form-wizard.min.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import 'ti-icons/css/themify-icons.css';

Vue.use(BootstrapVue);
Vue.use(VueFormWizard);
Vue.config.productionTip = false;

new Vue({
	router,
	store,
	render: (h) => h(App),
}).$mount('#app');
