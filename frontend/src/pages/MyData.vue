<template>
  <v-container fluid>
    <!-- 页面标题 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon size="40" color="primary" class="mr-3"
              >mdi-folder-account</v-icon
            >
            <div>
              <h1 class="text-h4 font-weight-bold">我的数据</h1>
              <p class="text-subtitle-1 text-grey mb-0">管理您的数据集</p>
            </div>
          </div>
          <v-btn
            color="primary"
            size="large"
            :loading="loading"
            @click="load"
          >
            <v-icon start>mdi-refresh</v-icon>
            刷新
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- 1.我登记的数据 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
        我登记的数据
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- 空状态 -->
        <div
          v-if="!loading && owned.length === 0"
          class="text-center pa-12"
        >
          <v-icon size="80" color="grey-lighten-1"
            >mdi-folder-open-outline</v-icon
          >
          <h3 class="text-h6 mt-4 text-grey">暂无数据</h3>
          <p class="text-body-2 text-grey mt-2">
            您还没有登记任何数据集，去登记一个吧！
          </p>
          <v-btn color="primary" class="mt-2" to="/main/register-data">
            <v-icon start>mdi-plus</v-icon>
            登记数据
          </v-btn>
        </div>

        <!-- 数据列表 -->
        <v-list v-else lines="three">
          <template v-for="(d, index) in owned" :key="d.id">
            <v-list-item>
              <template v-slot:prepend>
                <v-avatar color="primary" size="48">
                  <v-icon color="white">mdi-file-document</v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="text-h6 font-weight-medium mb-2">
                {{ d.name }}
              </v-list-item-title>

              <v-list-item-subtitle class="mb-2">
                <v-chip
                  size="small"
                  color="info"
                  variant="tonal"
                  class="mr-2"
                >
                  <v-icon start size="small">mdi-tag</v-icon>
                  {{ d.domain }}
                </v-chip>
                <v-chip
                  size="small"
                  color="warning"
                  variant="tonal"
                  class="mr-2"
                >
                  <v-icon start size="small">mdi-file-code</v-icon>
                  {{ d.dataType }}
                </v-chip>
                <v-chip size="small" color="success" variant="tonal">
                  <v-icon start size="small">mdi-download</v-icon>
                  {{ d.downloads }} 次下载
                </v-chip>
              </v-list-item-subtitle>

              <v-list-item-subtitle class="text-grey-darken-1">
                {{ d.description || "暂无描述" }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="d-flex flex-column align-center">
                  <v-switch
                    v-model="d.isListed"
                    color="success"
                    :loading="d.updating"
                    hide-details
                    @update:model-value="(val) => toggle(d, val)"
                  >
                    <template v-slot:label>
                      <span :class="d.isListed ? 'text-success' : 'text-grey'">
                        {{ d.isListed ? "已上架" : "未上架" }}
                      </span>
                    </template>
                  </v-switch>
                </div>
              </template>
            </v-list-item>
            <v-divider v-if="index < owned.length - 1" :key="`divider-${d.id}`"></v-divider>
          </template>
        </v-list>
      </v-card-text>

      <!-- 加载中 -->
      <v-overlay
        :model-value="loading"
        contained
        class="align-center justify-center"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-card>

    <!-- 2. 我共享的数据 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
        我共享的数据
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- 空状态 -->
        <div
          v-if="!loading && sharings.length === 0"
          class="text-center pa-12"
        >
          <v-icon size="80" color="grey-lighten-1"
            >mdi-folder-open-outline</v-icon
          >
          <h3 class="text-h6 mt-4 text-grey">暂无数据</h3>
          <p class="text-body-2 text-grey mt-2">
            您还没有共享任何数据！
          </p>
          <!-- <v-btn color="primary" class="mt-2" to="/register-data">
            <v-icon start>mdi-plus</v-icon>
            共享数据
          </v-btn> -->
        </div>

        <!-- 数据列表 -->
        <v-list v-if="sharings.length">
          <v-list-item v-for="sharing in sharings" :key="sharing.id">
            <v-list-item-title class="font-weight-medium">
              {{ sharing.datasetName }}
            </v-list-item-title>

            <v-list-item-subtitle>
              请求人：{{ sharing.consumerName}}
              <span class="ml-2 text-grey">理由：{{ sharing.request_description || "无" }}</span>
            </v-list-item-subtitle>

            <template #append>
              <div class="d-flex ga-2">
                <v-btn color="success" variant="tonal" size="small"
                  :loading="sharing._busy"
                  @click="decide(sharing, true)">
                  批准
                </v-btn>
                <v-btn color="error" variant="tonal" size="small"
                  :loading="sharing._busy"
                  @click="decide(sharing, false)">
                  拒绝
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal">暂无共享请求</v-alert>

      </v-card-text>

      <!-- 加载中 -->
      <v-overlay
        :model-value="loading"
        contained
        class="align-center justify-center"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-card>

<!-- 3.共享给我的数据 -->
    <v-card class="mb-6" elevation="2">
      <v-card-title class="bg-primary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-file-document-multiple</v-icon>
        共享给我的数据
      </v-card-title>

      <v-card-text class="pa-0">
        <!-- 空状态 -->
        <div
          v-if="!loading && shareds.length === 0"
          class="text-center pa-12"
        >
          <v-icon size="80" color="grey-lighten-1"
            >mdi-folder-open-outline</v-icon
          >
          <h3 class="text-h6 mt-4 text-grey">暂无数据</h3>
          <p class="text-body-2 text-grey mt-2">
            您还没有被共享任何数据！
          </p>
          <v-btn color="primary" class="mt-2" to="/main/market">
            <v-icon start>mdi-plus</v-icon>
            数据查找
          </v-btn>
        </div>
        
        <!-- 数据列表 -->
        <v-list v-if="shareds.length" lines="two">
          <v-list-item v-for="shared in shareds" :key="shared.id">
            <v-list-item-title class="font-weight-medium">
              {{ shared.datasetName }}
            </v-list-item-title>
            <v-list-item-subtitle>
              来自：{{ shared.providerName}}
            </v-list-item-subtitle>

            <template #append>
              <v-btn
                color="primary"
                variant="tonal"
                :loading="downloading"
                @click="download(shared)"
              >
                <v-icon start size="large">mdi-download</v-icon>
                下载
              </v-btn>
            </template>
          </v-list-item>
        </v-list>

        <v-alert v-else type="info" variant="tonal">暂无共享给我的数据</v-alert>
      </v-card-text>

      <!-- 加载中 -->
      <v-overlay
        :model-value="loading"
        contained
        class="align-center justify-center"
      >
        <v-progress-circular
          color="primary"
          indeterminate
          size="64"
        ></v-progress-circular>
      </v-overlay>
    </v-card>




    <!-- 我下载的数据 -->
    <v-card elevation="2">
      <v-card-title class="bg-secondary text-white d-flex align-center">
        <v-icon class="mr-2">mdi-download-multiple</v-icon>
        我下载的数据
      </v-card-title>

      <v-card-text>
        <v-alert type="info" variant="tonal" prominent>
          <v-alert-title class="text-h6">功能说明</v-alert-title>
          <div class="mt-2">
            <!-- 后续可用 download_logs 按 userId 聚合展示已下载的数据列表。 -->
          </div>
        </v-alert>
      </v-card-text>
    </v-card>

    <!-- 错误提示 -->
    <v-snackbar v-model="showError" color="error" :timeout="3000">
      <v-icon start>mdi-alert-circle</v-icon>
      {{ err }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { api } from "../api";

const owned = ref([]);
const err = ref("");
const loading = ref(false);
const showError = ref(false);
const sharings = ref([]);
const shareds = ref([]);
const downloading = ref(false);

// 我的共享
async function fetchSharing() {
  const { data } = await api.get("/api/shares/sharing-with-others");
  sharings.value = data.sharing.map(x => ({ ...x, is_shared: false }));
}
async function decide(r, status) {

  await api.post("/api/shares/update", {shareId: r.id,isShared: status});
  await fetchSharing();
}
onMounted(fetchSharing);

//共享给我的
async function fetchSharedWithMe() {
  const { data } = await api.get("/api/shares/shared-with-me");
  shareds.value = data.shared.map(x => ({ ...x }));
  downloading.value = false;
}
async function download(r) {
  downloading.value = true;
  try {
    // 用 blob 下载文件
    const resp = await api.get(`/api/datasets/${r.datasetId}/download`, { responseType: "blob" });

    const blob = new Blob([resp.data]);
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${r.datasetName || "dataset"}`; // 可加后缀
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } finally {
    downloading.value = false;
  }
}
onMounted(fetchSharedWithMe);


async function load() {
  err.value = "";
  loading.value = true;
  try {
    const { data } = await api.get("/api/datasets/mine");
    owned.value = (data.owned || []).map((item) => ({
      ...item,
      updating: false,
    }));
  } catch (e) {
    err.value = e?.response?.data?.message || "加载失败";
    showError.value = true;
  } finally {
    loading.value = false;
  }
}

async function toggle(d, isListed) {
  d.updating = true;
  try {
    const { data } = await api.patch(`/api/datasets/${d.id}/listing`, {
      isListed,
    });
    d.isListed = data.dataset.isListed;
  } catch (e) {
    err.value = e?.response?.data?.message || "更新失败";
    showError.value = true;
    d.isListed = !isListed;
  } finally {
    d.updating = false;
  }
}

watch(showError, (val) => {
  if (!val) err.value = "";
});

onMounted(load);
</script>
