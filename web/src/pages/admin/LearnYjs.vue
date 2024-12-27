<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'

const margin = ref({ left: 0 })
const yMap = ref()
const yArray = ref()
const users = ref<string[]>([])

function initYjs() {
  const doc = new Y.Doc();
  yMap.value = doc.getMap('y-map')
  yMap.value.observe((event: any) => {
    margin.value.left = yMap.value.get('margin-left')
    console.log('yMap was modified', event)
  })

  yArray.value = doc.getArray('y-array')
  yArray.value.observe((event: any) => {
    console.log('yArray was modified', event)
    users.value = yArray.value.toArray()
  })
  // Sync clients with the y-websocket provider
  new WebsocketProvider(
    'ws://localhost:1234', 'my-room', doc
  )
}

function changeMargin() {
  margin.value.left += 12
  yMap.value.set('margin-left', margin.value.left)
}

function addUsers() {
  users.value.push('Ben')
  yArray.value.insert(0, users.value)
}


onMounted(() => {
  initYjs()
})

</script>
<template>
  <div>
    <p :style="{ marginLeft: margin.left + 'px' }">
      Hello World
    </p>
    <button @click="changeMargin" style="border: 1px solid red;">click here</button>
  </div>
  <div>
    {{ users }}
    <button @click="addUsers" style="border: 1px solid red;">add users</button>
  </div>
</template>
