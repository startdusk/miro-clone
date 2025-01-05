<script setup lang="ts">
import { onMounted } from "vue";

import UndoRedo from "./components/project-board/UndoRedo.vue";
import AddItem from "./components/project-board/AddItem.vue";
import ColorPalette from "./components/project-board/ColorPalette.vue";
import avatarImg from "../../assets/img/avatar.webp";
import UserCursor from "./components/project-board/UserCursor.vue";
import logoImg from "../../assets/img/logo.png";

import StickyNote from "./components/project-board/StickyNote.vue";
import MiniTextEditor from "./components/project-board/MiniTextEditor.vue";
import LoadingIndicator from "../../components/base/LoadingIndicator.vue";
import TextCaption from "./components/project-board/TextCaption.vue";

import { useDragStickyNote } from "../../actions/project-board/sticky-note/stickyNote";
import { useDragTextCaption } from "../../actions/project-board/text-caption/textCaption";

import { useDragMiniTextEditor } from "../../actions/project-board/editor/miniTextEditor";
import { type IStickyNote } from "../../actions/project-board/sticky-note/stickyNoteType";
import { yjsDocStore } from "../../store/yjsDoc";
import { useShareUserCursor } from "../../actions/project-board/cursor/userMouse";
import { useCanvas } from "../../actions/project-board/canvas/canvas";
import { initYjs } from "../../yjs/yjs";

const { initCanvas } = useCanvas();

const { trackMousePosition } = useShareUserCursor({
  user: { name: "benjamin" },
});

const { createStickyNote, deleteStickyNote } = useDragStickyNote();

const { createMiniTextEditor, deleteMiniTextEditor } = useDragMiniTextEditor();

const { createTextCaption, deleteTextCaption } = useDragTextCaption();

const changeStickyNoteBgColor = (stickyNoteId: number, bgColor: string) => {
  for (let i = 0; i < yjsDocStore.stickyNotes.length; i++) {
    if (yjsDocStore.stickyNotes[i].id === stickyNoteId) {
      yjsDocStore.stickyNotes[i].color = bgColor;
    }
  }
};

const changeMiniTextEditorBgColor = (
  miniTextEditorId: number,
  bgColor: string
) => {
  for (let i = 0; i < yjsDocStore.miniTextEditors.length; i++) {
    if (yjsDocStore.miniTextEditors[i].id === miniTextEditorId) {
      yjsDocStore.miniTextEditors[i].color = bgColor;
    }
  }
};

onMounted(() => {
  initYjs();
});
</script>
<template>
  <div class="bg-slate-100" @mousemove="trackMousePosition">
    <LoadingIndicator :loading="yjsDocStore.loading" />
    <div class="flex">
      <div class="bg-slate-200 h-screen w-[50px]">
        <AddItem
          @createStickyNote="createStickyNote"
          @createMiniTextEditor="createMiniTextEditor"
          @createTextCaption="createTextCaption"
          @initDrawing="async () => (await initCanvas()).drawOnCanvas()"
        />
        <ColorPalette
          :stickyNotes="yjsDocStore.stickyNotes"
          @changeStickyNoteColor="changeStickyNoteBgColor"
          @changeMiniTextEditorBgColor="changeMiniTextEditorBgColor"
        />
        <UndoRedo
          @redo="async () => (await initCanvas()).redo()"
          @undo="async () => (await initCanvas()).undo()"
          @reset-canvas="async () => (await initCanvas()).initCanvas()"
        />
      </div>

      <div class="bg-slate-200 w-screen">
        <div class="flex justify-between p-2 mt-1">
          <div
            class="flex items-center gap-2 bg-white p-2 px-3 py-2 rounded-md shadow-md"
          >
            <img :src="logoImg" width="50" alt="logo" />
            <span class="text-slate-300">|</span> Build Smart AI
          </div>
          <div class="flex gap-2 bg-white p-2 px-2 py-2 rounded-md shadow-md">
            <img
              :src="avatarImg"
              width="30"
              class="rounded-full border-2 border-white cursor-pointer hover:border-blue-500"
              alt=""
            />
            <button
              class="flex items-center gap-2 bg-blue-500 py-1 px-2 rounded-md text-white"
            >
              <PersonPlusIcon />
              <span class="text-sm">Share</span>
            </button>
          </div>
        </div>

        <canvas
          class="w-full h-screen"
          style="background-color: #f4f4f9; z-index: -1000"
        >
        </canvas>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <TextCaption 
            :textCaptions="yjsDocStore.textCaptions"
            @deleteTextCaption="deleteTextCaption"
          />
          <StickyNote
            :stickyNotes="yjsDocStore.stickyNotes"
            @deleteStickyNote="deleteStickyNote"
          />
          <MiniTextEditor
            :miniTextEditors="yjsDocStore.miniTextEditors"
            @deleteMiniTextEditor="deleteMiniTextEditor"
          />
          <UserCursor
            :username="yjsDocStore.mousePosition.username"
            :mouse-position="yjsDocStore.mousePosition"
          />
        </div>
      </div>
    </div>
  </div>
</template>
