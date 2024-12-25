<script setup lang="ts">

import { 
  createApplyAliginClassName,
  createApplyBoldClassName,
  createApplyH1ClassName,
  createApplyH2ClassName,
  createApplyH3ClassName,
  createApplyImageClassName,
  createApplyItalicClassName,
  createApplyLinkClassName,
  createApplyListClassName,
  createApplyUnderlineClassName,
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
    :class="`flex flex-col min-h-40 min-w-[400px] w-[400px] shadow-md p-4 m-4 rounded-md cursor-pointer ${createMiniTextEditorClassName(miniTextEditor.id)}`"
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
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAliginClassName(miniTextEditor.id, 'left')}`">
        <AlignLeftIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAliginClassName(miniTextEditor.id, 'center')}`">
        <AlignCenterIcon />
      </button>
      <button :class="`hover:bg-slate-100 py-1 px-1 rounded-md ${createApplyAliginClassName(miniTextEditor.id, 'right')}`">
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
    </div>
    <div class="card-body w-full h-full p-2 bg-white" contenteditable="true">
      content here...
    </div>
    <div class="flex justify-end">
      <div :class="`cursor-nw-resize ${createMiniTextEditorResizerClassName(miniTextEditor.id)}`">
        <ArrowDownIcon />
      </div>
    </div>
  </div>
</template>
