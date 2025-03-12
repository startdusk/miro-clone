<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { redirectLogin, storeUserToken } from '../../hepler/auth';
import { authenticate } from '../../service/auth';

const msg = ref('Waiting for authorization...')

const hasAuthorized = ref(false)

const authorize = () => {
  hasAuthorized.value = true
  authenticate()
}

const cancel = () => {
  redirectLogin()
}

onMounted(() => {
  const token = new URLSearchParams(window.location.search).get('token');
  if (token) {
    hasAuthorized.value = true
    msg.value = 'auth was successful'
    storeUserToken(token)
    setTimeout(() => {
      window.location.href = '/projects';
    }, 500)
  } else {
    hasAuthorized.value = false
  }
})

</script>
<template>
  <div
   class="flex flex-col gap-2 p-4"
   >
    <div v-if="hasAuthorized">
      <h1>{{ msg }}</h1>
    </div>
    <div v-else
    >
      <div>Authorization Request</div>
      <div><b>miro-close</b> is requesting permission to access your account.</div>
      <div class="flex justify-center align-middle">
        <button @click="authorize" type="button" class="px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold 
             hover:bg-blue-600 hover:shadow-md 
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75
             active:scale-95 transition-all duration-200 m-2">Authorize</button>
        <button @click="cancel" type="button"
        class="px-4 py-2 bg-gray-500 text-white rounded-lg font-semibold 
             hover:bg-gray-600 hover:shadow-md 
             focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-75
             active:scale-95 transition-all duration-200 m-2"
        >Cancel</button>
      </div>
    </div>
  </div>
</template>