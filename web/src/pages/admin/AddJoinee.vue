<script setup lang="ts">
import { onMounted } from 'vue';
import LoadingIndicator from '../../components/base/LoadingIndicator.vue';
import { useRoute } from "vue-router";
import { useAddJoinee } from '../../service/joinee';
import { hasLogined } from '../../hepler/auth';
import { redirectTo } from '../../types';

const route = useRoute();

const projectCode = route.query.project_code?.toString(); 
const { loading, addJoinee } = useAddJoinee();

onMounted(async () => {
  if (!projectCode) {
    return;
  }
  if (!hasLogined()) {
      const redirectUrl = encodeURIComponent(`/add-joinees?project_code=${projectCode}`)
      // 重定向到 /login 页面，并传递 redirectUrl 参数
      redirectTo('/login', 
        { redirect_url: redirectUrl }
      )
      return;
  }
  await addJoinee(projectCode)
})


</script>
<template>
  <div align="center">
    <LoadingIndicator :loading="loading" />
  </div>
</template>