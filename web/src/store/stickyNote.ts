import { defineStore } from "pinia";

const useStickyNoteStore = defineStore('stickyNote', {
  state: () => ({
    stickyNote: {} as { id: number }
  })
})

export const stickyNoteStore = useStickyNoteStore()