import { defineStore } from "pinia";
import * as Y from 'yjs';
import type { IMiniTextEditor } from "../pages/admin/actions/project-board/miniTextEditorType";
import type { IStickyNote } from "../pages/admin/actions/project-board/stickyNoteType";

const useYjsDocStore = defineStore('yjsDoc', {
  state: () => ({
    doc: new Y.Doc(),
    stickyNotes: [] as IStickyNote[],
    yArrayStickyNote: new Y.Array<IStickyNote>(),
    miniTextEditors: [] as IMiniTextEditor[],
    yArrayMiniTextEditor: new Y.Array<IMiniTextEditor>()
  }),

  actions: {
    init() {
      this.yArrayStickyNote = this.doc.getArray('y-array-sticky-note') as Y.Array<IStickyNote>
      this.yArrayMiniTextEditor = this.doc.getArray('y-array-mini-text-editor') as Y.Array<IMiniTextEditor>
    },
    setStickyNotes(notes: IStickyNote[]) {
      this.stickyNotes = notes
    },
    setMiniTextEditors(editors: IMiniTextEditor[]) {
      this.miniTextEditors = editors
    },
    observeYArrayStickyNote(fn: (id: number) => void) {
      this.yArrayStickyNote.observe((_event: any) => {
        const array = this.yArrayStickyNote.toArray() || []
        this.stickyNotes = array
        array.forEach(({id}) => {
          fn(id)
        })
      })
    },
    observeYArrayMiniTextEditor(fn: (id: number) => void) {
      this.yArrayMiniTextEditor.observe((_event: any) => {
        const array = this.yArrayMiniTextEditor.toArray() || []
        this.miniTextEditors = array
        array.forEach(({id}) => {
          fn(id)
        })
      })
    }
  }
})

const yjsDocStore = useYjsDocStore()
yjsDocStore.init()
export { yjsDocStore }
