<script setup lang="ts">
const emit = defineEmits<{
  (e: "redo"): void;
  (e: "undo"): void;
  (e: "resetCanvas"): void;
}>();
</script>
<template>
  <ul class="flex flex-col px-2 bg-white mb-2 gap-2 p-2 rounded-md shadow-md">
    <li
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
      @click="emit('redo')"
    >
      <span class="icon pt-1">
        <RedoIcon />
      </span>
    </li>
    <li
      class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer"
      @click="emit('undo')"
    >
      <span class="icon pt-1">
        <UndoIcon />
      </span>
    </li>
    <li
      @click="emit('resetCanvas')"
      class="flex flex-row rounded-md cursor-pointer hover:bg-slate-100 px-2 py-1"
    >
      <span class="icon pt-1">
        <ResetCanvasIcon />
      </span>
    </li>
  </ul>
</template>
