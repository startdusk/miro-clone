<script setup lang="ts">
import { stickyNoteStore } from '../../../../store/stickyNote';
import type { IStickyNote } from '../../../../types';


const props = defineProps<{ stickyNotes: IStickyNote[]; }>();

const emit = defineEmits<{
  (e: "changeStickyNoteColor", stickyNoteId: number, bgColor: string): void;
}>();
const changeStickyNoteBgColor = (color: 'bg-yellow-300' | 'bg-indigo-300' | 'bg-blue-300' | 'bg-pink-300') => {
  const id = stickyNoteStore.stickyNote.id
  emit('changeStickyNoteColor', id, color);
  const stickyNote = document.querySelector(`.sticky-note-${id}`) as HTMLElement;
  const selectStickyNote = props.stickyNotes.find(stickyNote => stickyNote.id === id);
  if (selectStickyNote) {
    stickyNote.classList.remove(selectStickyNote.color);
    stickyNote.classList.add(color);
  }
};

</script>
<template>
  <ul class="flex flex-col px-2 bg-white mb-2 gap-2 p-2 rounded-md shadow-md">
    <li @click="changeStickyNoteBgColor('bg-yellow-300')" class="flex flex-row rounded-md h-8 bg-yellow-300 gap-2 cursor-pointer">
    </li>
    <li @click="changeStickyNoteBgColor('bg-indigo-300')" class="flex flex-row rounded-md h-8 bg-indigo-300 gap-2 cursor-pointer">
    </li>
    <li @click="changeStickyNoteBgColor('bg-blue-300')" class="flex flex-row rounded-md h-8 bg-blue-300 gap-2 cursor-pointer">
    </li>
    <li @click="changeStickyNoteBgColor('bg-pink-300')" class="flex flex-row rounded-md h-8 bg-pink-300 gap-2 cursor-pointer">
    </li>
  </ul>
</template>