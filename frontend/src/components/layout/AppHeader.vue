<template>
  <v-app-bar flat elevation="2" color="error">
    <v-app-bar-nav-icon @click="handleMenuClick" class="d-md-none" v-if="!isLoginPage"/>
    <v-app-bar-title @click="goMarket" class="cursor-pointer">
      数据共享平台 - 让数据流动起来
    </v-app-bar-title>

    <v-spacer></v-spacer>

    <template v-if="isLoginPage">
      <!-- 登录页不显示用户信息 -->
    </template>
    <template v-else>
      <div v-if="auth.user" class="d-flex align-center">
        <v-btn class="fill-height">
          {{ auth.user.username }}
        </v-btn>
        <v-btn @click="logout" class="fill-height">退出登录</v-btn>
      </div>
      <v-btn v-else to="/login" variant="text" class="fill-height">
        登录
      </v-btn>
    </template>
  </v-app-bar>
</template>

<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isLoginPage = computed(() => {
  return (
    route.name === "login" ||
    window.location.pathname === "/login" ||
    window.location.pathname === "/"
  );
});

// 移动端菜单按钮直接派发全局事件
function handleMenuClick() {
  const route = router.currentRoute.value;
  if (route.path.startsWith("/main")) {
    window.dispatchEvent(new CustomEvent("toggle-home-drawer"));
  }
}

function logout() {
  auth.logout();
  router.push("/login");
}

function goMarket() {
  router.push("/main/market");
}
</script>

<style scoped>
</style>
