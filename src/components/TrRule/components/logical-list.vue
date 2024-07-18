<template>
  <ul ref="menusRef" class="group-list" :style="style">
    <li
      v-for="item in dataList"
      :key="item.key"
      :style="item.style"
      @click.stop="checkLogicalItem(item, currNode)"
    >
      {{ item.name }}
    </li>
  </ul>
</template>

<script setup>
import { ref, shallowRef } from 'vue'
const emits = defineEmits(['close'])
const props = defineProps({
  dataList: {
    type: Array,
    default: () => []
  }
})
const currNode = ref(null)
const style = ref({
  top: 0,
  left: 0
})
const show = (node)=> {
  currNode.value = node
  setStyle(node)
  const fun = () => {
    hide()
    document.removeEventListener('click', fun)
  }
  document.addEventListener('click', fun)
}
const hide = ()=> {
  emits('close')
}
const menusRef = shallowRef(null)
const setStyle = (node)=> {
  const attrs = node.attrs
  style.value = {
    top: attrs.height - 4 + 'px',
    left: 0
  }
}
/**
     * 切换逻辑项点击事件
  */
const checkLogicalItem = (item, node)=> {
  Object.assign(node.data, item)
  hide()
}
defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
.group-list {
  width: 50px;
  position: absolute;
  left: -10px;
  overflow: hidden;
  font-size: 12px;
  cursor: pointer;
  z-index: 999;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 #eee;
  box-sizing: border-box;
  padding: 0;
  li {
    list-style: none;
    margin: 0;
    padding: 5px 10px;
    &:hover {
      background-color: #e4e7ed;
    }
  }
}
</style>