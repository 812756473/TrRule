<template>
  <el-button
    v-show="visible"
    type="danger"
    size="small"
    :icon="Delete"
    circle
    :style="style"
    style="position: absolute;padding: 2px;"
    @click="onClick"
  />
</template>

<script setup>
import { Delete } from '@element-plus/icons-vue'
import { ref,onUnmounted } from 'vue'

const emits = defineEmits(['click','command'])
const visible = ref(false)
const node = ref(null)
const style = ref({})

onUnmounted(()=>{
  document.body.onclick = null
})
const show = (nodeData)=> {
  node.value = nodeData
  const attrs = nodeData.attrs
  style.value = {
    left: (attrs.x - 18) + 'px',
    top: (attrs.y + attrs.height / 2 - 8) + 'px'
  }
  visible.value = true
  const fun = () => {
    hide()
    document.removeEventListener('click', fun)
  }
  document.addEventListener('click', fun)
}
const hide = ()=> {
  visible.value = false
}
const onClick = ()=> {
  hide()
  emits('click', node.value)
}
 /** 右键菜单项点击事件
     *  @param key 每个菜单项都有一个唯一key
     */
const onRightMenuItemClick = (event, key)=>{
  visible.value = false
  emits('command', { command: key, node:node.value })
}

defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
.el-button{
  width: 16px !important;
  height: 16px;
  font-size: 12px;
}
</style>