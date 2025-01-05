import { defineStore } from "pinia";
import * as Y from 'yjs';
import type { IMiniTextEditor } from "../actions/project-board/editor/miniTextEditorType";
import type { IStickyNote } from "../actions/project-board/sticky-note/stickyNoteType";
import { type ICursor, type IReplayDrawing } from "../types";
import type { ITextCaption } from "../actions/project-board/text-caption/textCaptionTypes";

const useYjsDocStore = defineStore('yjsDoc', {
  state: () => ({
    loading: false,
    doc: new Y.Doc(),

    // sticky note
    stickyNotes: [] as IStickyNote[],
    yArrayStickyNote: new Y.Array<IStickyNote>(),
    stickyNoteBodyTextCursorPosition: 0,
    
    // mini text editor
    miniTextEditors: [] as IMiniTextEditor[],
    yArrayMiniTextEditor: new Y.Array<IMiniTextEditor>(),
    miniTextEditorBodyTextCursorPosition: 0,

    // text caption
    textCaptions: [] as ITextCaption[],
    yArrayTextCaption: new Y.Array<ITextCaption>(),
    textCaptionBodyTextCursorPostion: 0,
    
    mousePosition: {
      username:'benjamin',
      x: 0,
      y: 0,
    },
    yMapMouse: new Y.Map<number>(),
    yMapCursor: new Y.Map<string>(),
    cursor: {
      typingUser: 'benjamin',
      cursorPosition: 0,
      x: "",
      y: "",
    },

    yArrayDrawing: new Y.Array<Array<IReplayDrawing>>(),
    arrayDrawing: [] as Array<Array<IReplayDrawing>>,
    //we use it as history
    redoDrawingArray: [] as Array<Array<IReplayDrawing>>,
  }),
  actions: {
    init() {
      this.yArrayStickyNote = this.doc.getArray('y-array-sticky-note') as Y.Array<IStickyNote>
      this.yArrayMiniTextEditor = this.doc.getArray('y-array-mini-text-editor') as Y.Array<IMiniTextEditor>
      this.yArrayTextCaption = this.doc.getArray('y-array-text-caption') as Y.Array<ITextCaption>
      this.yArrayDrawing = this.doc.getArray('y-array-drawing') as Y.Array<Array<IReplayDrawing>>
      this.yMapCursor = this.doc.getMap('y-map-cursor') as Y.Map<string>
      this.yMapMouse = this.doc.getMap('y-map-mouse') as Y.Map<number>
    },
    setStickyNotes(notes: IStickyNote[]) {
      this.stickyNotes = notes
    },
    setMiniTextEditors(editors: IMiniTextEditor[]) {
      this.miniTextEditors = editors
    },
    setMiniTextEditorBodyTestCursorPosition(position: number) {
      this.miniTextEditorBodyTextCursorPosition = position
    },
    setStickyNoteBodyTestCursorPosition(position: number) {
      this.stickyNoteBodyTextCursorPosition = position
    },
    setTextCaptionBodyTestCursorPosition(position: number) {
      this.textCaptionBodyTextCursorPostion = position
    },
    setCursorInfo(cursor: ICursor) {
      const { cursorPosition, x, y } = cursor
      yjsDocStore.cursor.cursorPosition = cursorPosition;
      yjsDocStore.cursor.x = x;
      yjsDocStore.cursor.y = y;
      yjsDocStore.yMapCursor.set("x", x);
      yjsDocStore.yMapCursor.set("y", y);
      yjsDocStore.yMapCursor.set("typingUser", yjsDocStore.cursor.typingUser);
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
    },
    observeYArrayTextCaption(fn: (id: number) => void) {
      this.yArrayTextCaption.observe((_event: any) => {
        const array = this.yArrayTextCaption.toArray() || []
        this.textCaptions = array
        array.forEach(({id}) => {
          fn(id)
        })
      })
    },
    observeTypesForMouse() {
      this.yMapMouse.observe((_event: any) => {
        yjsDocStore.mousePosition.x = yjsDocStore.yMapMouse.get('x') as number
        yjsDocStore.mousePosition.y = yjsDocStore.yMapMouse.get('y') as number
      })
    },
    observeTypesForCursor() {
      this.yMapCursor.observe((_event: any) => {
        yjsDocStore.cursor.x = yjsDocStore.yMapCursor.get('x') as string
        yjsDocStore.cursor.y = yjsDocStore.yMapCursor.get('y') as string
      })
    },

    observeTypesDrawing(replayDrawing: () => void) {
      this.yArrayDrawing.observe((_event: any) => {
        this.arrayDrawing = this.yArrayDrawing.toArray()
        replayDrawing()
      })
    }
  }
})

const yjsDocStore = useYjsDocStore()
yjsDocStore.init()
export { yjsDocStore }
