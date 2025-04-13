import { defineStore } from "pinia";
import * as Y from 'yjs';
import { type ICursor, type IMiniTextEditor, type IReplayDrawing, type IStickyNote, type ITextCaption, type IUser } from "../types";

export const useYjsDocStore = defineStore('yjsDoc', {
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

    joinees: [] as Array<IUser>
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
    joinUser(user: IUser) {
      if (!this.joinees.find((u) => {
        u.id === user.id
      })) {
        this.joinees.push(user)
      }
    },
    leaveUser(userId: number) {
      this.joinees = this.joinees.filter((user) => {
        user.id !== userId
      })
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
      this.cursor.cursorPosition = cursorPosition;
      this.cursor.x = x;
      this.cursor.y = y;
      this.yMapCursor.set("x", x);
      this.yMapCursor.set("y", y);
      this.yMapCursor.set("typingUser", this.cursor.typingUser);
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
        this.mousePosition.x = this.yMapMouse.get('x') as number
        this.mousePosition.y = this.yMapMouse.get('y') as number
      })
    },
    observeTypesForCursor() {
      this.yMapCursor.observe((_event: any) => {
        this.cursor.x = this.yMapCursor.get('x') as string
        this.cursor.y = this.yMapCursor.get('y') as string
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

