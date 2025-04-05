import { ref } from "vue";
import { makeHttpReq } from "../hepler/http";
import { showError } from "../hepler/toastNotification";
import type { IProjectBoardData } from "../types";



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