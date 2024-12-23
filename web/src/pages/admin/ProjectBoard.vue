<script setup lang="ts">
import StickyNoteIcon from '../../components/StickyNoteIcon.vue';
import DocumentIcon from '../../components/DocumentIcon.vue';
import UndoIcon from '../../components/UndoIcon.vue';
import RedoIcon from '../../components/RedoIcon.vue';
import PersonPlusIcon from '../../components/PersonPlusIcon.vue';

import avatarImg from '../../assets/img/avatar.webp'

import logoImg from '../../assets/img/logo.png'

</script>
<template>
  <div class="bg-slate-100">
    <div class="flex">
      <div class="bg-slate-200 h-screen w-[50px]">
        <!-- <div class="flex justify-center py-4">
          <img :src="logoImg" width="150" alt="logo" />
        </div> -->
        <ul class="flex flex-col px-2 bg-white mt-20 mb-2 gap-2 p-2 rounded-md shadow-md">
          <li class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer">
            <span class="icon pt-1">
              <StickyNoteIcon />
            </span>
          </li>
          <li class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer">
            <span class="icon pt-1">
              <DocumentIcon />
            </span>
          </li>
        </ul>

        <ul class="flex flex-col px-2 bg-white mb-2 gap-2 p-2 rounded-md shadow-md">
          <li class="flex flex-row rounded-md h-8 bg-yellow-300 gap-2 cursor-pointer">
          </li>
          <li class="flex flex-row rounded-md h-8 bg-indigo-300 gap-2 cursor-pointer">
          </li>
          <li class="flex flex-row rounded-md h-8 bg-blue-300 gap-2 cursor-pointer">
          </li>
          <li class="flex flex-row rounded-md h-8 bg-pink-300 gap-2 cursor-pointer">
          </li>
        </ul>

        <ul class="flex flex-col px-2 bg-white mb-2 gap-2 p-2 rounded-md shadow-md">
          <li class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer">
            <span class="icon pt-1">
              <RedoIcon />
            </span>
          </li>
          <li class="flex flex-row rounded-md hover:bg-slate-100 px-2 py-2 cursor-pointer">
            <span class="icon pt-1">
              <UndoIcon />
            </span>
          </li>
        </ul>

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

          <div class="flex justify-center bg-white items-center min-h-60 shadow-md p-4 rounded-md cursor-pointer hover:bg-slate-100">
            <div class="px-6 text-indigo-700">
              <div class="flex justify-center">
                <PlusIcon />
              </div>
              <div class="flex justify-center">
                <p>New Board</p>
              </div>
            </div>
          </div>

      </div>
    </div>
  </div>
</template>
