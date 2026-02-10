<template>
  <v-container fluid>
    <!-- 页面标题 -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="40" color="primary" class="mr-3">mdi-upload</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">数据登记（上传）</h1>
            <p class="text-subtitle-1 text-grey mb-0">
              上传您的数据集到平台
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- 上传表单 -->
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="3">
          <v-card-title class="bg-primary text-white text-h5">
            <v-icon class="mr-2">mdi-form-textbox</v-icon>
            填写数据集信息
          </v-card-title>

          <v-card-text class="pa-6">
            <v-form ref="formRef" v-model="valid">
              <!-- 数据名称 -->
              <v-text-field
                v-model="name"
                label="数据名称"
                prepend-inner-icon="mdi-file-document"
                :rules="nameRules"
                required
                clearable
                variant="outlined"
                class="mb-2"
              ></v-text-field>

              <!-- 专业领域 -->
              <v-text-field
                v-model="domain"
                label="专业领域"
                prepend-inner-icon="mdi-tag"
                placeholder="如：chemistry / finance / general"
                :rules="domainRules"
                required
                clearable
                variant="outlined"
                class="mb-2"
              >
                <template v-slot:append-inner>
                  <v-tooltip location="top">
                    <template v-slot:activator="{ props }">
                      <v-icon v-bind="props" color="info"
                        >mdi-information</v-icon
                      >
                    </template>
                    <span>建议使用英文领域名称</span>
                  </v-tooltip>
                </template>
              </v-text-field>

              <!-- 数据类型 -->
              <v-select
                v-model="dataType"
                label="数据类型"
                :items="dataTypeOptions"
                prepend-inner-icon="mdi-file-code"
                :rules="dataTypeRules"
                required
                variant="outlined"
                class="mb-2"
              ></v-select>

              <!-- 数据描述 -->
              <v-textarea
                v-model="description"
                label="数据描述"
                prepend-inner-icon="mdi-text"
                placeholder="请输入数据描述，包括数据来源、用途等信息"
                :rules="descriptionRules"
                rows="4"
                counter="500"
                maxlength="500"
                required
                variant="outlined"
                class="mb-4"
              ></v-textarea>

              <!-- 文件上传 -->
              <v-card variant="outlined" class="mb-4">
                <v-card-text>
                  <div class="text-subtitle-1 mb-4 font-weight-medium">
                    <v-icon class="mr-2">mdi-file-upload</v-icon>
                    选择文件
                  </div>

                  <v-file-input
                    v-model="file"
                    label="点击选择文件"
                    prepend-icon=""
                    prepend-inner-icon="mdi-paperclip"
                    :rules="fileRules"
                    required
                    show-size
                    variant="outlined"
                    
                  >
                    <template v-slot:selection="{ fileNames }">
                      <v-chip
                        v-for="fileName in fileNames"
                        :key="fileName"
                        color="primary"
                        label
                        class="mr-2"
                      >
                        <v-icon start>mdi-file</v-icon>
                        {{ fileName }}
                      </v-chip>
                    </template>
                  </v-file-input>

                  <v-alert
                    v-if="file"
                    type="success"
                    variant="tonal"
                    density="compact"
                    class="mt-2"
                  >
                    <v-icon start>mdi-check-circle</v-icon>
                    已选择文件：{{ file.name }} ({{ formatSize(file.size) }})
                  </v-alert>
                </v-card-text>
              </v-card>

              <!-- 提交按钮 -->
              <v-row>
                <v-col cols="12" md="6">
                  <v-btn
                    block
                    size="x-large"
                    color="primary"
                    :loading="uploading"
                    :disabled="!valid || !file"
                    @click="upload"
                  >
                    <v-icon start>mdi-cloud-upload</v-icon>
                    上传到服务器
                  </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    block
                    size="x-large"
                    variant="outlined"
                    color="secondary"
                    @click="resetForm"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    重置表单
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- 成功提示 -->
        <v-alert
          v-if="msg"
          type="success"
          variant="tonal"
          class="mt-4"
          closable
          @click:close="msg = ''"
        >
          <v-alert-title class="text-h6">上传成功！</v-alert-title>
          <div class="mt-2">{{ msg }}</div>
          <template v-slot:append>
            <v-btn color="success" variant="text" to="/my">
              去我的数据
              <v-icon end>mdi-arrow-right</v-icon>
            </v-btn>
          </template>
        </v-alert>
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
import { ref, watch } from "vue";
import { api } from "../api";

const name = ref("");
const description = ref("");
const domain = ref("general");
const dataType = ref("csv");
const file = ref(null);
const fileInput = ref([]);
const msg = ref("");
const err = ref("");
const uploading = ref(false);
const valid = ref(false);
const showError = ref(false);
const formRef = ref(null);

const dataTypeOptions = [
  { title: "CSV", value: "csv" },
  { title: "JSON", value: "json" },
  { title: "SQL", value: "sql" },
  { title: "TXT", value: "txt" },
  { title: "其他", value: "other" },
];

const nameRules = [
  (v) => !!v || "请输入数据名称",
  (v) => (v && v.length >= 3) || "数据名称至少3个字符",
];

const domainRules = [(v) => !!v || "请输入专业领域"];

const dataTypeRules = [(v) => !!v || "请选择数据类型"];

const descriptionRules = [
  (v) => !!v || "请输入数据描述",
  (v) => (v && v.length >= 10) || "数据描述至少10个字符",
];

const fileRules = [(v) => !!v  || "请选择文件"];

// 上传问题，暂时搁置
// function handleFileChange(files) {
//   if (files && files.length > 0) {
//     file.value = files[0];
//   } else {
//     file.value = null;
//   }
// }

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

async function upload() {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid || !file.value) return;

  msg.value = "";
  err.value = "";
  uploading.value = true;

  try {
    const fd = new FormData();
    fd.append("name", name.value);
    fd.append("description", description.value);
    fd.append("domain", domain.value);
    fd.append("dataType", dataType.value);
    fd.append("file", file.value);

    const { data } = await api.post("/api/datasets", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    msg.value = `数据集 ID: ${data.dataset.id}（默认未上架，请去"我的数据"页面进行上架操作）`;
    resetForm();
  } catch (e) {
    err.value = e?.response?.data?.message || "上传失败";
    showError.value = true;
  } finally {
    uploading.value = false;
  }
}

function resetForm() {
  name.value = "";
  description.value = "";
  domain.value = "general";
  dataType.value = "csv";
  file.value = null;
  fileInput.value = [];
  formRef.value?.reset();
}

watch(showError, (val) => {
  if (!val) err.value = "";
});
</script>
