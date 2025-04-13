<script setup lang="ts">
import { useYjsDocStore } from '../../../../store/yjsDoc';

import { 
  toolbarClassName,
  createApplyAlignLeftClassName,
  createApplyAlignCenterClassName,
  createApplyAlignRightClassName,
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
  createMiniTextEditorResizerClassName } from '../../../../actions/project-board/editor/miniTextEditorType';

import BlinkingCursor from './BlinkingCursor.vue';
import type { IMiniTextEditor } from '../../../../types';

const yjsDocStore = useYjsDocStore();


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
    <div :class="`bg-white flex gap-3 p-2 ${toolbarClassName()}`">
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyBoldClassName(miniTextEditor.id)}`"
      >
        <BoldIcon
          :data-name="`${createApplyBoldClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyItalicClassName(miniTextEditor.id)}`"
      >
        <ItalicIcon 
          :data-name="`${createApplyItalicClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyUnderlineClassName(miniTextEditor.id)}`"
      >
        <UnderlineIcon 
          :data-name="`${createApplyUnderlineClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyH1ClassName(miniTextEditor.id)}`"
      >
        <H1Icon 
          :data-name="`${createApplyH1ClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyH2ClassName(miniTextEditor.id)}`"
      >
        <H2Icon 
          :data-name="`${createApplyH2ClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyH3ClassName(miniTextEditor.id)}`"
      >
        <H3Icon 
          :data-name="`${createApplyH3ClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyAlignLeftClassName(miniTextEditor.id)}`"
      >
        <AlignLeftIcon 
          :data-name="`${createApplyAlignLeftClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyAlignCenterClassName(miniTextEditor.id)}`"
      >
        <AlignCenterIcon 
          :data-name="`${createApplyAlignCenterClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyAlignRightClassName(miniTextEditor.id)}`"
      >
        <AlignRightIcon 
          :data-name="`${createApplyAlignRightClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyListClassName(miniTextEditor.id)}`"
      >
        <ListIcon 
          :data-name="`${createApplyListClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="createApplyLinkClassName(miniTextEditor.id)"
      >
        <LinkIcon 
          :data-name="createApplyLinkClassName(miniTextEditor.id)"
        />
      </button>
      <button class="hover:bg-slate-100 py-1 px-1 rounded-md"
        :data-name="`${createApplyImageClassName(miniTextEditor.id)}`"
      >
        <ImageIcon 
          :data-name="`${createApplyImageClassName(miniTextEditor.id)}`"
        />
      </button>
      <button class="hover:bg-yellow-200 bg-yellow-300 w-6 h-4 text-xs py-1 px-1 pt-4 rounded-md"
        :data-name="`${createApplyHighlightTextClassName(miniTextEditor.id)}`"
      >
      </button>
    </div>
    <BlinkingCursor 
        :miniTextEditorId="miniTextEditor.id" 
        :x="yjsDocStore.cursor.x"
        :y="yjsDocStore.cursor.y"
        />
    <div 
      v-html="miniTextEditor.body"
      :class="`card-body w-full h-full p-2 bg-white ${createMiniTextEditorBodyClassName(miniTextEditor.id)}`" contenteditable="true"
      >
    </div>
    <div class="flex justify-end">
      <div :class="`cursor-nw-resize ${createMiniTextEditorResizerClassName(miniTextEditor.id)}`"
      >
        <ArrowDownIcon />
      </div>
    </div>
  </div>
</template>
