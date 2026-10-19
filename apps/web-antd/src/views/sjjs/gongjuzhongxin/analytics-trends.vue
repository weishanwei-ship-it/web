<script lang="ts" setup>
import type { EchartsUIType } from '@vben/plugins/echarts';

import { onMounted, ref } from 'vue';

import { EchartsUI, useEcharts } from '@vben/plugins/echarts';

const chartRef = ref<EchartsUIType>();
const { renderEcharts } = useEcharts(chartRef);

onMounted(() => {
  renderEcharts({
    grid: {
      bottom: 0,
      containLabel: true,
      left: '1%',
      right: '1%',
      top: '2 %',
    },
    series: [
      {
        barMaxWidth: 80,
        // color: '#4f69fd',
        data: [
          1111, 2222, 3333, 4444, 5555, 6666, 7777, 8888, 9999, 5100, 6000,
          3200, 4800,
        ],
        type: 'bar',
      },
    ],
    tooltip: {
      axisPointer: {
        lineStyle: {
          // color: '#4f69fd',
          width: 1,
        },
      },
      trigger: 'axis',
    },
    xAxis: {
      data: Array.from({ length: 12 }).map((_item, index) => `${index + 1}月`),
      type: 'category',
    },
    yAxis: {
      max: 10000,
      splitNumber: 5,
      type: 'value',
    },
  });
});
</script>

<template>
  <EchartsUI ref="chartRef" />
</template>
