<script setup lang="ts">
import penImg from "../../../../assets/img/pen.png"
import textImg from "../../../../assets/img/text.png"
const emit = defineEmits<{
  (e: "createStickyNote"): void;
  (e: "createMiniTextEditor"): void;
  (e: "createTextCaption"): void;
  (e: "initDrawing"): void;
}>();

</script>
<template>
  <ul
    class="flex flex-col px-2 bg-white mt-20 mb-2 gap-2 p-2 rounded-md shadow-md"
  >
    <!-- 文字 -->
    <li
      @click="emit('createTextCaption')"
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
    >
      <span class="icon pt-1">
        <img :src="textImg" alt="" />
      </span>
    </li>
    
    <!-- 笔 -->
    <li
      @click="emit('initDrawing')"
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
    >
      <span class="icon pt-1">
        <img :src="penImg" alt="" />
      </span>
    </li>

    <!-- 便签 -->
    <li
      @click="emit('createStickyNote')"
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
    >
      <span class="icon pt-1">
        <StickyNoteIcon />
      </span>
    </li>

    <!-- 富文本框 -->
    <li
      @click="emit('createMiniTextEditor')"
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
    >
      <span class="icon pt-1">
        <DocumentIcon />
      </span>
    </li>
  </ul>
</template>
