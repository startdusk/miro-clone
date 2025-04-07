<script setup lang="ts">
import QueueListIcon from "../../../../components/icons/QueueListIcon.vue";
import avatarImg from "../../../../assets/img/avatar.webp";
import logoImg from "../../../../assets/img/logo.png";
import { showError, successMsg } from "../../../../hepler/toastNotification";

const props = defineProps<{
  projectName: string | undefined;
  projectCode: string
}>();

const copyProjectLink = () => {
  const projectLink = `${window.location.host}/add-joinees?project_code=${props.projectCode}`
  navigator.clipboard
    .writeText(projectLink)
    .then(() => {
      successMsg("Project link copy");
    })
    .catch(() => showError("error copying project link"));
}

</script>

<template>
  <div class="flex justify-between p-2 mt-1">
    <div class="flex items-center gap-2 bg-white p-2 px-3 py-2 rounded-md shadow-md">
      <img :src="logoImg" width="50" alt="logo" />
      <span class="text-slate-300">|</span> {{ props.projectName }}
      <span class="text-slate-300">|</span>
      <RouterLink to="/projects"
        class="flex flex-row items-center border-0 text-medium gap-1 hover:bg-slate-100 px-1 py-1 rounded-md">
        <QueueListIcon />
        <span>Projects</span>
      </RouterLink>
    </div>
    <div class="flex gap-2 bg-white p-2 px-2 py-2 rounded-md shadow-md">
      <img :src="avatarImg" width="30" class="rounded-full border-2 border-white cursor-pointer hover:border-blue-500"
        alt="" />
      <button class="flex items-center gap-2 bg-blue-500 py-1 px-2 rounded-md text-white" @click="copyProjectLink">
        <PersonPlusIcon />
        <span class="text-sm">Share</span>
      </button>
    </div>
  </div>
</template>