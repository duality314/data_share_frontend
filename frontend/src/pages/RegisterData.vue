<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-icon size="40" color="primary" class="mr-3">mdi-upload</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">数据登记（S3 直传）</h1>
            <p class="text-subtitle-1 text-grey mb-0">文件将直接上传到 S3，后端仅登记元数据</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card elevation="2">
          <v-card-title class="bg-primary text-white text-h6">填写数据集信息</v-card-title>

          <v-card-text>
            <v-form ref="formRef" v-model="valid">
              <v-text-field v-model="name" label="数据名称" :rules="nameRules" required clearable />
              <v-text-field v-model="domain" label="专业领域" :rules="domainRules" placeholder="如：chemistry / finance / general" required clearable />

              <v-select v-model="dataType" :items="dataTypeOptions" label="数据类型" :rules="dataTypeRules" required />

              <v-textarea v-model="description" label="数据描述" :rules="descriptionRules" rows="4" counter="500" maxlength="500" required />

              <v-file-input v-model="file" label="选择文件" :rules="fileRules" show-size truncate-length="40" required />

              <v-divider class="my-4" />

              <v-text-field v-model="region" label="Region" :rules="regionRules" required />
              <v-text-field v-model="bucket" label="Bucket" :rules="bucketRules" required />
              <v-text-field v-model="endpoint" label="Endpoint（可选）" :rules="endpointRules" />

              <v-text-field v-model="accessKeyId" :type="showAccessKey ? 'text' : 'password'" label="Access Key ID" :append-icon="showAccessKey ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showAccessKey = !showAccessKey" :rules="accessKeyRules" required />
              <v-text-field v-model="secretAccessKey" :type="showSecretKey ? 'text' : 'password'" label="Secret Access Key" :append-icon="showSecretKey ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showSecretKey = !showSecretKey" :rules="secretKeyRules" required />
              <v-text-field v-model="sessionToken" label="Session Token" :append-icon="showSessionToken ? 'mdi-eye-off' : 'mdi-eye'" @click:append="showSessionToken = !showSessionToken" :rules="sessionTokenRules" required />

              <v-textarea v-model="credentialJson" label="JSON 凭证（可粘贴 STS JSON 并解析）" rows="3" clearable />
              <v-btn text small @click="parseCredentialJson">解析凭证</v-btn>

              <v-row class="mt-4" align="center">
                <v-col cols="12" md="6">
                  <v-btn :disabled="!canUpload" color="primary" @click="upload">上传并登记</v-btn>
                  <v-btn class="ml-2" text @click="resetForm">重置</v-btn>
                </v-col>
                <v-col cols="12" md="6" class="text-right">
                  <v-btn v-if="canResume" color="warning" @click="resumeWithNewCredentials">凭证续传</v-btn>
                </v-col>
              </v-row>

              <v-progress-linear v-if="uploading" :value="progressPercent" class="my-3"></v-progress-linear>
              <div v-if="msg" class="text-success">{{ msg }}</div>
              <div v-if="showError" class="text-error">{{ err }}</div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from "vue";
import { onBeforeRouteLeave } from "vue-router";
import { api } from "../api";
import { useAuthStore } from "../store/auth";

const STORAGE_PREF_KEY = "registerData.s3.publicPrefs";
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ["csv", "json", "sql", "txt", "zip", "xlsx", "xls"];
const DEFAULT_QUEUE_SIZE = 4;
const DEFAULT_PART_SIZE = 8 * 1024 * 1024;

const auth = useAuthStore();

const name = ref("");
const description = ref("");
const domain = ref("general");
const dataType = ref("csv");
const file = ref(null);

const region = ref("");
const bucket = ref("");
const endpoint = ref("");
const accessKeyId = ref("");
const secretAccessKey = ref("");
const sessionToken = ref("");

const showAccessKey = ref(false);
const showSecretKey = ref(false);
const showSessionToken = ref(false);

const credentialJson = ref("");

const valid = ref(false);
const showError = ref(false);
const formRef = ref(null);
const msg = ref("");
const err = ref("");
const uploading = ref(false);

