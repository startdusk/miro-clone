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
