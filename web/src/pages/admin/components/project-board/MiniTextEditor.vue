<script setup lang="ts">

import { 
  createApplyAlignClassName,
  createApplyBoldClassName,
  createApplyH1ClassName,
  createApplyH2ClassName,
  createApplyH3ClassName,
  createApplyHighlightTextClassName,
  createApplyImageClassName,
  createApplyItalicClassName,
  createApplyLinkClassName,
  createApplyListClassName,
  createApplyUnderlineClassName,
  createMiniTextEditorBodyClassName,
  createMiniTextEditorClassName, 
  createMiniTextEditorHandlerClassName,
  createMiniTextEditorResizerClassName, type IMiniTextEditor } from '../../actions/project-board/miniTextEditorType';


defineProps<{ miniTextEditors: IMiniTextEditor[]; }>();
const emit = defineEmits<{
  (e: "deleteMiniTextEditor", miniTextEditor: IMiniTextEditor): void;
}>();
</script>
<template>
  <div
    v-for="miniTextEditor of miniTextEditors" :key="miniTextEditor.id"
    :style="{
      top: miniTextEditor.dragPosition.x + 'px',
      left: miniTextEditor.dragPosition.y + 'px',
      width: miniTextEditor.resizePosition.x + 'px',
      height: miniTextEditor.resizePosition.y + 'px'
    }"
    :class="`flex flex-col min-h-40 min-w-[490px] shadow-md p-4 m-4 rounded-md cursor-pointer ${createMiniTextEditorClassName(miniTextEditor.id)}`"
  >
    <div class="card-header flex justify-between">
      <div class="hover:bg-slate-100 px-1 py-1 rounded-md" @click="emit('deleteMiniTextEditor', miniTextEditor)">
        <TrashIcon />
      </div>
      <div :class="`hover:bg-slate-100 px-1 py-1 rounded-md ${createMiniTextEditorHandlerClassName(miniTextEditor.id)}`">
        <ArrowTopIcon />
      </div>
    </div>
    <div class="bg-white flex gap-3 p-2">
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyBoldClassName(miniTextEditor.id)}`">
        <BoldIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyItalicClassName(miniTextEditor.id)}`">
        <ItalicIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyUnderlineClassName(miniTextEditor.id)}`">
        <UnderlineIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyH1ClassName(miniTextEditor.id)}`">
        <H1Icon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyH2ClassName(miniTextEditor.id)}`">
        <H2Icon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyH3ClassName(miniTextEditor.id)}`">
        <H3Icon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAlignClassName(miniTextEditor.id, 'left')}`">
        <AlignLeftIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAlignClassName(miniTextEditor.id, 'center')}`">
        <AlignCenterIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAlignClassName(miniTextEditor.id, 'right')}`">
        <AlignRightIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyListClassName(miniTextEditor.id)}`">
        <ListIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyLinkClassName(miniTextEditor.id)}`">
        <LinkIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyImageClassName(miniTextEditor.id)}`">
        <ImageIcon />
      </button>
      <button :class="`hover:bg-yellow-200 bg-yellow-300 w-6 h-4 text-xs py-1 px-1 pt-4 rounded-md ${createApplyHighlightTextClassName(miniTextEditor.id)}`">
      </button>
    </div>
    <div 
      v-html="miniTextEditor.body"
      :class="`card-body w-full h-full p-2 bg-white ${createMiniTextEditorBodyClassName(miniTextEditor.id)}`" contenteditable="true">
    </div>
    <div class="flex justify-end">
      <div :class="`cursor-nw-resize ${createMiniTextEditorResizerClassName(miniTextEditor.id)}`">
        <ArrowDownIcon />
      </div>
    </div>
  </div>
</template>
