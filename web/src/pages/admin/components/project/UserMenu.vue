<script lang="ts" setup>
import type { User } from '../../../../hepler/auth';


interface Props {
  showMenu: boolean;
  user: User | null;
}

defineProps<Props>();

const emits = defineEmits<{
  (e: 'logout'): Promise<void>;
}>();

</script>
<template>
  <ul
    v-if="showMenu"
    class="bg-white
      rounded-md
      shadow-lg
      w-[250px]
      py-2
      px-4
      divide-y
      divide-gray-200
      absolute
      right-4
      mt-6
  ">
    <li class="py-2 px-4 hover:cursor-pointer">{{ user?.username }}
      <br>
      <a href="http://" class="text-blue-500">
        {{ user?.email }}
      </a>
    </li>
    <li @click="emits('logout')" class="flex py-2 px-4 hover:bg-gray-50 rounded-md text-red-500 hover:cursor-pointer">
      <span class="icon pt-1">
        <LogoutIcon />
      </span>
      <span>Logout</span>
    </li>
  </ul>
</template>