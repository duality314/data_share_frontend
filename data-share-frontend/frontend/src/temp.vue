<!-- <template>
  <div style="max-width: 1000px; margin: 0 auto; padding: 16px;">
    <header style="display:flex; gap:12px; align-items:center; margin-bottom:16px;">
      <RouterLink to="/market">数据市场</RouterLink>
      <RouterLink to="/register-data">数据登记</RouterLink>
      <RouterLink to="/my">我的数据</RouterLink>
      <div style="margin-left:auto;">
        <span v-if="auth.user">👤 {{ auth.user.username }}</span>
        <button v-if="auth.user" @click="logout" style="margin-left:8px;">退出</button>
        <RouterLink v-else to="/login">登录</RouterLink>
      </div>
    </header>
    <RouterView />
  </div>
</template>

<script setup>
import { useAuthStore } from "./store/auth";
const auth = useAuthStore();
function logout() {
  auth.logout();
  location.href = "/login";
}
</script> -->
