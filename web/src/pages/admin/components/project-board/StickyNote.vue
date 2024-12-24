<script setup lang="ts"> 
import type { IStickyNote } from '../../actions/project-board/stickyNoteType';

defineProps<{ stickyNotes: IStickyNote[]; }>();
const emit = defineEmits<{
  (e: "deleteStickyNote", stickyNote: IStickyNote): void;
}>();
</script>
<template>
  <div
    v-for="stickyNote of stickyNotes" :key="stickyNote.id"

    :class="`flex flex-col min-h-40 shadow-md p-4 m-4 rounded-md cursor-pointer sticky-note-${stickyNote.id} ${stickyNote.color}`"
  >
    <div class="card-header flex justify-between">
      <div @click="emit('deleteStickyNote', stickyNote)" class="hover:bg-slate-100 px-1 py-1 rounded-md">
        <TrashIcon />
      </div>
      <div :class="'hover:bg-slate-100 px-1 py-1 rounded-md sticky-note-handler-'+stickyNote.id">
        <ArrowTopIcon />
      </div>
    </div>
    <div class="card-body w-full h-full p-2" contenteditable="true">
      content here...
    </div>
    <div class="flex justify-end">
      <div :class="'cursor-nw-resize sticky-note-resizer-'+stickyNote.id">
        <ArrowDownIcon />
      </div>
    </div>
  </div>
</template>
