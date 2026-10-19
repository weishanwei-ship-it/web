<script lang="ts" setup>
import type { NotificationItem } from '@vben/layouts';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { AuthenticationLoginExpiredModal } from '@vben/common-ui';
import { VBEN_DOC_URL, VBEN_GITHUB_URL } from '@vben/constants';
import { useWatermark } from '@vben/hooks';
import { BookOpenText, CircleHelp, SvgGithubIcon } from '@vben/icons';
import {
  BasicLayout,
  LockScreen,
  Notification,
  UserDropdown,
} from '@vben/layouts';
import { preferences } from '@vben/preferences';
import { useAccessStore, useUserStore } from '@vben/stores';
import { openWindow } from '@vben/utils';
import { $t } from '#/locales';
import { useAuthStore } from '#/store';
import LoginForm from '#/views/_core/authentication/login.vue';
import { ReceiveMessage, OneMessage, AllMessage } from '#/api';

// 消息结构（和后端一致）
interface T_MessageQueueModel {
  msgId: string;
  title: string;
  message: string;
  sendName?: string;
  creatTime: string;
  status: number; // 0未读 1已读
}

interface CustomNotificationItem extends NotificationItem {
  originalData?: T_MessageQueueModel;
}

// 通知列表
const notifications = ref<CustomNotificationItem[]>([]);
const userStore = useUserStore();
const currentUser = computed(() => userStore.userInfo);

// ===================== 消息拉取（HTTP 接口版） =====================
const pollingTimer = ref<any>(null);
const POLL_INTERVAL = 50000000; // 5秒拉一次

// 拉取未读消息
async function fetchUnreadMessages() {
  try {
    // 后端接口：获取未读消息
    // const res = await ReceiveMessage(currentUser.value?.username || '')
    // const list = res;
    // const newItems = list.map((msg: T_MessageQueueModel) => ({
    //   id: msg.msgId,
    //   avatar: `https://avatar.vercel.sh/${msg.sendName?.substring(0, 1) || 'M'}`,
    //   date: formatDate(msg.creatTime),
    //   isRead: msg.status === 1,
    //   title: msg.title || '新消息',
    //   message: msg.message,
    //   sendName: msg.sendName,
    //   originalData: msg,
    // }));
    //notifications.value = newItems;
  } catch (err) {
    console.warn('拉取消息失败', err);
  }
}

// 标记单条已读
async function markRead(id: string | number) {
  try {
    console.log('单条已读');
    await OneMessage(id.toString());
    const item = notifications.value.find((x) => x.id === id);
    if (item) item.isRead = true;
  } catch (err) {
    console.warn('标记已读失败', err);
  }
}

// 全部已读
async function handleMakeAll() {
  try {
    console.log('全部已读');
    const unreadMsgIds = notifications.value
      .filter((item) => !item.isRead)
      .map((item) => item.id.toString());
    await AllMessage(unreadMsgIds);
    notifications.value.forEach((item) => (item.isRead = true));
  } catch (err) {
    console.warn('全部已读失败', err);
  }
}

// 清空
function handleNoticeClear() {
  notifications.value = [];
}

// 删除
function remove(id: string | number) {
  notifications.value = notifications.value.filter((x) => x.id !== id);
}

// 查看所有
function handleViewAll() {
  console.log('查看所有');
}

// 轮询启动/停止
function startPolling() {
  stopPolling();
  fetchUnreadMessages();
  pollingTimer.value = setInterval(fetchUnreadMessages, POLL_INTERVAL);
}
function stopPolling() {
  if (pollingTimer.value) clearInterval(pollingTimer.value);
}

// 时间格式化
function formatDate(dateStr: string): string {
  if (!dateStr) return '刚刚';
  const d = new Date(dateStr);
  const now = Date.now();
  const sec = (now - d.getTime()) / 1000;
  if (sec < 60) return '刚刚';
  if (sec < 3600) return `${Math.floor(sec / 60)}分钟前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}小时前`;
  return d.toLocaleDateString();
}

// ===================== 原有逻辑不动 =====================
const router = useRouter();
const authStore = useAuthStore();
const accessStore = useAccessStore();
const { destroyWatermark, updateWatermark } = useWatermark();

const showDot = computed(() =>
  notifications.value.some((item) => !item.isRead),
);

const menus = computed(() => [
  {
    handler: () => router.push({ name: 'Profile' }),
    icon: 'lucide:user',
    text: $t('page.auth.profile'),
  },
  {
    handler: () => openWindow(VBEN_DOC_URL),
    icon: BookOpenText,
    text: $t('ui.widgets.document'),
  },
  {
    handler: () => openWindow(VBEN_GITHUB_URL),
    icon: SvgGithubIcon,
    text: 'GitHub',
  },
  {
    handler: () => openWindow(`${VBEN_GITHUB_URL}/issues`),
    icon: CircleHelp,
    text: $t('ui.widgets.qa'),
  },
]);

const avatar = computed(
  () => userStore.userInfo?.avatar ?? preferences.app.defaultAvatar,
);

async function handleLogout() {
  stopPolling();
  await authStore.logout(false);
}

onMounted(() => {
  watch(
    () => currentUser.value?.username,
    (val) => (val ? startPolling() : stopPolling()),
    { immediate: true },
  );
});

onUnmounted(() => stopPolling());

watch(
  () => ({
    enable: preferences.app.watermark,
    content: preferences.app.watermarkContent,
  }),
  async ({ enable, content }) => {
    if (enable) {
      await updateWatermark({
        content:
          content ||
          `${userStore.userInfo?.username} - ${userStore.userInfo?.realName}`,
      });
    } else {
      destroyWatermark();
    }
  },
  { immediate: true },
);
</script>

<template>
  <BasicLayout @clear-preferences-and-logout="handleLogout">
    <template #user-dropdown>
      <UserDropdown
        :avatar="avatar"
        :menus="menus"
        :text="userStore.userInfo?.realName"
        description="ann.vben@gmail.com"
        tag-text="Pro"
        @logout="handleLogout"
      />
    </template>

    <template #notification>
      <Notification
        :dot="showDot"
        :notifications="notifications"
        @clear="handleNoticeClear"
        @read="(item) => item.id && markRead(item.id)"
        @remove="(item) => item.id && remove(item.id)"
        @make-all="handleMakeAll"
        @view-all="handleViewAll"
      >
      </Notification>
    </template>

    <template #extra>
      <AuthenticationLoginExpiredModal
        v-model:open="accessStore.loginExpired"
        :avatar="avatar"
      >
        <LoginForm />
      </AuthenticationLoginExpiredModal>
    </template>

    <template #lock-screen>
      <LockScreen :avatar="avatar" @to-login="handleLogout" />
    </template>
  </BasicLayout>
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.space-y-1 > * + * {
  margin-top: 0.25rem;
}

.justify-between {
  justify-content: space-between;
}

.items-center {
  align-items: center;
}

.font-medium {
  font-weight: 500;
}

.text-xs {
  font-size: 0.75rem;
}

.text-sm {
  font-size: 0.875rem;
}

.text-gray-400 {
  color: var(--vben-text-color-3);
}

.text-gray-500 {
  color: var(--vben-text-color-2);
}

.text-gray-600 {
  color: var(--vben-text-color-1);
}

.text-gray-800 {
  color: var(--vben-text-color-base);
}

.line-clamp-2 {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.self-end {
  align-self: flex-end;
}
</style>
