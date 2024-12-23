<script lang="ts" setup>
import googleSvg from '../../assets/img/google.svg'

</script>

<template>
    <div class="bg-slate-50">
        <div class="flex flex-row justify-between mt-20">
            <div></div>
            <div>
                <button class=" flex flex-row px-2 gap-4 py-2 rounded bg-slate-200">
                    <img :src="googleSvg" width="20" alt="">
                    <span class="text-xs font-medium">Login with Google</span>
                </button>
            </div>
            <div></div>
        </div>
    </div>
</template>
