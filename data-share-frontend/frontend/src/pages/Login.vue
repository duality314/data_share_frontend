<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="5" lg="4">
        <v-card class="elevation-12" rounded="lg">
          <v-card-title class="text-h5 text-center bg-primary pa-6 ruc-header">
            <v-icon size="48" class="mb-2 text-white">mdi-lock-outline</v-icon>
            <div class="text-white font-weight-bold">数据共享平台</div>
            <div class="text-caption text-white mt-1" style="opacity: 0.9;">用户登录</div>
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid" @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="用户名"
                prepend-inner-icon="mdi-account"
                :rules="usernameRules"
                required
                clearable
                variant="outlined"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="密码"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                :type="showPassword ? 'text' : 'password'"
                :rules="passwordRules"
                required
                @click:append-inner="showPassword = !showPassword"
                @keyup.enter="login"
                variant="outlined"
              ></v-text-field>

              <v-alert
                v-if="err"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="err = ''"
              >
                {{ err }}
              </v-alert>

              <v-btn
                block
                size="large"
                color="primary"
                :loading="loading"
                @click="login"
                class="mb-3"
              >
                <v-icon start>mdi-login</v-icon>
                登录
              </v-btn>

              <v-btn
                block
                size="large"
                variant="outlined"
                color="secondary"
                :loading="loading"
                @click="register"
              >
                <v-icon start>mdi-account-plus</v-icon>
                注册（同账号密码）
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <v-card class="mt-4 bg-blue-lighten-5" variant="tonal">
          <v-card-text>
            <div class="text-center">
              <v-icon color="info" size="small">mdi-information</v-icon>
              <span class="text-body-2 ml-2">
                首次使用请先注册账号
              </span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="text-body-2 text-grey-darken-1">
              <div class="mb-1">✨ 登录后可以：</div>
              <div class="ml-4">
                • 浏览数据市场中的所有数据集<br>
                • 登记和管理自己的数据<br>
                • 下载其他用户分享的数据
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api";
import { useAuthStore } from "../store/auth";

const router = useRouter();
const auth = useAuthStore();

const username = ref("");
const password = ref("");
const err = ref("");
const loading = ref(false);
const valid = ref(false);
const showPassword = ref(false);
const formRef = ref(null);

const usernameRules = [
  (v) => !!v || "请输入用户名",
  (v) => (v && v.length >= 1) || "用户名至少3个字符",
];

const passwordRules = [
  (v) => !!v || "请输入密码",
  (v) => (v && v.length >= 1) || "密码至少3个字符",
];

async function register() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  err.value = "";
  loading.value = true;
  try {
    await api.post("/api/auth/register", {
      username: username.value,
      password: password.value,
    });
    await login();
  } catch (e) {
    err.value = e?.response?.data?.message || "注册失败";
  } finally {
    loading.value = false;
  }
}

async function login() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  err.value = "";
  loading.value = true;
  try {
    const { data } = await api.post("/api/auth/login", {
      username: username.value,
      password: password.value,
    });
    auth.setAuth(data.token, data.user);
    router.push("/main/market");
  } catch (e) {
    err.value = e?.response?.data?.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 200px);
}

/* 人大红主题标题 */
.ruc-header {
  background: linear-gradient(135deg, #AE0B2A 0%, #D4153A 100%) !important;
}
</style>
