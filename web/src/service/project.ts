import { ref } from "vue";
import { makeHttpReq } from "../hepler/http";
import { showError } from "../hepler/toastNotification";
import type { IProject, IProjectDetail } from "../types";

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
      console.error(error)
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
      const resp = await makeHttpReq<{}, IGetProjects>(
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

export function useGetProjectDetail() {
  const loading = ref(false)
  const getProjectDetail = async (projectCode: string) => {
    loading.value = true
    try {
      const resp = await makeHttpReq<{}, IProjectDetail>(
        `projects/detail?project_code=${projectCode}`,
        'GET',
      )
      return resp
    } catch (error) {
      console.error(error)
      showError('get project detail failed')
    } finally {
      loading.value = false
    }
  }

  return {
      loading,
      getProjectDetail,
  }
}