<script lang="ts" setup>
import { onMounted } from 'vue';
import { useAuthStore } from './store/authStore';
import { useYjsDocStore } from './store/yjsDoc'
import type { ICurrentProjectUsersEvent, IJoinProjectBoardEvent, ILeavingProjectBoardEvent, IUser } from './types';

const yjsDocStore = useYjsDocStore();
const authStore = useAuthStore();

onMounted(() => {
  authStore.connectSse(
    {
      joinFn: (data: IJoinProjectBoardEvent) => {
        console.log('joinFn', data);
      },
      leavingFn: (data: ILeavingProjectBoardEvent) => {
        console.log('leavingFn', data);
      },
      currentProjectRoomUsersFn: (data: ICurrentProjectUsersEvent) => {
        console.log('currentProjectRoomUsersFn', data);
      },
      whoIsTypingFn: (data: IUser) => {
        console.log('whoIsTypingFn', data);
        yjsDocStore.cursor.typingUser = data.username;
      }
    }
  );
})
</script>
<template>
  <RouterView />
</template>
