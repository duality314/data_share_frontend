import { createRouter, createWebHistory } from "vue-router"; //官方路由管理库（页面切换系统）
import Login from "./pages/Login.vue";
import Home from "./pages/Home.vue";
import MyData from "./pages/MyData.vue";
import RegisterData from "./pages/RegisterData.vue";
import Market from "./pages/Market.vue";
import DatasetDetail from "./pages/DatasetDetail.vue";
import MyAccount from "./pages/MyAccount.vue";

import { useAuthStore } from "./store/auth";                //引入认证状态管理

//路由表
const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "login", component: Login },
  {
    path: "/main",
    name: "home",
    component: Home,
    redirect: "/main/market",
    meta: { requiresAuth: false },
    children: [
      { path: "market", name: "market", component: Market },
      { path: "my", name: "my", component: MyData, meta: { requiresAuth: true } },
      { path: "register-data", name: "register-data", component: RegisterData, meta: { requiresAuth: true } },
      { path: "dataset/:id", name: "dataset-detail", component: DatasetDetail },
      { path: "account", name: "account", component: MyAccount, meta: { requiresAuth: true } },
    ]
  }
];

//创建路由实例
export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {                 //全局路由守卫（每次跳转页面之前执行）; to:目标URL信息
  const auth = useAuthStore();              //读取登陆状态 auth.token
  
  
  if (to.meta.requiresAuth && !auth.token) {// 检查是否需要登录
    
    return {                                // 重定向到登录页，并保存原始目标路径
      path: "/login",
      query: { redirect: to.fullPath }
    };
  }
});
