import { ref } from "vue";
import { makeHttpReq } from "../hepler/http";
import { showError, successMsg } from "../hepler/toastNotification";
import type { IProjectBoardData } from "../types";

export function useGetProjectBoardData(
) {
  const loading = ref(false)
  const projectBoardData = ref<IProjectBoardData | null>(null)
  const getProjectBoardData = async (
    projectId: number,
  ) => {
    loading.value = true
    try {
      const res = await makeHttpReq<{}, IProjectBoardData>(
        `projects/${projectId}/project_board`,
        'GET'
      ) 
      projectBoardData.value = res
    } catch (error) {
      console.error(error)
      showError('get project board data failed')
    }
  }
  return {
    loading,
    projectBoardData,
    getProjectBoardData,
  }
}

export function useSaveProjectBoardData(
) {
  const loading = ref(false) 

  const saveProjectBoardData = async (
  projectId: number,
  projectBoardData: IProjectBoardData,
) => {
    loading.value = true
    try {
      await makeHttpReq<IProjectBoardData, null>(
        `projects/${projectId}/project_board`,
        'POST',
        projectBoardData
      )
      successMsg('save project board data successfully')
    } catch (error) {
      console.error(error)
      showError('create or update project board data failed')
    } finally {
      loading.value = false
    }
  }


  return {
      loading,
      saveProjectBoardData,
  }
}