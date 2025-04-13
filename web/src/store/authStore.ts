import { defineStore } from "pinia";
import type {
  ICurrentProjectUsersEvent,
  IJoinProjectBoardEvent,
  ILeavingProjectBoardEvent,
  IUser,
  IUserTyipingEvent,
} from "../types";
import { getUserToken } from "../hepler/auth";
import camelcaseKeys from "camelcase-keys";

export interface IAuthStore {
  sse: EventSource | null;
  connectFns: IConnectSseOpt;
  rooms: IRoom[];
}

export interface IConnectSseOpt {
  joinFn: (event: IJoinProjectBoardEvent) => void;
  leavingFn: (event: ILeavingProjectBoardEvent) => void;
  currentProjectRoomUsersFn: (event: ICurrentProjectUsersEvent) => void;
  whoIsTypingFn: (event: IUser) => void;
}

export interface IRoom {
  roomId: string;
  users: IUser[];
}

const useAuthStore = defineStore("authStore", {
  state: (): IAuthStore => ({
    sse: null as EventSource | null,
    connectFns: {
      joinFn: (_event: IJoinProjectBoardEvent) => {},
      leavingFn: (_event: ILeavingProjectBoardEvent) => {},
      currentProjectRoomUsersFn: (_event: ICurrentProjectUsersEvent) => {},
      whoIsTypingFn: (_event: IUser) => {},
    },
    rooms: [] as IRoom[],
  }),
  actions: {
    joinRoom(projectCode: string, user: IUser) {
      const room = this.rooms.find((room) => room.roomId === makeRoomId(projectCode))
      if (!room) {
        this.rooms.push({
          roomId: projectCode,
          users: [user],
        })
      } else {
        room.users.push(user);
      }
    },
    connectSse(opt: IConnectSseOpt) {
      this.connectFns = opt;

      if (this.sse && this.sse.readyState !== EventSource.OPEN) {
        this.sse.close();
        this.sse = null;
      }
      const accessToken = getUserToken() as string;
      const url = `${import.meta.env.VITE_SSE_URL}?access_token=${accessToken}`;
      this.sse = new EventSource(url);
      this.sse.addEventListener("JoinProjectBoardEvent", (event) => {
        const data = camelcaseKeys(JSON.parse(event.data), {
          deep: true,
        }) as IJoinProjectBoardEvent;
        const room = this.rooms.find((room) => room.roomId === data.roomId)
        if (room) {
          room.users.push(data.user);
        } else {
          this.rooms.push({
            roomId: data.roomId,
            users: [data.user],
          })
        }
        this.connectFns.joinFn(data);
      });
      this.sse.addEventListener("LeaveProjectBoardEvent", (event) => {
        const data = camelcaseKeys(JSON.parse(event.data), {
          deep: true,
        }) as ILeavingProjectBoardEvent;
        const room = this.rooms.find((room) => room.roomId === data.roomId)
        if (room) {
          room.users = room.users.filter((user) => user.id !== data.user.id);
        }
        this.connectFns.leavingFn(data);
      });
      this.sse.addEventListener("CurrentProjectRoomUsersEvent", (event) => {
        const data = camelcaseKeys(JSON.parse(event.data), {
          deep: true,
        }) as ICurrentProjectUsersEvent;
        const room = this.rooms.find((room) => room.roomId === data.roomId)
        if (room) {
          room.users = data.users;
        } else {
          this.rooms.push({
            roomId: data.roomId,
            users: data.users,
          })
        }
        this.connectFns.currentProjectRoomUsersFn(data);
      });
      this.sse.addEventListener("UserTyipingEvent", (event) => {
        const data = camelcaseKeys(JSON.parse(event.data), {
          deep: true,
        }) as IUserTyipingEvent;
        const room = this.rooms.find((room) => room.roomId === data.roomId)
        if (room) {
          const user = room.users.find((user) => user.id === data.typingUserId)
          if (user) {
            this.connectFns.whoIsTypingFn(user);
          }
        }
      });

      this.sse.onerror = (error) => {
        console.error(error);
        this.sse?.close();
        this.sse = null;
      };
    },
    disconnectSse() {
      this.sse?.close();
    },
  },
});

function makeRoomId(projectCode: string) {
  return `project.room.${projectCode}`
}

export { useAuthStore };
