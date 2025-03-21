<script setup lang="ts">
import type { IProject } from '../../../../types';

defineProps<{
  projects: IProject[];
}>();

const emits = defineEmits<{
  (e: 'deleteProject', project: IProject): Promise<void>;
  (e: 'updateProject', project: IProject): Promise<void>;
}>();
</script>

<template>
  <div v-for="project in projects" :key="project.id" 
    class="flex justify-between bg-white items-center min-h-60 shadow-md p-4 rounded-md cursor-pointer">
    <div class="px-6">
      <div class="flex justify-center">
        <button @click="emits('updateProject', project)" class="hover:bg-slate-100 py-2 px-2 rounded-md hover:shadow-md">
          <EditorIcon />
        </button>
      </div>
      <div class="flex justify-center">
        <p>{{ project.name }}</p>
      </div>

      <!-- to project page -->
      <div class="flex text-gray-500 ml-[130px] mt-[60px] absolute  text-sm hover:text-indigo-500 font-semibold">
        <router-link :to="`/project-boards?project_code=${project.projectCode}`">
          Details
        </router-link>
      </div>
    </div>
  </div>
</template>