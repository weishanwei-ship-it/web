<script setup lang="ts">
import { computed } from 'vue';

/**
 * 下标/上标文本渲染组件
 * 约定：变量下标用方括号标记 [x]，上标用花括号标记 {x}，例如
 *   F[mf]、D[mn]、p[m]、b[mf]、μ[c]、d[f]{2}、q[mf]=(3.5+p[m])/(b[m]/10){1/2}
 * 组件会把 [...] 渲染成 <sub>、{...} 渲染成 <sup>；其余文本（含 Unicode 原生下标 ₘ₁₂₃ 等）原样输出。
 * 计算引擎求值用的是【计算值】列（X001Nxxx 编码），不读这两列，
 * 后端 NormalizeSymbols 也会剥掉方括号还原成平铺变量名（Fmf/Dmn/pm），所以不影响计算。
 */
const props = defineProps<{
  text?: null | number | string;
}>();

type Kind = 'normal' | 'sub' | 'sup';

interface Seg {
  text: string;
  kind: Kind;
}

const segments = computed<Seg[]>(() => {
  const raw = props.text == null ? '' : String(props.text);
  if (raw === '') return [];
  const result: Seg[] = [];
  // 同时匹配 [下标] 与 {上标}
  const re = /\[([^\]]*)\]|\{([^}]*)\}/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) {
      result.push({ text: raw.slice(last, m.index), kind: 'normal' });
    }
    if (m[1] !== undefined) {
      result.push({ text: m[1], kind: 'sub' });
    } else {
      result.push({ text: m[2] ?? '', kind: 'sup' });
    }
    last = re.lastIndex;
  }
  if (last < raw.length) {
    result.push({ text: raw.slice(last), kind: 'normal' });
  }
  return result;
});

const isEmpty = computed(() => segments.value.length === 0);
</script>

<template>
  <span v-if="isEmpty">-</span>
  <span v-else class="subscript-text">
    <template v-for="(seg, i) in segments" :key="i">
      <sub v-if="seg.kind === 'sub'">{{ seg.text }}</sub>
      <sup v-else-if="seg.kind === 'sup'">{{ seg.text }}</sup>
      <template v-else>{{ seg.text }}</template>
    </template>
  </span>
</template>

<style scoped>
.subscript-text {
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.subscript-text :deep(sub),
.subscript-text :deep(sup) {
  font-size: 0.75em;
  line-height: 0;
}
</style>
