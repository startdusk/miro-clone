<script setup lang="ts"> 

import { createStickyNoteBodyClassName, createStickyNoteClassName, createStickyNoteHandlerClassName, createStickyNoteResizerClassName, type IStickyNote } from '../../../../actions/project-board/sticky-note/stickyNoteType';

defineProps<{ stickyNotes: IStickyNote[]; }>();
const emit = defineEmits<{
  (e: "deleteStickyNote", stickyNote: IStickyNote): void;
}>();
</script>
<template>
  <div
    v-for="stickyNote of stickyNotes" :key="stickyNote.id"
    :style="{
      top: stickyNote.dragPosition.x + 'px',
      left: stickyNote.dragPosition.y + 'px',
      width: stickyNote.resizePosition.x + 'px',
      height: stickyNote.resizePosition.y + 'px'
    }"
    :class="`flex flex-col min-h-40 shadow-md p-4 m-4 rounded-md cursor-pointer ${createStickyNoteClassName(stickyNote.id)} ${stickyNote.color}`"
  >

  <!-- 不一定需要，有同步问题 -->
    <!-- <BlinkingCursor 
        :miniTextEditorId="stickyNote.id" 
        :x="yjsDocStore.cursor.x"
        :y="yjsDocStore.cursor.y"
        /> -->
    <div class="card-header flex justify-between">
      <div @click="emit('deleteStickyNote', stickyNote)" class="hover:bg-slate-100 px-1 py-1 rounded-md">
        <TrashIcon />
      </div>
      <div :class="`hover:bg-slate-100 px-1 py-1 rounded-md ${createStickyNoteHandlerClassName(stickyNote.id)}`">
        <ArrowTopIcon />
      </div>
    </div>

    <div :class="`card-body w-full h-full p-2 ${createStickyNoteBodyClassName(stickyNote.id)}`" contenteditable="true">
      {{ stickyNote.body }}
    </div>
    <div class="flex justify-end">
      <div :class="`cursor-nw-resize ${createStickyNoteResizerClassName(stickyNote.id)}`">
        <ArrowDownIcon />
      </div>
    </div>
  </div>
</template>
