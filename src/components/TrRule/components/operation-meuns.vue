<template>
  <div ref="menusRef" v-if="visible" class="tr-mind_menus" :style="style" @click.stop>
    <ul class="tr-mind_menus_ul">
      <li
        v-for="(item, index) in menus"
        :key="index"
        class="tr-mind_menus_li"
        :style="item.style"
        @click="onSelect(item)"
      >
        <!-- <tr-svg-icon :icon-class="item.icon" class="icon" /> -->
        {{ item.name }}
      </li>
    </ul>

    <div class="arrow" :style="arrowStyle" />
  </div>
</template>

<script setup>
import { ref,computed, shallowRef,nextTick } from 'vue'
import Graph from '../Graph'
const emits = defineEmits(['select'])
const props = defineProps({
  graphData: {
    type: Graph,
    default: () => {
      return new Graph()
    },
    comment: '图结构'
  },
  menuFilter: {
    type: Function,
    default: null,
    comment: '获取菜单的过滤函数'
  },
})
const visible = ref(false)
const style = ref({})
const arrowStyle = ref({})
const currNode = ref(null)
const menus = ref([])

const graph = computed(()=>{
  return props.graphData
})

const show = (node)=> {
  visible.value = true
  currNode.value = node
  setStyle(node)
  initMenus(node)
  const fun = () => {
    hide()
    document.removeEventListener('click', fun)
  }
  document.addEventListener('click', fun)
}

const initMenus = (node)=> {
  const filter = props.menuFilter
  menus.value = filter instanceof Function
      ? filter(node)
      : [{ key: 'new', name: '新节点' }]
}
const onSelect = (item)=> {
  hide()
  emits('select', { item, node: currNode.value })
}
const hide = ()=> {
  visible.value = false
}
const menusRef = shallowRef(null)
const setStyle = (node)=> {
  nextTick(()=>{
    const attrs = node.attrs
    const ruleDom = menusRef.value?.parentElement?.parentElement
  
    style.value = {
      top: attrs.y + attrs.height - 11 + 'px',
      left: attrs.x + attrs.width + 1 + 'px'
    }
    arrowStyle.value = {
      top: '5px'
    }
    if (attrs.y + attrs.height + 115 > ruleDom.offsetHeight) {
      style.value = {
        top: attrs.y + attrs.height - 115 + 'px',
        left: attrs.x + attrs.width + 1 + 'px'
      }
      arrowStyle.value = {
        bottom: '5px'
      }
    }
  })
}
defineExpose({
  show,
  hide
})
</script>

<style lang="scss" scoped>
.tr-mind_menus {
  position: absolute;
  padding-left: 6px;
  display: flex;
  overflow: hidden;
  font-size: 12px;
  cursor: pointer;
  z-index: 3;
  &_ul {
    display: inline-block;
    vertical-align: top;
    list-style: none;
    padding: 0;
    margin: 0;
    border-top: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 12px 0 #eee;
    box-sizing: border-box;
    min-height: 100%;
  }
  &_li {
    position: relative;
    padding: 0 7px;
    height: 28px;
    line-height: 28px;
    overflow: hidden;
    user-select: none;
    cursor: pointer;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #606266;
    background-color: #fff;

    border-left: 1px solid #e4e7ed;
    border-right: 1px solid #e4e7ed;
    &:hover {
      background: #f5f7fa;
    }
    &.active {
      color: var(--color-theme);
      border-right-color: transparent;
    }
  }

  .arrow {
    position: absolute;
    left: 1px;
    width: 10px;
    height: 10px;
    z-index: 0;
    background-color: #fff;
    border-radius: 1px;
    box-shadow: 0 2px 12px 0 #eee;
    transform: rotate(45deg);
    border-left: 1px solid #e4e7ed;
    border-bottom: 1px solid #e4e7ed;
  }
}
</style>