<template>
  <v-container fluid>
    <!-- 面包屑导航 -->
    <!-- <v-breadcrumbs :items="breadcrumbs" class="px-0 mb-4">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs> -->

    <!-- 加载状态 -->
    <v-row v-if="loading && !dataset">
      <v-col cols="12" class="text-center py-12">
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
        <p class="mt-4 text-grey">加载中...</p>
      </v-col>
    </v-row>

    <!-- 错误状态 -->
    <v-row v-else-if="!loading && !dataset && err">
      <v-col cols="12">
        <v-alert type="error" variant="tonal" prominent>
          <v-alert-title class="text-h6">加载失败</v-alert-title>
          <div class="mt-2">{{ err }}</div>
          <template v-slot:append>
            <v-btn color="error" variant="text" @click="load">
              重试
              <v-icon end>mdi-refresh</v-icon>
            </v-btn>
          </template>
        </v-alert>
      </v-col>
    </v-row>

    <!-- 数据内容 -->
    <v-row v-else-if="dataset">
      <v-col cols="12">
        <!-- 数据集标题卡片 -->
        <v-card class="mb-6" elevation="3">
          <v-card-title class="text-h4 pa-6 bg-gradient">
            <v-icon size="48" class="mr-3" color="primary"
              >mdi-file-document</v-icon
            >
            {{ dataset.name }}
          </v-card-title>

          <v-card-text class="pa-6">
            <v-row>
              <v-col cols="12" md="8">
                <!-- 数据集信息 -->
                <v-list lines="two" class="transparent">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="info">mdi-tag</v-icon>
                    </template>
                    <v-list-item-title>数据提供者</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="info" variant="tonal">
                        {{ dataset.ownerName }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="info">mdi-tag</v-icon>
                    </template>
                    <v-list-item-title>领域</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="info" variant="tonal">
                        {{ dataset.domain }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="warning">mdi-file-code</v-icon>
                    </template>
                    <v-list-item-title>数据类型</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="warning" variant="tonal">
                        {{ dataset.dataType }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="success">mdi-download</v-icon>
                    </template>
                    <v-list-item-title>下载次数</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="success" variant="tonal">
                        {{ dataset.downloads }} 次
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="secondary">mdi-database</v-icon>
                    </template>
                    <v-list-item-title>文件大小</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatSize(dataset.fileSize) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="4" class="d-flex align-center justify-center">
                <v-btn
                  size="x-large"
                  color="primary"
                  :loading="requesting"
                  @click="requestShare(dataset.id)"
                  block
                  class="text-h6"
                >
                  <v-icon start size="large">mdi-download</v-icon>
                  请求共享
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- 数据描述 -->
        <v-card class="mb-6" elevation="2">
          <v-card-title class="bg-info text-white">
            <v-icon class="mr-2">mdi-information</v-icon>
            数据描述
          </v-card-title>
          <v-card-text class="pa-6">
            <p class="text-body-1" style="line-height: 1.8">
              {{ dataset.description || "暂无描述" }}
            </p>
          </v-card-text>
        </v-card>

        <!-- 数据预览 -->
        <v-card elevation="2">
          <v-card-title class="bg-secondary text-white">
            <v-icon class="mr-2">mdi-eye</v-icon>
            数据预览（前10行）
          </v-card-title>
          <v-card-text class="pa-0">
            <v-sheet
              v-if="previewText"
              class="pa-4"
              color="grey-lighten-5"
              rounded="0"
            >
              <pre class="preview-content">{{ previewText }}</pre>
            </v-sheet>
            <div v-else class="text-center pa-12">
              <v-icon size="60" color="grey-lighten-1"
                >mdi-file-eye-outline</v-icon
              >
              <p class="text-grey mt-4">暂无预览数据</p>
            </div>
          </v-card-text>
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
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api";

const route = useRoute();
const router = useRouter();
const dataset = ref(null);
const previewLines = ref([]);
const err = ref("");
const loading = ref(false);
const requesting = ref(false);
const showError = ref(false);

const previewText = computed(() => previewLines.value.join("\n"));

// const breadcrumbs = computed(() => [
//   { title: "数据市场", to: "/market", disabled: false },
//   { title: dataset.value?.name || "详情", disabled: true },
// ]);

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
    const { data } = await api.get(`/api/datasets/${route.params.id}`);
    dataset.value = data.dataset;
    previewLines.value = data.previewLines || [];
  } catch (e) {
    err.value = e?.response?.data?.message || "加载失败";
    showError.value = true;
  } finally {
    loading.value = false;
  }
}

// async function download() {
//   err.value = "";
//   downloading.value = true;
//   try {
//     const res = await api.get(`/api/datasets/${route.params.id}/download`, {
//       responseType: "blob",
//     });
//     const blob = new Blob([res.data]);
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = dataset.value?.name || "dataset_download";
//     a.click();
//     URL.revokeObjectURL(url);
//   } catch (e) {
//     err.value = e?.response?.data?.message || "下载失败（需要登录）";
//     showError.value = true;
//   } finally {
//     downloading.value = false;
//   }
// }

async function requestShare(datasetId) {
  requesting.value = true;
  try {
    await api.post("/api/shares/requests", {datasetId, message: "我需要用于研究/课程项目" });
    // 提示：已提交
  } catch (e) {
    // 提示：e.response.data.message
    err.value = e?.response?.data?.message || "加载失败";
    showError.value = true;
  } finally {
    requesting.value = false;
  }
}

watch(showError, (val) => {
  if (!val) err.value = "";
});

onMounted(load);
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.preview-content {
  font-family: "Courier New", monospace;
  font-size: 13px;
  line-height: 1.6;
  margin: 0;
  max-height: 500px;
  overflow: auto;
  background: white;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.transparent {
  background: transparent !important;
}
</style>
