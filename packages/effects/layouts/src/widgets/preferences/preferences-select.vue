<script lang="ts" setup>
import { Menu } from '@vben/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  VbenButton,
} from '@vben-core/shadcn-ui';

import Preferences from './preferences.vue';

const emit = defineEmits<{ clearPreferencesAndLogout: [] }>();

function clearPreferencesAndLogout() {
  emit('clearPreferencesAndLogout');
}
</script>

<template>
  <DropdownMenu>
    <!-- 直接用图标作为下拉触发器，移除 VbenIconButton -->
    <DropdownMenuTrigger as-child>
      <Menu class="size-4 text-foreground cursor-pointer hover:opacity-80" />
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-56 p-2">
      <VbenButton class="hover:animate-[shrink_0.3s_ease-in-out] mr-5 ml-1">
        计算平台
      </VbenButton>
      <VbenButton class="hover:animate-[shrink_0.3s_ease-in-out] mr-1">
        系统配置
      </VbenButton>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
