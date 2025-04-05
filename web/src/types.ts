export const drawingLineWith = 2

export interface ICursor {
  cursorPosition: number,
  x: string,
  y: string
}

export interface IReplayDrawing {
  x: number;
  y: number;
  type: "start" | "drawing";
  strokeStyle: string;
}

export interface IProject {
  id: number,
  name: string,
  userId: number,
  projectCode: string,
  projectLink: string,
}

export interface IProjectDetail {
  id: number;
  name: string;
  image: string;
  projectCode: string;
  userId: number;
}

export interface IStickyNote {
  id: number,
  body: string,
  color: string,
  dragPosition: {
    x: number,
    y: number
  }
  resizePosition: {
    x: number,
    y: number,
  }
}

export interface IMiniTextEditor {
  id: number,
  body: string,
  color: string,
  dragPosition: {
    x: number,
    y: number
  }
  resizePosition: {
    x: number,
    y: number,
  }
}

export interface ITextCaption {
  id: number;
  body: string;
  color: string;
  dragPosition: {
    x: number;
    y: number;
  };
  resizePosition: {
    x: number;
    y: number;
  };
}

export interface IProjectBoardData {
    miniTextEditor: IMiniTextEditor[] | null;
    stickyNote: IStickyNote[] | null;
    textCaption: ITextCaption[] | null;
    drawing: IReplayDrawing[][] | null;
}