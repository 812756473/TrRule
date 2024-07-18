<template>
  <mind
    ref="ruleRef"
    :graph="graph"
    :menu-filter="menuFilter"
    :show-menus="showMenusFun"
    :style="{ height:height }"
    @add="onAdd"
  >
    <template  #node="{node}">
      <span
        v-if="node.data.type === 'group'"
        class="group"
        style="padding: 1px 5px;"
        @click.stop="checkGroup(node)"
      >
        <span>{{ node.data.name }}</span>
        <component
          :is="isShowList"
          v-if="logicalId === node.data.id"
          ref="logicalListRef"
          :data-list="logicalListData"
          @close="close"
        />
      </span>
      <condition
        v-else
        :attr-list="attrList"
        :formula-list="formulaList"
        :data="node.data"
        @select="onSelect(node)"
      />
    </template>
  </mind>
</template>

<script setup>
import Mind from './mind.vue'
import Graph from './Graph.js'
import Condition from './components/condition/index.vue'
import { v4 } from 'uuid'
import { ref, shallowRef,nextTick,computed } from 'vue'
import LogicalList from './components/logical-list.vue'

const emits = defineEmits(['change'])
const props = defineProps({
  attrList: {
    type: Array,
    default: () => []
  },
  height:{
    type:String,
    default:'500px'
  },
  formulaList: {
    type: Array,
    default: () => [],
    comment: '条件下拉框选项'
  },
})
const graph = ref(null)
const ruleSymbol = ref([])
const logicalListData = ref([
  {
    key: 'and',
    name: '并且',
    icon: 'and',
    style: { color: '#67C23A' }
  },
  { key: 'or', name: '或者', icon: 'or', style: { color: '#E6A23C' } },
  { key: 'not', name: '非', icon: 'not', style: { color: '#F56C6C' } }
])
const logicalId = ref('')

const listId = ref('')
const isShowList =computed(()=>{
  return listId.value === 'logicalLists' ? LogicalList : ''
})


const ruleRef = shallowRef(null)
const logicalListRef = shallowRef(null)
 /** 将序列化对象转换成Graph对象 */
const initGraph = (obj)=> {
  // console.log('将序列化对象转换成Graph对象', obj)
  graph.value = Graph.convert(obj)
}
/** 将Graph对象转换成序列化对象 */
const convert = ()=> {
  return Graph.toObject()
}
const showMenusFun = ({ node })=> {
  return node.data.type === 'group'
}
const onSelect = (node)=> {
  ruleRef.value.setSelectedNode(node)
}
const menuFilter = (node)=> {
  const result = [
    {
      key: 'item',
      name: '条件项',
      icon: 'conditions',
      style: { borderBottom: '1px solid rgb(204 204 204 / 35%)' }
    }
  ]
  if (node.data.type === 'group') {
    const arr = logicalListData.value
    result.push(...arr)
  }
  return result
}

const onAdd = ({ node, item })=> {
  // 新增一个节点
  let data
  if (item.key === 'item') {
    data = { id: v4(), type: 'item', name: item.name }
  } else {
    const style = { justifyContent: 'center' }
    switch (item.key) {
      case 'and':
        style.color = '#67C23A'
        break
      case 'or':
        style.color = '#E6A23C'
        break
      case 'not':
        style.color = '#F56C6C'
        break
    }
    data = {
      id: v4(),
      type: 'group',
      name: item.name,
      key: item.key,
      style
    }
  }

  ruleRef.value.addVertex(node, data)
}

/**
 * 点击逻辑项 可切换逻辑项
 * 2022/3/9 添加
 */
const checkGroup =(node)=> {
  if (!node.data.key) return
  listId.value = 'logicalLists'
  logicalId.value = node.data.id

  nextTick(() => {
    console.log(node,'logicalListRef.value');
    logicalListRef.value.show(node)
  })
}
const close = ()=> {
  listId.value = ''
  logicalId.value = ''
}
defineExpose({
  initGraph,
  graph
})
</script>

<style lang="scss" scoped>
.tr-rule_node.selected .tr-cond-item {
  border-color: transparent;
  &.selected {
    border-color: #409eff;
  }
}
.group {
  display: flex;
  position: relative;
  padding: 1px 5px;
  font-size: 12px;
}
</style>