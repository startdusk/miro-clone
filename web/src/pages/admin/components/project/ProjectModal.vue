<script setup lang="ts">
import { useVuelidate } from '@vuelidate/core';
import BaseModal from '../../../../components/base/BaseModal.vue';
import Error from '../../../../components/base/Error.vue';
import { projectStore } from '../../../../store/projectStore';
import BaseInput from '../../../../components/base/BaseInput.vue';
import { useCreateProject, useUpdateProject } from '../../../../service/project';
import { required } from "@vuelidate/validators";
import { ref } from 'vue';

defineProps<{
    showModal: boolean;
    title: string;
}>();
const emit = defineEmits<{
    (e: "closeModal"): void;
    (e: "getProjects"): Promise<void>;

}>();
const rules = {
    name: { required }, // Matches state.firstName
};
let loading = ref(false);

const { createProject, loading: createProjectLoading } = useCreateProject()
const { updateProject, loading: updateProjectLoading } = useUpdateProject()

const v$ = useVuelidate(rules, projectStore.input);
const validate = async () => {
  const result = await v$.value.$validate();
  if (!result) {
    return false;
  }
  // http request
  if (projectStore.editing) {
    loading = updateProjectLoading;
    await updateProject(projectStore.input.id!, projectStore.input.name)
  } else {
    loading = createProjectLoading;
    await createProject(projectStore.input.name)
  }
  await emit('getProjects')

  v$.value.$reset();
  closeModal();
};

const closeModal = () => {
  emit("closeModal");
  projectStore.input.name = '';
  v$.value.$reset();
}
</script>

<template>
  <div>
    <BaseModal :show="showModal">
      <template #title>
        <h2 class="text-lg font-semibold">{{ title }}</h2>
      </template>
      <template #body>
        <div class="flex flex-col">
          <Error label="Project Name" :errors="v$.name.$errors">
            <BaseInput v-model="projectStore.input.name" />
          </Error>
        </div>
      </template>

      <template #footer>
        <button @click="closeModal" class="border-2 border-gray-300 hover:bg-gray-300 text-sm text-gray-700 px-4 py-2 rounded">
          Close
        </button>
        <button 
          :disabled="loading"
          @click="validate"
          class="bg-indigo-500 text-white px-4 py-2 rounded"
        >
          <span v-if="loading">
            Saving...
          </span>
          <span v-else>
            {{ projectStore.editing ? 'Save' : 'Create' }}
          </span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
