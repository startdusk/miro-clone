<script setup lang="ts">

import { onMounted, ref } from 'vue';
import avatarImg from '../../assets/img/avatar.webp'
import logoImg from '../../assets/img/logo.png'
import { getUserData } from '../../hepler/auth';

import UserMenu from './components/project/UserMenu.vue';
import ProjectModal from './components/project/ProjectModal.vue';
import ProjectList from './components/project/ProjectList.vue';
import { loggout } from '../../service/auth';
import { useGetProjects } from '../../service/project';
import type { IProject } from '../../types';
import { projectStore } from '../../store/projectStore';
import { TailwindPagination } from "laravel-vue-pagination";


const user = getUserData();

const showMenu = ref(false);

const showUserMenu = () => {
  showMenu.value = !showMenu.value;
}

const handleClickLogout = async () => {
  console.log('logout');
  loggout();
}

const showModal = ref(false);
type ModalType = 'New Project' | 'Edit Project';
const title = ref<ModalType>('New Project');



const showProjectModal = () => {
  if (projectStore.editing) {
    title.value = 'Edit Project'
  } else {
    title.value = 'New Project'
  }
  showModal.value = true;
} 

const handleNewProject = () => {
  projectStore.editing = false;
  showProjectModal();
}

const closeModal = () => {
    showModal.value = false;
}

const myProjects = ref<IProject[]>([]);

const {loading: getProjectsLoading, getProjects} = useGetProjects();

const paginationProject = ref<{data: IProject[]}>({data: []})

async function getMyProjects() {
  const resp = await getProjects()
  paginationProject.value = {data:  resp?.projects || []}
  myProjects.value = resp?.projects || [];
}

const updateProject = (project: IProject) => {
  projectStore.editing = true
  projectStore.input.id = project.id
  projectStore.input.name = project.name
  projectStore.input.userId = project.userId
  showProjectModal()
}

onMounted(async () => {
  await getMyProjects();
})

</script>
<template>
  <div class="bg-slate-100">
    <ProjectModal
      @closeModal="closeModal"
      @get-projects="getMyProjects"
      :showModal="showModal"
      :title="title"
    />

    <div class="flex">
      <div class="bg-white h-screen w-[250px]">
        <div class="flex justify-center py-4">
          <img :src="logoImg" width="150" alt="logo" />
          <UserMenu
            @logout="handleClickLogout"
            :showMenu="showMenu"
            :user="user" />
        </div>
        <ul class="flex flex-col px-2 gap-2">
          <li class="flex flex-row px-2 py-2 hover:bg-slate-200 rounded-md gap-2 cursor-pointer">
            <span class="icon pt-1">
              <QueueListIcon />
            </span>
            <span>Projects</span>
          </li>

          <li 
            @click="handleClickLogout"
            class="flex flex-row px-2 py-2 hover:bg-slate-200 rounded-md gap-2 cursor-pointer">
            <span class="icon pt-1">
              <LogoutIcon />
            </span>
            <span>Logout</span>
          </li>

        </ul>
      </div>

      <div class="bg-slate-200 w-screen">
        <div @click="showUserMenu" class="flex justify-end px-4 py-2">
          <img :src="avatarImg" width="30" class="rounded-full border-2 border-white cursor-pointer hover:border-blue-500" alt="" />
        </div>
        <div class="flex px-4">
          <h1 class="text-2xl">Projects</h1>
        </div>
        <!-- list of created project board -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div
              @click="handleNewProject"
              class="flex justify-center bg-white items-center min-h-60 shadow-md p-4 rounded-md cursor-pointer hover:bg-slate-100"
            >
                <div class="px-6 text-indigo-700">
                    <div class="flex justify-center">
                        <PlusIcon />
                    </div>
                    <div class="flex justify-center d">
                        <span>New Project</span>
                    </div>
                </div>
            </div>

              <ProjectList
                  :projects="myProjects"
                  @update-project="updateProject"
              />
        </div>
        <div>
          <TailwindPagination
            class="_pagination px-4"
            :data="paginationProject"
            @pagination-change-page="getProjects"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* If you pagination doesnt looks good use this */
button.relative.inline-flex.items-center.px-4.py-2.text-sm.font-medium.border.focus\:z-20.bg-blue-50.border-blue-500.text-blue-600.z-30 {
    background: #4f46e5;
    color: white;
    /* border-radius: 5px; */
}
</style>
