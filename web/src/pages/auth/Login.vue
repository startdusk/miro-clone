<script lang="ts" setup>
import googleSvg from '../../assets/img/google.svg'
import githubSvg from '../../assets/img/github.svg'

const loginWithGithub = async () => {
    
}
</script>

<template>
    <div class="">
        <div class="flex flex-row justify-between mt-40">
            <div></div>
            <div class="w-[400px]">
                <button class="flex w-full shadow-md justify-center flex-row px-4 gap-4 py-2 rounded bg-slate-200">
                    <img :src="googleSvg" width="20" alt="">
                    <span class="text-xs font-medium">Login with Google</span>
                </button>

                <button 
                    class="mt-1 flex w-full shadow-md justify-center flex-row px-4 gap-4 py-2 rounded bg-slate-200"
                    @click="loginWithGithub"
                    >
                    <img :src="githubSvg" width="20" alt="">
                    <span class="text-xs font-medium">Login with Github</span>
                </button>
            </div>
            <div></div>
        </div>
    </div>
</template>
