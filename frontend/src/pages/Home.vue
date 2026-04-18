<template>
  <div class="app-container">
    <!-- 导航抽屉 -->
    <HomeMenuDrawer/>

    <!-- 主要内容区域 -->
    <v-main class="bg-grey-lighten-3">
      <v-container fluid class="pa-4">
        <v-card class="content-card" rounded="lg" elevation="2">
          <router-view/>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import HomeMenuDrawer from "@/components/layout/HomeMenuDrawer.vue";
</script>

<style scoped>
/* 应用容器样式 - 设置最大宽度并居中 */
.app-container {
  max-width: 2000px;
  margin: 0 auto;
  width: 100%;
  position: relative;
}

.content-card {
  padding: 20px;
  min-height: 400px;
}

/* 移动端样式调整 */
@media (max-width: 960px) {
  .app-container {
    max-width: none;
  }
  
  .content-card {
    padding: 16px;
  }
}
</style>
