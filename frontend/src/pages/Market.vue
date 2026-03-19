<template>
  <v-container fluid>
    <!-- 页面标题 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="40" color="primary" class="mr-3">mdi-store</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">数据市场</h1>
            <p class="text-subtitle-1 text-grey mb-0">
              浏览和发现优质数据集
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 筛选卡片 -->
    <v-card class="mb-6" elevation="2" >
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="4" >
            <v-text-field
              v-model="domain"
              label="领域筛选"
              prepend-inner-icon="mdi-filter"
              placeholder="按领域筛选（留空=全部）"
              clearable
              hide-details
              variant="outlined"
              density="comfortable"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sort"
              label="排序方式"
              :items="sortOptions"
              item-title="text"
              item-value="value"
              prepend-inner-icon="mdi-sort"
              hide-details
              variant="outlined"
              density="comfortable"
            ></v-select>
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              block
              size="large"
              color="primary"
              :loading="loading"
              @click="load"
            >
              <v-icon start>mdi-magnify</v-icon>
              查询
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 数据列表 -->
    <v-row v-if="!loading && list.length === 0">
      <v-col cols="12">
        <v-card class="text-center pa-12" elevation="0" color="grey-lighten-5">
          <v-icon size="80" color="grey-lighten-1">mdi-database-off</v-icon>
          <h3 class="text-h6 mt-4 text-grey">暂无上架数据</h3>
          <p class="text-body-2 text-grey mt-2">请稍后再试或调整筛选条件</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-else>
      <v-col
        v-for="d in list"
        :key="d.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          class="dataset-card"
          elevation="2"
          :loading="loading"
          hover
          @click="goToDetail(d.id)"
        >
          <v-card-title class="d-flex align-start">
            <v-icon color="primary" class="mr-2">mdi-file-document</v-icon>
            <div class="flex-grow-1 text-truncate">{{ d.name }}</div>
          </v-card-title>

          <v-card-subtitle class="mt-2">
            <v-chip
              size="small"
              color="info"
              variant="tonal"
              class="mr-2 mb-1"
            >
              <v-icon start size="small">mdi-tag</v-icon>
              {{ d.domain }}
            </v-chip>
            <v-chip
              size="small"
              color="warning"
              variant="tonal"
              class="mr-2 mb-1"
            >
              <v-icon start size="small">mdi-database</v-icon>
              {{ formatSize(d.fileSize) }}
            </v-chip>
            <v-chip size="small" color="success" variant="tonal" class="mb-1">
              <v-icon start size="small">mdi-download</v-icon>
              {{ d.downloads }}
            </v-chip>
          </v-card-subtitle>

          <v-card-text>
            <p class="text-body-2 text-grey-darken-1 line-clamp-3">
              {{ d.description || "暂无描述" }}
            </p>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="text"
              @click.stop="goToDetail(d.id)"
            >
              查看详情
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- 错误提示 -->
    <v-snackbar v-model="showError" color="error" :timeout="3000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ err }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../store/auth";
import { api } from "../api";

const router = useRouter();
const list = ref([]);
const domain = ref("");
const sort = ref("new");
const err = ref("");
const loading = ref(false);
const showError = ref(false);

const sortOptions = [
  { text: "最新", value: "new" },
  { text: "下载量", value: "downloads" },
  { text: "数据量", value: "size" },
];

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

async function load() {
  err.value = "";
  loading.value = true;
  try {
    const params = {};
    if (domain.value) params.domain = domain.value;
    if (sort.value && sort.value !== "new") params.sort = sort.value;

    const { data } = await api.get("/api/datasets/market", { params });
    list.value = data.list || [];
  } catch (e) {
    err.value = e?.response?.data?.message || "加载失败";
    showError.value = true;
  } finally {
    loading.value = false;
  }
}

function goToDetail(id) {
  const auth = useAuthStore();
  if (!auth.token) {
    router.push({ path: "/login", query: { redirect: `/main/dataset/${id}` } });
    return;
  }

  router.push(`/main/dataset/${id}`);
}

watch(showError, (val) => {
  if (!val) err.value = "";
});

onMounted(load);
</script>

<style scoped>
.dataset-card {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
}

.dataset-card:hover {
  transform: translateY(-4px);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

