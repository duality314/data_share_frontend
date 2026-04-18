<template>
  <v-navigation-drawer
    :model-value="innerDrawer"
    @update:model-value="(val) => (innerDrawer = val)"
    :permanent="!isMobile"
    :temporary="isMobile"
    color="white"
    width="280"
    :absolute="!isMobile"
    :style="isMobile ? 'z-index: 2002;' : ''"
  >
    <v-list nav dense>
      <v-list-item
        v-for="item in menuItems"
        :key="item.id_name"
        :to="{ name: item.id_name }"
        @click="handleNavigation(item.id_name)"
        link
        color="#b00020"
        rounded="lg"
        class="ma-2"
      >
        <template v-slot:prepend>
          <v-icon :icon="item.icon || 'mdi-circle'" class="me-3"></v-icon>
        </template>
        <v-list-item-title class="text-subtitle-1">
          {{ item.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>

    <template v-slot:append>
      <!-- 底栏 -->
      <div
        style="
          text-align: center;
          padding: 16px 0;
          font-size: 13px;
          color: #888;
          background: #fff;
        "
      >
        <v-divider style="margin: 10px auto; width: 80%"/>
        <div>© 2026 数据共享平台</div>
        <div class="mt-1">让数据流动起来</div>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";

const innerDrawer = ref(window.innerWidth > 960);
const router = useRouter();

const menuItems = [
  { id_name: "market", title: "数据市场", icon: "mdi-store" },
  { id_name: "register-data", title: "数据登记", icon: "mdi-upload" },
  { id_name: "my", title: "我的数据", icon: "mdi-folder-account" },
  { id_name: "account", title: "我的账户", icon: "mdi-account-cog" },
];

// 移动端适配
const isMobile = ref(false);
const checkMobile = () => {
  isMobile.value = window.innerWidth <= 960;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  // 监听顶栏菜单按钮事件，移动端切换抽屉
  window.addEventListener("toggle-home-drawer", () => {
    if (window.innerWidth <= 960) {
      innerDrawer.value = !innerDrawer.value;
    }
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  window.removeEventListener("toggle-home-drawer", () => {
  });
});

const handleNavigation = (componentName) => {
  router.push({ name: componentName });
  // 仅在移动端点击菜单后关闭抽屉，桌面端始终展开
  if (isMobile.value) {
    innerDrawer.value = false;
  }
};
</script>

<style scoped>
</style>