const uploadState = ref("idle");
const progressPercent = ref(0);
const speedText = ref("-");
const etaText = ref("-");

const latestS3Key = ref("");
const pendingResume = ref(null);

const dataTypeOptions = ["csv", "json", "sql", "txt", "xlsx", "other"].map((v) => ({ title: v.toUpperCase(), value: v }));

const nameRules = [(v) => !!v || "请输入数据名称", (v) => (v && v.length >= 3) || "数据名称至少3个字符"];
const domainRules = [(v) => !!v || "请输入专业领域"];
const dataTypeRules = [(v) => !!v || "请选择数据类型"];
const descriptionRules = [(v) => !!v || "请输入数据描述", (v) => (v && v.length >= 10) || "数据描述至少10个字符"];
const fileRules = [(v) => !!v || "请选择文件", (v) => validateFile(v)];
const regionRules = [(v) => !!v || "请输入 Region"];
const bucketRules = [(v) => !!v || "请输入 Bucket"];
const accessKeyRules = [(v) => !!v || "请输入 Access Key ID"];
const secretKeyRules = [(v) => !!v || "请输入 Secret Access Key"];
const sessionTokenRules = [(v) => !!v || "请输入 Session Token"];
const endpointRules = [(v) => !v || isValidHttpUrl(v) || "Endpoint 必须是 http/https 地址"];

const canUpload = computed(() => valid.value && file.value && region.value.trim() && bucket.value.trim() && accessKeyId.value.trim() && secretAccessKey.value.trim() && sessionToken.value.trim() && !uploading.value);
const canResume = computed(() => !!pendingResume.value && uploadState.value === "failed");

let s3ModuleRef = null;
const getS3Module = async () => (s3ModuleRef ||= await import("../services/s3Upload"));

const loadPublicS3Prefs = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PREF_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    region.value = p.region || "";
    bucket.value = p.bucket || "";
    endpoint.value = p.endpoint || "";
  } catch {
    localStorage.removeItem(STORAGE_PREF_KEY);
  }
};
const persistPublicS3Prefs = () => localStorage.setItem(STORAGE_PREF_KEY, JSON.stringify({ region: region.value.trim(), bucket: bucket.value.trim(), endpoint: endpoint.value.trim() }));

const clearSensitiveCredentials = () => {
  accessKeyId.value = "";
  secretAccessKey.value = "";
  sessionToken.value = "";
  showAccessKey.value = showSecretKey.value = showSessionToken.value = false;
};

const resetForm = () => {
  s3ModuleRef?.abortActiveUpload();
  name.value = "";
  description.value = "";
  domain.value = "general";
  dataType.value = "csv";
  file.value = null;
  credentialJson.value = "";
  clearSensitiveCredentials();
  msg.value = err.value = "";
  progressPercent.value = 0;
  speedText.value = etaText.value = "-";
  uploadState.value = "idle";
  pendingResume.value = latestS3Key.value = null;
  formRef.value?.resetValidation?.();
};

function formatSize(bytes) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

function isValidHttpUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

function validateFile(selectedFile) {
  const target = Array.isArray(selectedFile) ? selectedFile[0] : selectedFile;
  if (!target) return "请选择文件";
  if (target.size > MAX_FILE_SIZE) return `文件过大，最大允许 ${formatSize(MAX_FILE_SIZE)}`;
  const parts = String(target.name || "").split(".");
  const ext = parts.length > 1 ? parts.pop().toLowerCase() : "";
  if (!ALLOWED_EXTENSIONS.includes(ext)) return `不支持的文件类型，允许：${ALLOWED_EXTENSIONS.join(", ")}`;
  return true;
}

