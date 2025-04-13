import { ref } from "vue";
import { makeHttpReq } from "../hepler/http";
import { showError } from "../hepler/toastNotification";
import { redirectTo } from "../types";


export function useAddJoinee() {
  const loading = ref(true) 

  const addJoinee = async (projectCode: string) => {
    try {
      await makeHttpReq<{}, null>(
        `projects/joinees?project_code=${projectCode}`,
        'POST',
      )
      // http://127.0.0.1:8000/share/add_joinees?project_code=BJDfgJLrje-1730775993
      // http://127.0.0.1:8000/project-boards?project_code=BJDfgJLrje-1730775993
      redirectTo(`/project-boards`, {project_code: projectCode})
    } catch (error) {
      console.error(error)
      showError('joinee failed')
    } finally {
      loading.value = false
    }
  }


  return {
      loading,
      addJoinee,
  }
}