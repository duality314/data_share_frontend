<template>
  <v-app>
    <AppHeader/>
    <router-view/>
  </v-app>
</template>

<script setup>
import AppHeader from "@/components/layout/AppHeader.vue";
</script>

<style>
/* 全局样式 - 确保页面可以正常滚动 */
html, body {
  overflow-x: hidden; /* 禁止横向滚动 */
  overflow-y: auto; /* 启用纵向滚动 */
}

/* 确保 v-app 不会限制高度 */
.v-application {
  overflow: visible !important;
}
</style>

<style scoped>
</style>
