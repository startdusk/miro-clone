<script setup lang="ts">
import AddItem from './components/project-board/AddItem.vue';
import ColorPalette from './components/project-board/ColorPalette.vue';
import UndoRedo from './components/project-board/UndoRedo.vue';
import avatarImg from '../../assets/img/avatar.webp'

import logoImg from '../../assets/img/logo.png'

import { useDragStickyNote } from './actions/project-board/stickyNote';
import StickyNote from './components/project-board/StickyNote.vue';

const { createStickyNote, deleteStickyNote, stickyNotes } = useDragStickyNote();

</script>
<template>
  <div class="bg-slate-100">
    <div class="flex">
      <div class="bg-slate-200 h-screen w-[50px]">
        <!-- <div class="flex justify-center py-4">
          <img :src="logoImg" width="150" alt="logo" />
        </div> -->
        <AddItem @createStickyNote="createStickyNote" />
        <ColorPalette />
        <UndoRedo />
      </div>

      <div class="bg-slate-200 w-screen">
        <div class="flex justify-between p-2 mt-1">
          <div class="flex items-center gap-2 bg-white p-2 px-3 py-2 rounded-md shadow-md">
            <img :src="logoImg" width="50" alt="logo" />
            <span class="text-slate-300">|</span> Build Smart AI</div>
          <div class="flex gap-2 bg-white p-2 px-2 py-2 rounded-md shadow-md">
            <img :src="avatarImg" width="30" class="rounded-full border-2 border-white cursor-pointer hover:border-blue-500" alt="" />
            <button class="flex items-center gap-2 bg-blue-500 py-1 px-2 rounded-md text-white">
              <PersonPlusIcon />
              <span class="text-sm">Share</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <StickyNote :stickyNotes="stickyNotes" @deleteStickyNote="deleteStickyNote" />
        </div>
      </div>
    </div>
  </div>
</template>
