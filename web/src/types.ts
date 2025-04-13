import router from './router'

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

export interface IUser {
  id: number,
  username: string,
  email: string,
  githubId: string | null,
  createdAt: string,
  updatedAt: string,
}
  
export type EventType = 'CurrentProjectUsersEvent' | 'JoinProjectBoardEvent' | 'LeavingProjectBoardEvent' | 'UserTyipingEvent'
export interface ICurrentProjectUsersEvent extends BaseEvent {
  users: IUser[]
}

export interface IJoinProjectBoardEvent extends BaseEvent {
  user: IUser
}

export interface ILeavingProjectBoardEvent extends BaseEvent {
  user: IUser
}
export interface IUserTyipingEvent extends BaseEvent {
  typingUserId: number,
}

export interface BaseEvent {
  event: EventType,
  roomId: string,
}

export type routerPath = '/' | '/login'  | '/projects' | '/project-boards' | '/auth' | '/add-joinees'


export function redirectTo(path: routerPath, query?: {[key: string]: string}) {
  if (query) {
    router.push({ path, query })
    return
  }
  router.push(path)
}