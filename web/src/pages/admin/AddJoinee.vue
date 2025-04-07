<script setup lang="ts">
import { onMounted } from 'vue';
import LoadingIndicator from '../../components/base/LoadingIndicator.vue';
import { useRoute } from "vue-router";
import { useAddJoinee } from '../../service/joinee';
import { hasLogined } from '../../hepler/auth';

const route = useRoute();

const projectCode = route.query.project_code?.toString(); 
const { loading, addJoinee } = useAddJoinee();

onMounted(async () => {
  if (!projectCode) {
    return;
  }

  if (!hasLogined()) {
      window.location.href = `/login?redirect_url=/add-joinees?project_code=${projectCode}`;
  }
  await addJoinee(projectCode)
})


</script>
<template>
  <div align="center">
    <LoadingIndicator :loading="loading" />
  </div>
</template>