import { ref } from "vue";
import { makeHttpReq } from "../hepler/http";
import { showError } from "../hepler/toastNotification";
import type { IProject } from "../types";

export interface ICreateOrUpdateProject {
  id: number | null
  name: string
  userId: number | null
}

export interface IProjectResponse extends IProject {}

export function useCreateProject() {
  const loading = ref(false) 

  const createProject = async (projectName: string) => {
    loading.value = true
    try {
      const resp = await makeHttpReq<{name: string}, IProjectResponse>(
        'projects',
        'PUT',
        {
          name: projectName
        }
      )
      return resp
    } catch (error) {
      console.log(error)
      showError('create project failed')
    } finally {
      loading.value = false
    }
  }


  return {
      loading,
      createProject,
  }
}

export function useUpdateProject() {
  const loading = ref(false) 

  const updateProject = async (projectId: number, projectName: string) => {
    loading.value = true
    try {
      const resp = await makeHttpReq<{name: string}, IProjectResponse>(
        `projects/${projectId}`,
        'POST',
        {
          name: projectName
        }
      )

      return resp
    } catch (error) {
      showError('update project failed')
    } finally {
      loading.value = false
    }
  }


  return {
      loading,
      updateProject,
  }
}

export interface IGetProjects {
  projects: IProject[]
}

export function useGetProjects() {
  const loading = ref(false)
  const getProjects = async () => {
    loading.value = true
    try {
      const resp = await makeHttpReq<null, IGetProjects>(
        `projects`,
        'GET',
      )
      return resp
    } catch (error) {
      showError('get projects failed')
    } finally {
      loading.value = false
    }
  }

  return {
      loading,
      getProjects,
  }
}