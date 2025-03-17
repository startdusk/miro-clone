import { defineStore } from "pinia";
import { ref } from "vue";

export interface ICreateOrUpdateProject {
  id: number | null
  name: string
  userId: number | null
}

const useProjectStore = defineStore('projectStore', () => {
  const input = ref<ICreateOrUpdateProject>({ id: null, name: '', userId: null })
  const editing = ref(false)
  return {
    input,
    editing,
  }
})

export const projectStore = useProjectStore()