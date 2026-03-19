import { createApp } from "vue";
import { createPinia } from "pinia";        //全局状态管理
import { router } from "./router";          //页面切换系统
import vuetify from "./plugins/vuetify";    //UI组件库
import App from "./App.vue";                //根组件

const app = createApp(App);                 //创建Vue应用实例
// 开发调试：启用 devtools（仅在开发环境用于调试）
app.config.devtools = true;
app.use(createPinia());
app.use(router);
app.use(vuetify);
app.mount("#app");                      //把VUE应用挂载到HTML中id为app的元素上