function parseCredentialJson() {
  if (!credentialJson.value.trim()) {
    err.value = "请输入 JSON 凭证内容";
    showError.value = true;
    return;
  }
  try {
    const p = JSON.parse(credentialJson.value);
    const accessV = p.accessKeyId || p.AccessKeyId || p.aws_access_key_id;
    const secretV = p.secretAccessKey || p.SecretAccessKey || p.aws_secret_access_key;
    const tokenV = p.sessionToken || p.SessionToken || p.Token || p.aws_session_token;
    if (!accessV || !secretV || !tokenV) throw new Error("JSON 缺少必要字段：accessKeyId、secretAccessKey、sessionToken");
    accessKeyId.value = String(accessV).trim();
    secretAccessKey.value = String(secretV).trim();
    sessionToken.value = String(tokenV).trim();
    showError.value = false;
    err.value = "";
  } catch (e) {
    err.value = e?.message || "JSON 解析失败";
    showError.value = true;
  }
}

const getS3Config = () => ({
  region: region.value.trim(),
  bucket: (bucket.value || "").trim(),
  endpoint: endpoint.value.trim() || undefined,
  credentials: { accessKeyId: accessKeyId.value.trim(), secretAccessKey: secretAccessKey.value.trim(), sessionToken: sessionToken.value.trim() },
});

const getMetadataPayload = (uploaded, selectedFile) => ({
  // only include fields allowed by backend DatasetUploadIn schema
  name: name.value.trim(),
  objectKey: uploaded.s3Key,
  dataType: dataType.value || "file",
  description: description.value.trim() || "",
  domain: domain.value.trim() || "general",
  fileSize: selectedFile?.size || 0,
});

const getUploadPrefixUserId = () => String(auth?.user?.id ?? "anonymous");

function updateProgress(uploadedBytes, totalBytes, startedAt) {
  progressPercent.value = totalBytes > 0 ? (uploadedBytes / totalBytes) * 100 : 0;
  const elapsed = Math.max((Date.now() - startedAt) / 1000, 1);
  const speed = uploadedBytes / elapsed;
  const remain = Math.max(totalBytes - uploadedBytes, 0);
  const eta = speed > 0 ? remain / speed : 0;
  speedText.value = `${formatSize(speed)}/s`;
  etaText.value = eta > 0 ? `${Math.round(eta)}s` : "-";
}

const doUploadWithCurrentCredentials = async (selectedFile, objectKey) => {
  const m = await getS3Module();
  const startedAt = Date.now();
  return m.uploadFileToS3({ ...getS3Config(), file: selectedFile, key: objectKey, queueSize: DEFAULT_QUEUE_SIZE, partSize: DEFAULT_PART_SIZE, onProgress: ({ loaded, total }) => updateProgress(loaded, total || selectedFile.size, startedAt) });
};

const classifyError = async (error) => {
  if (!s3ModuleRef) return { code: String(error?.name || error?.Code || error?.code || "").toLowerCase().includes("expired") ? "credentials_expired" : "unknown" };
  try {
    const m = await getS3Module();
    return m.classifyS3Error(error);
  } catch {
    return { code: "unknown" };
  }
};

const mapUploadErrorFromCode = (code) => ({
  credentials_expired: "STS 凭证已过期，请更新 AK/SK/SessionToken 后点击“更新凭证并续传”。",
  signature_error: "签名错误，请检查 region、bucket、AK/SK/Token 是否匹配。",
  cors_error: "S3 CORS 配置异常，请检查允许源、允许头、ExposeHeaders 包含 ETag。",
  network_error: "网络中断，请检查网络后重试。",
  permission_error: "权限不足，请确认 STS 策略包含上传与删除权限。",
  unknown: "上传失败，请检查凭证、网络和存储桶策略。",
}[code] || "上传失败，请检查凭证、网络和存储桶策略。");

const registerMetadata = async (uploaded, selectedFile, objectKey) => {
  try {
    const payloadObj = getMetadataPayload(uploaded, selectedFile);
    const form = new FormData();
    Object.entries(payloadObj).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    // let axios set the multipart boundary header automatically
    const { data } = await api.post("/api/datasets", form);
    return { ok: true, data };
  } catch (e) {
    try {
      const m = await getS3Module();
      await m.deleteS3Object({ ...getS3Config(), key: objectKey });
      return { ok: false, rollback: true, error: e };
    } catch {
      return { ok: false, rollback: false, error: e };
    }
  }
};

