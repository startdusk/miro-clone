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

const user = getUserData();

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
}

const handleClickLogout = async () => {
  console.log('logout');
  loggout();
}


function showUserMenu() {
    showMenu.value = !showMenu.value;
}

const showModal = ref(false);

function showProjectModal() {
  console.log('showProjectModal');
    showModal.value = true;
}

function closeModal() {
    showModal.value = false;
}

const myProjects = ref<IProject[]>([]);

const {loading: getProjectsLoading, getProjects} = useGetProjects();

async function getMyProjects() {
  const resp = await getProjects()
  myProjects.value = resp?.projects || [];
}

async function updateProject() {
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
        <div @click="toggleMenu" class="flex justify-end px-4 py-2">
          <img :src="avatarImg" width="30" class="rounded-full border-2 border-white cursor-pointer hover:border-blue-500" alt="" />
        </div>
        <div class="flex px-4">
          <h1 class="text-2xl">Projects</h1>
        </div>
        <!-- list of created project board -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div
              @click="showProjectModal"
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
      </div>
    </div>
  </div>
</template>
