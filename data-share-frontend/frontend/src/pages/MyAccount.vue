<template>
  <v-container fluid>
    <!-- 页面标题 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="40" color="primary" class="mr-3">mdi-account-circle</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">我的账户</h1>
            <p class="text-subtitle-1 text-grey mb-0">管理您的账户信息和API Token</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- API Token 卡片 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-key</v-icon>
        API Token
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- 说明信息 -->
        <v-alert type="info" variant="tonal" prominent class="mb-4">
          <v-alert-title class="text-h6">Token 用途</v-alert-title>
          <div class="mt-2">
            <p class="text-body-2">
              使用此 Token 可以在其他应用（如 DeepAnalyze）中访问您在数据市场的数据。
            </p>
            <p class="text-body-2 mt-2 text-error">
              ⚠️ 请妥善保管您的 Token，不要分享给他人。泄露 Token 可能导致您的数据被他人访问。
            </p>
          </div>
        </v-alert>

        <!-- Token 显示区域 -->
        <div class="mb-4">
          <label class="text-body-2 font-weight-medium mb-2 d-block">
            您的 API Token
          </label>
          <v-card variant="outlined" class="mb-3">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <code
                  class="flex-grow-1 text-truncate font-mono text-body-2"
                  :class="{ 'text-grey': !showToken }"
                >
                  {{ displayToken }}
                </code>
                <v-btn
                  icon
                  variant="text"
                  size="small"
                  @click="toggleTokenVisibility"
                  class="ml-2"
                >
                  <v-icon>{{ showToken ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>

          <!-- 操作按钮 -->
          <div class="d-flex gap-2 flex-wrap">
            <v-btn
              color="primary"
              prepend-icon="mdi-content-copy"
              @click="copyToken"
              :loading="copying"
            >
              复制Token
            </v-btn>
            <v-btn
              color="warning"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="showRegenerateDialog = true"
            >
              重新生成
            </v-btn>
          </div>
        </div>

        <!-- 使用说明 -->
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title>
              <v-icon class="mr-2">mdi-help-circle</v-icon>
              如何在 DeepAnalyze 中使用？
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <ol class="pl-4">
                <li class="mb-2">点击上方的"复制Token"按钮</li>
                <li class="mb-2">打开 DeepAnalyze 应用</li>
                <li class="mb-2">点击右上角的"设置"按钮（⚙️图标）</li>
                <li class="mb-2">找到"数据市场连接设置"</li>
                <li class="mb-2">粘贴Token并点击"保存"</li>
                <li>现在可以从数据市场选择文件了！</li>
              </ol>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>

    <!-- 用户信息卡片 -->
    <v-card elevation="2">
      <v-card-title class="bg-secondary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-account</v-icon>
        账户信息
      </v-card-title>

      <v-card-text class="pa-6">
        <v-list>
          <v-list-item>
            <v-list-item-title>用户名</v-list-item-title>
            <v-list-item-subtitle>{{ auth.user?.username || '未登录' }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-title>邮箱</v-list-item-title>
            <v-list-item-subtitle>{{ auth.user?.email || '未设置' }}</v-list-item-subtitle>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item>
            <v-list-item-title>显示名称</v-list-item-title>
            <v-list-item-subtitle>{{ auth.user?.name || '未设置' }}</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- 重新生成Token确认对话框 -->
    <v-dialog v-model="showRegenerateDialog" max-width="500">
      <v-card>
        <v-card-title class="bg-warning text-white">
          <v-icon class="mr-2">mdi-alert</v-icon>
          确认重新生成Token
        </v-card-title>
        <v-card-text class="pa-4">
          <p class="text-body-1 mb-2">
            重新生成Token后：
          </p>
          <ul class="pl-4">
            <li class="mb-1">旧Token将立即失效</li>
            <li class="mb-1">使用旧Token的应用将无法访问</li>
            <li class="mb-1">需要在新应用中重新配置Token</li>
          </ul>
          <p class="text-body-2 text-error mt-3">
            确定要继续吗？
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showRegenerateDialog = false">
            取消
          </v-btn>
          <v-btn
            color="warning"
            @click="regenerateToken"
            :loading="regenerating"
          >
            确认重新生成
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 成功提示 -->
    <v-snackbar v-model="showSuccess" color="success" :timeout="3000">
      <v-icon start>mdi-check-circle</v-icon>
      {{ successMessage }}
    </v-snackbar>

    <!-- 错误提示 -->
    <v-snackbar v-model="showError" color="error" :timeout="3000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ errorMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../store/auth";
import { api } from "../api";

const auth = useAuthStore();
const showToken = ref(false);
const copying = ref(false);
const showRegenerateDialog = ref(false);
const regenerating = ref(false);
const showSuccess = ref(false);
const showError = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

// 获取当前Token（从localStorage或store）
const currentToken = computed(() => {
  return auth.token || localStorage.getItem("token") || "";
});

// 显示Token（遮罩或完整）
const displayToken = computed(() => {
  if (!currentToken.value) return "未登录";
  if (showToken.value) return currentToken.value;
  
  // 遮罩显示：前10个字符 + ... + 后10个字符
  const token = currentToken.value;
  if (token.length < 20) return token;
  return token.substring(0, 10) + "...".repeat(3) + token.substring(token.length - 10);
});

// 切换Token显示/隐藏
const toggleTokenVisibility = () => {
  showToken.value = !showToken.value;
};

// 复制Token
const copyToken = async () => {
  if (!currentToken.value) {
    errorMessage.value = "未登录，无法获取Token";
    showError.value = true;
    return;
  }

  copying.value = true;
  try {
    await navigator.clipboard.writeText(currentToken.value);
    successMessage.value = "Token已复制到剪贴板";
    showSuccess.value = true;
  } catch (err) {
    // 降级方案：使用传统方法
    const textarea = document.createElement("textarea");
    textarea.value = currentToken.value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      successMessage.value = "Token已复制";
      showSuccess.value = true;
    } catch (e) {
      errorMessage.value = "复制失败，请手动复制";
      showError.value = true;
    }
    document.body.removeChild(textarea);
  } finally {
    copying.value = false;
  }
};

// 重新生成Token
const regenerateToken = async () => {
  regenerating.value = true;
  try {
    // 调用后端API重新生成Token
    // 注意：如果后端没有这个接口，这里会失败
    // 可以先注释掉，只提示用户需要重新登录
    const { data } = await api.post("/api/auth/regenerate-token");
    
    // 更新Token
    auth.setAuth(data.token, auth.user);
    localStorage.setItem("token", data.token);
    
    successMessage.value = "Token已重新生成，旧Token已失效";
    showSuccess.value = true;
    showRegenerateDialog.value = false;
  } catch (err) {
    console.error("Regenerate token error:", err);
    // 如果后端没有这个接口，提示用户重新登录
    errorMessage.value = 
      err.response?.status === 404
        ? "后端暂不支持重新生成Token，请重新登录获取新Token"
        : "重新生成失败：" + (err.response?.data?.message || "未知错误");
    showError.value = true;
    showRegenerateDialog.value = false;
  } finally {
    regenerating.value = false;
  }
};

onMounted(() => {
  // 页面加载时检查登录状态
  if (!auth.token && !localStorage.getItem("token")) {
    // 可以提示用户登录
  }
});
</script>

<style scoped>
code {
  word-break: break-all;
  user-select: all;
}
</style>