async function buildObjectKey(userId, originalName) {
  const m = await getS3Module();
  return m.buildS3ObjectKey(userId, originalName);
}
async function sanitizeFileNameSafe(fileName) {
  const m = await getS3Module();
  return m.sanitizeFileName(fileName);
}

async function upload() {
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  const fileValidation = validateFile(file.value);
  if (fileValidation !== true) {
    err.value = fileValidation;
    showError.value = true;
    return;
  }

  msg.value = err.value = "";
  uploading.value = true;
  uploadState.value = "uploading";
  progressPercent.value = 0;
  speedText.value = etaText.value = "-";

  const selectedFile = file.value;
  const sanitizedName = await sanitizeFileNameSafe(selectedFile.name);
  const objectKey = await buildObjectKey(getUploadPrefixUserId(), sanitizedName);
  latestS3Key.value = objectKey;
  pendingResume.value = null;
  persistPublicS3Prefs();

  try {
    const uploaded = await doUploadWithCurrentCredentials(selectedFile, objectKey);
    uploadState.value = "registering";
    const reg = await registerMetadata(uploaded, selectedFile, objectKey);
    if (reg.ok) {
      uploadState.value = "done";
      msg.value = `数据集 ID: ${reg.data?.dataset?.id || "-"}（默认未上架，请前往“我的数据”进行上架）`;
      clearSensitiveCredentials();
      credentialJson.value = "";
      file.value = null;
      pendingResume.value = null;
    } else {
      uploadState.value = "failed";
      err.value = `${reg.error?.response?.data?.message || "元数据登记失败"}。${reg.rollback ? "已尝试回滚删除 S3 对象。" : `回滚删除失败，请保存 s3Key 以便补录：${objectKey}`}`;
      showError.value = true;
    }
  } catch (uploadErr) {
    uploadState.value = "failed";
    const categorized = await classifyError(uploadErr);
    err.value = mapUploadErrorFromCode(categorized.code);
    showError.value = true;
    if (categorized.code === "credentials_expired") pendingResume.value = { file: selectedFile, key: objectKey };
  } finally {
    uploading.value = false;
  }
}

async function resumeWithNewCredentials() {
  if (!pendingResume.value || uploading.value) return;
  err.value = "";
  showError.value = false;
  uploading.value = true;
  uploadState.value = "uploading";
  persistPublicS3Prefs();
  try {
    const { file: selectedFile, key: objectKey } = pendingResume.value;
    const uploaded = await doUploadWithCurrentCredentials(selectedFile, objectKey);
    uploadState.value = "registering";
    const reg = await registerMetadata(uploaded, selectedFile, objectKey);
    if (reg.ok) {
      uploadState.value = "done";
      msg.value = `数据集 ID: ${reg.data?.dataset?.id || "-"}（默认未上架，请前往“我的数据”进行上架）`;
      pendingResume.value = null;
      clearSensitiveCredentials();
      credentialJson.value = "";
      file.value = null;
    } else {
      uploadState.value = "failed";
      err.value = `${reg.error?.response?.data?.message || "元数据登记失败"}。${reg.rollback ? "已尝试回滚删除 S3 对象。" : `回滚删除失败，请保存 s3Key 以便补录：${objectKey}`}`;
      showError.value = true;
    }
  } catch (e) {
    uploadState.value = "failed";
    const categorized = await classifyError(e);
    err.value = categorized.code === "credentials_expired" ? "凭证仍然无效或已过期，请重新输入后再试。" : mapUploadErrorFromCode(categorized.code);
    showError.value = true;
  } finally {
    uploading.value = false;
  }
}

function cleanupSensitiveRuntime() {
  s3ModuleRef?.abortActiveUpload();
  clearSensitiveCredentials();
  credentialJson.value = "";
}

watch([region, bucket, endpoint], () => persistPublicS3Prefs());
watch(showError, (v) => { if (!v) err.value = ""; });
onBeforeRouteLeave(() => cleanupSensitiveRuntime());
onBeforeUnmount(() => cleanupSensitiveRuntime());
loadPublicS3Prefs();
</script>
