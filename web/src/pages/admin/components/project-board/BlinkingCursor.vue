<script lang="ts" setup>
import { useYjsDocStore } from '../../../../store/yjsDoc';
import { createBlinkingCursorClassName } from '../../../../actions/project-board/blinking-cursor/blinkingCursorType';

const yjsDocStore = useYjsDocStore();

const props = defineProps<{
  miniTextEditorId: number;
  x: string
  y: string
}>();

</script>
<template>
  <div :style="{
    left: props.x,
    top: props.y,
  }" :class="`blinking-cursor ${createBlinkingCursorClassName(miniTextEditorId)}`">
    {{ yjsDocStore.cursor.typingUser }}
  </div>
</template>
<style scoped>
.blinking-cursor {
  position: absolute;
  color: #2497c4;
  pointer-events: none;
  background-color: #2497c4;
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 12px;
  color: #ffffff;
  border: 1px solid #ccc;
  display: none
}
</style>