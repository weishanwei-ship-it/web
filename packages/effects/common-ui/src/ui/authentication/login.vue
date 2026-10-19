<script setup lang="ts">
import type { Recordable } from '@vben/types';
import type { VbenFormSchema } from '@vben-core/form-ui';
import type { AuthenticationProps } from './types';

import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { $t } from '@vben/locales';
import { useVbenForm } from '@vben-core/form-ui';
import { VbenButton, VbenCheckbox } from '@vben-core/shadcn-ui';

import Title from './auth-title.vue';
import ThirdPartyLogin from './third-party-login.vue';

interface Props extends AuthenticationProps {
  formSchema?: VbenFormSchema[];
  // 卡片路由列表，父组件可传入
  cardList?: Array<{
    id: number;
    title: string;
    desc: string;
    icon: string;
    path: string;
  }>;
}

defineOptions({
  name: 'AuthenticationLogin',
});

const props = withDefaults(defineProps<Props>(), {
  codeLoginPath: '/auth/code-login',
  forgetPasswordPath: '/auth/forget-password',
  formSchema: () => [],
  loading: false,
  qrCodeLoginPath: '/auth/qrcode-login',
  registerPath: '/auth/register',
  showCodeLogin: false,
  showForgetPassword: false,
  showQrcodeLogin: false,
  showRegister: false,
  showRememberMe: true,
  showThirdPartyLogin: false,
  submitButtonText: '',
  subTitle: '',
  title: '',
  // 默认卡片数据
  cardList: () => [
    {
      id: 1,
      title: '计算平台',
      desc: '计算平台',
      icon: '📊',
      path: '/dashboard',
    },
    {
      id: 2,
      title: '业务中心',
      desc: '流程管理',
      icon: '📋',
      path: '/business',
    },
    {
      id: 3,
      title: '消息中心',
      desc: '通知待办',
      icon: '💬',
      path: '/message',
    },
    { id: 4, title: '系统设置', desc: '权限配置', icon: '⚙️', path: '/system' },
  ],
});

const emit = defineEmits<{
  submit: [Recordable<any>];
}>();

const [Form, formApi] = useVbenForm(
  reactive({
    commonConfig: {
      hideLabel: true,
      hideRequiredMark: true,
    },
    schema: computed(() => props.formSchema),
    showDefaultActions: false,
  }),
);
const router = useRouter();

// ========= 新增状态 =========
// 控制 表单 / 卡片 切换
const isLoginSuccess = ref(false);

const REMEMBER_ME_KEY = `REMEMBER_ME_USERNAME_${location.hostname}`;
const localUsername = localStorage.getItem(REMEMBER_ME_KEY) || '';
const rememberMe = ref(!!localUsername);

// 表单提交：校验 + 缓存用户名 + 通知父组件，切换到卡片
async function handleSubmit() {
  const { valid } = await formApi.validate();
  const values = await formApi.getValues();

  if (valid) {
    localStorage.setItem(
      REMEMBER_ME_KEY,
      rememberMe.value ? values?.username : '',
    );
    // 触发父组件登录逻辑（authLogin）
    emit('submit', values);
    // 切换为卡片页面
    isLoginSuccess.value = true;
  }
}

// 通用路由跳转（原有功能）
function handleGo(path: string) {
  router.push(path);
}

// 点击卡片跳转主页
function handleCardClick() {
  const path = '/analytics';
  window.location.href = path;
}

// 返回登录表单
function backToForm() {
  isLoginSuccess.value = false;
}

onMounted(() => {
  if (localUsername) {
    formApi.setFieldValue('username', localUsername);
  }
});

defineExpose({
  getFormApi: () => formApi,
});
</script>

<template>
  <!-- 整体容器 -->
  <div @keydown.enter.prevent="handleSubmit">
    <!-- 1. 未登录成功：展示原有登录表单区域 -->
    <div v-if="!isLoginSuccess">
      <slot name="title">
        <Title>
          <slot name="title">
            {{ title || `${$t('authentication.welcomeBack')} 👋🏻` }}
          </slot>
          <template #desc>
            <span class="text-muted-foreground">
              <slot name="subTitle">
                {{ subTitle || $t('authentication.loginSubtitle') }}
              </slot>
            </span>
          </template>
        </Title>
      </slot>

      <Form />

      <div
        v-if="showRememberMe || showForgetPassword"
        class="mb-6 flex justify-between"
      >
        <div class="flex-center">
          <VbenCheckbox
            v-if="showRememberMe"
            v-model="rememberMe"
            name="rememberMe"
          >
            {{ $t('authentication.rememberMe') }}
          </VbenCheckbox>
        </div>

        <span
          v-if="showForgetPassword"
          class="vben-link text-sm font-normal"
          @click="handleGo(forgetPasswordPath)"
        >
          {{ $t('authentication.forgetPassword') }}
        </span>
      </div>

      <VbenButton
        :class="{ 'cursor-wait': loading }"
        :loading="loading"
        aria-label="login"
        class="w-full"
        @click="handleSubmit"
      >
        {{ submitButtonText || $t('common.login') }}
      </VbenButton>

      <div
        v-if="showCodeLogin || showQrcodeLogin"
        class="mt-4 mb-2 flex items-center justify-between"
      >
        <VbenButton
          v-if="showCodeLogin"
          class="w-1/2"
          variant="outline"
          @click="handleGo(codeLoginPath)"
        >
          {{ $t('authentication.mobileLogin') }}
        </VbenButton>
        <VbenButton
          v-if="showQrcodeLogin"
          class="ml-4 w-1/2"
          variant="outline"
          @click="handleGo(qrCodeLoginPath)"
        >
          {{ $t('authentication.qrcodeLogin') }}
        </VbenButton>
      </div>

      <slot name="third-party-login">
        <ThirdPartyLogin v-if="showThirdPartyLogin" />
      </slot>

      <slot name="to-register">
        <div v-if="showRegister" class="mt-3 text-center text-sm">
          {{ $t('authentication.accountTip') }}
          <span
            class="vben-link text-sm font-normal"
            @click="handleGo(registerPath)"
          >
            {{ $t('authentication.createAccount') }}
          </span>
        </div>
      </slot>
    </div>

    <!-- 2. 登录成功：展示卡片选择页 -->
    <div v-else class="card-wrap">
      <div class="card-header text-center mb-6">
        <h2 class="text-xl font-bold">🎉 登录成功</h2>
        <p class="text-muted-foreground mt-2">请选择进入对应功能模块</p>
        <VbenButton
          class="mt-4"
          variant="outline"
          size="sm"
          @click="backToForm"
        >
          返回登录
        </VbenButton>
      </div>

      <div class="card-grid">
        <div
          v-for="item in cardList"
          :key="item.id"
          class="card-item"
          @click="handleCardClick()"
        >
          <div class="card-icon">{{ item.icon }}</div>
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 卡片区域样式 */
.card-wrap {
  width: 100%;
  padding: 10px;
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.card-item {
  padding: 20px 12px;
  text-align: center;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.card-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  transform: translateY(-2px);
}

.card-icon {
  margin-bottom: 12px;
  font-size: 32px;
}

.card-title {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}
</style>
