<template>
 <div ref="ruleRef" class="tr-rule">
    <!-- 节点图层, 为div元素 -->
    <div class="tr-rule_layer  tr-rule_node-layer">
      <div
        v-for="node in svgStates.rects"
        :key="node.id"
        class="tr-rule_node"
        :draggable="true"
        :class="getNodeClass(node)"
        :style="getNodeStyle(node)"
        @mouseover="showIcons(node)"
        @dragstart="dragstart($event, node)"
        @dragover="dragover"
        @drop="drop($event, node)"
      >
        <slot name="node" :node="node">
          <span class="tr-rule_node-text" @click="onEditNode(node)">
            {{ node.data && node.data.name }}
          </span>
        </slot>

        <more-icon
          v-if="!showMenus || showMenus({ graph, node })"
          class="tr-rule_node-add"
          @mouseover.enter="showOperationMenus(node)"
        />
      </div>
      <!--操作图层-->
      <expand-icon
        v-for="node in expandIcons"
        :key="`${node.id}_icon`"
        :expand="node.expand"
        class="tr-rule_node-expand-icon"
        :style="getExpandIconStyle(node)"
        @click.enter="onExpandIconClick($event, node)"
      />
    </div>
    <!-- 线条图层 -->
    <div class="tr-rule_layer tr-rule_line-layer">
      <svg
        v-for="line in svgStates.lines"
        :key="line.id"
        class="tr-rule_line"
        :style="getLineStyle(line)"
        :width="line.rect.width"
        :height="line.rect.height"
      >
        线条
        <path
          v-bind="line.attrs"
          stroke="#9e9e9e80"
          stroke-width="1"
          fill="none"
          style="cursor:pointer;"
        />
      </svg>
    </div>
    <!--工具栏图层-->
    <div class="tr-rule_layer tr-rule_tool-layer">
      <!-- 操作菜单 -->
      <operation-menus ref="menusRef" :graphData='graph' :menuFilter='menuFilter' @select="onMenuSelect" />
      <!-- 删除按钮-->
      <delete-icon ref="deleteIconRef" @click="removeNode" />
    </div>
  </div>
</template>

<script setup>
const NODE_WIDTH = 40
const NODE_HEIGHT = 26
const NODE_MARGIN_RIGHT = 50
const NODE_MARGIN_TOP = 10
const SVG_PADDING_LEFT = 20
const SVG_PADDING_TOP = 25
const TURN_DISTANCE = 5
import {
  getHeadPoint,
  getTailPoint,
  getRectCenter,
  getLineCenter,
  getLineBorder,
  INIT_RECT
} from './util'
import operationMenus from './components/operation-meuns.vue'
import deleteIcon from './components/delete-btn.vue'
import expandIcon from './icons/expand.vue'
import moreIcon from './icons/more.vue'
import Graph from './Graph'
import { ref,computed,watch,onMounted,nextTick, shallowRef } from 'vue'

const emits = defineEmits(['add'])
const props = defineProps({
  graph: {
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
  showMenus: {
    type: [Boolean, Function],
    default: null,
    comment: '是否展示菜单'
  },
  showEditNode: {
    type: [Boolean, Function],
    default: false,
    comment: '是否节点的编辑框'
  }
})
const width = ref('100%')
const height = ref('600px')
const svgStates = ref({
  rects: [],
  lines: []
})
const selectedNode = ref(null)
const dragNode = ref(null)
const expandIcons = computed(()=>{
  return svgStates.value.rects.filter(node => node?.edges?.length)
})

const dragstart = (e, node)=> {
  dragNode.value = node
}
const dragover = (e, node)=> {
  e.preventDefault()
}
const drop = (e, node)=> {
  e.stopPropagation()
  e.preventDefault()
  const dragNodeData = dragNode.value

  if (!dragNodeData) return
  if (node.data.type !== 'group') {
    console.log('错误操作，只能以逻辑项为拖拽目标')
    return
  }
  const startId = dragNodeData.id
  const endFromId = !node.isRoot && node.preEdge.from.id
  if (startId === endFromId) {
    console.log('错误操作,禁止父级向子级拖拽')
    return
  }
  const { graph } = props
  graph.deleteVertex(dragNodeData, true)

  graph.addEdge(node, dragNodeData)

  graph.vertices.push(dragNodeData)
  init()
  dragNode.value = null
}
const ruleRef = shallowRef(null)
const setScrollTop = (node)=> {
  nextTick(() => {
    const ruleDom = ruleRef.value
    const attrs = node.attrs || node.to.attrs
    // 当弹出层底部距离窗口顶部的 高度 大于当前窗口高度时 将滚动条滚到相应位置
    if (attrs.y + attrs.height + 115 > ruleDom.offsetHeight) {
      ruleDom.scrollTop = attrs.y - 2 * attrs.height
    }
  })
}
const setSelectedNode = (node)=> {
  selectedNode.value = node
}
const menusRef = shallowRef(null)
const showOperationMenus = (node)=> {
  menusRef.value.show(node)
}
const hideOperationMenus = ()=> {
  menusRef.value.hide()
}
const deleteIconRef = shallowRef(null)
const showIcons = (node)=> {
  if (node.isRoot) return
  deleteIconRef.value.show(node)
}
const hideIcons = ()=> {
  deleteIconRef.value.hide()
}
 // 事件处理：展开图标点击事件
const onExpandIconClick = (event, node)=> {
  event.stopImmediatePropagation()
  node.expand = !node.expand
  init()
}
// 事件处理：菜单选中事件
const onMenuSelect = (value)=> {
  emits('add', value)
}
 // 删除节点
const removeNode = (node)=> {
  props.graph.deleteVertex(node)
  init()
}
// 脑图开始渲染
const init = ()=> {
  if (!props.graph || !props.graph.root) return
  clear()
  setup()
  draw()
  resetSvgStyle()
}
// 渲染前准备：清空脑图操作痕迹
const clear = ()=> {
  hideOperationMenus()
  hideIcons()
}
 // 重置画布的样式：高度和宽度
const resetSvgStyle = ()=> {
  const root = props.graph.root
  const rectw = root.rect.width + SVG_PADDING_LEFT * 2
  const recth = root.rect.height + SVG_PADDING_TOP * 2 + 200
  width.value = rectw + 'px'
  height.value = Math.max(200, recth) + 'px'
}
 // 渲染前准备：根据graph获取要渲染的图形数据
const setup = ()=> {
  // 树的方向是从左往右
  const graph = props.graph
  const root = graph.root
  // 1. 后序遍历获取【能包含节点和子节点】的最小矩形的宽度和高度
  graph.postorder(node => {
    const toArr = node.toVertices()
    if (toArr.length === 0) {
      // 叶子节点
      const rect = {
        ...INIT_RECT,
        width: NODE_WIDTH,
        height: NODE_HEIGHT
      }
      node.rect = rect
    } else {
      // 子树的的高度求和
      const rect = { ...INIT_RECT }

      let maxChildWidth = 0
      node.toVertices().forEach(child => {
        maxChildWidth = Math.max(maxChildWidth, child.rect.width)
      })
      rect.width = NODE_WIDTH + maxChildWidth + NODE_MARGIN_RIGHT
      node.rect = rect
    }
  })
  // 2. 前序遍历获取【能包含节点和子节点】的最小矩形的x和y
  root.rect.x = SVG_PADDING_LEFT
  root.rect.y = SVG_PADDING_TOP
  // 2.1 先求最小矩形的x
  graph.preorder(node => {
    // 根据宽度和高度计算坐标
    node.toVertices().forEach(child => {
      child.rect.x = node.rect.x + NODE_WIDTH + NODE_MARGIN_RIGHT
    })
  })
  // 2.2 压缩垂直方向的空白区域, 求出压缩后最小矩形的高度和垂直坐标向上偏移量
  graph.postorder(node => {
    const toArr = node.toVertices()
    if (toArr.length > 0) {
      let prevNode = toArr[0]
      let nodeHeight = prevNode.rect.height
      // 子树的的高度求和
      for (let i = 1; i < toArr.length; i++) {
        const currNode = toArr[i]
        // 压缩空白区域
        // 两个矩形的宽度不一致，且大矩形的空白区域能包含小矩形时，进行压缩
        const unitH = currNode.rect.height + NODE_MARGIN_TOP
        nodeHeight += unitH
        prevNode = currNode
      }
      node.rect.height = nodeHeight
    }
  })
  // 2.3 求最小矩形的y
  graph.preorder(node => {
    // 根据宽度和高度计算坐标
    let currY = node.rect.y
    node.toVertices().forEach(child => {
      child.rect.y = currY + child.rect.offsetY
      currY = child.rect.y + child.rect.height + NODE_MARGIN_TOP
    })
  })
  // 3. 需要让根节点垂直居中，所以需要计算偏移量
  const parentBound = ruleRef.value.getBoundingClientRect()
  const offsetX = 20
  const offsetY = Math.max(
    0,
    parentBound.height / 2 - (root.rect.y + root.rect.height / 2)
  )
  // 4. 根据【能包含节点和子节点】的最小矩形计算当前节点的位置
  graph.preorder(node => {
    // 根据宽度和高度计算坐标
    node.rect.x += offsetX
    node.rect.y += offsetY
  })
  graph.postorder(node => {
    const rect = node.rect
    const attrs = {
      x: rect.x,
      y: rect.y + rect.height / 2 - NODE_HEIGHT / 2,
      width: NODE_WIDTH,
      height: NODE_HEIGHT
    }
    const toVertices = node.toVertices()
    if (toVertices.length > 1) {
      const firstOne = toVertices[0]
      const lastOne = toVertices[toVertices.length - 1]
      attrs.y =
        firstOne.attrs.y +
        (lastOne.attrs.y + lastOne.attrs.height - firstOne.attrs.y) / 2 -
        NODE_HEIGHT / 2
    } else if (toVertices.length === 1) {
      attrs.y = toVertices[0].attrs.y
    }
    node.attrs = attrs
  })
}
/** 添加子节点节点 */
const addVertex = (father, data)=> {
  const { graph } = props
  const node = graph.addEdge(father, graph.createVertex(data))

  // 自适应高度， 新增子节点之后 滚动到对应的位置
  setScrollTop(node)
  init()
}
// 渲染
const draw = ()=> {
  initRects()
  initLines()
}
 // 渲染节点
const initRects = ()=> {
  let results = [props.graph.root]
  props.graph.preorder(node => {
    results = [...results, ...node.toVertices()]
  })
  svgStates.value.rects = results
}
// 渲染线条
const initLines = ()=> {
  const result = []
  svgStates.value.rects.forEach(from => {
    from.getDisplayEdges().forEach(edge => {
      const to = edge.to
      const startPoint = getTailPoint(from.attrs)
      const endPoint = getHeadPoint(to.attrs)
      const origin = {
        x: Math.min(startPoint.x, endPoint.x) - 1,
        y: Math.min(startPoint.y, endPoint.y) - 1
      }
      // 将线条的起点和终点换成相对原点origin的坐标
      let rectH = Math.abs(startPoint.y - endPoint.y)
      if (rectH < NODE_HEIGHT) {
        origin.y -= (NODE_HEIGHT - rectH) / 2
        rectH = NODE_HEIGHT
      }
      startPoint.x -= origin.x
      startPoint.y -= origin.y
      endPoint.x -= origin.x
      endPoint.y -= origin.y

      const n = TURN_DISTANCE + 25
      const d = `M${startPoint.x} ${startPoint.y} H${startPoint.x +
        TURN_DISTANCE}  C${startPoint.x + n} ${startPoint.y} ${endPoint.x -
        n} ${endPoint.y} ${endPoint.x - TURN_DISTANCE} ${endPoint.y} H${
        endPoint.x
      }`

      result.push({
        rect: {
          ...origin,
          width: Math.abs(startPoint.x - endPoint.x) + 2,
          height: rectH + 2
        },
        startNode: from,
        endNode: to,
        startPoint,
        endPoint,
        key: edge.value,
        attrs: { d }
      })
    })
  })
  svgStates.value.lines = result
}
const getNodeClass = (rect)=> {
  return {
    selected: rect === selectedNode.value
  }
}
const getNodeStyle = (rect)=> {
  const { x, y, width, height, zIndex } = rect.attrs
  return {
    ...rect.data.style,
    top: `${y}px`,
    left: `${x}px`,
    minWidth: `${width}px`,
    height: `${height}px`,
    zIndex
  }
}
const getLineStyle = (line)=> {
  const { rect } = line
  return {
    top: `${rect.y}px`,
    left: `${rect.x}px`
  }
}
const getExpandIconStyle = (rect)=> {
  const { x, y, width, height } = rect.attrs
  const n = 12
  return {
    top: `${y + height / 2 - n / 2}px`,
    left: `${x + width}px`,
    width: `${n}px`,
    height: `${n}px`
  }
}


watch(()=>props.graph,()=>{
  init()
})
onMounted(()=>{
  init()
})

defineExpose({
  setSelectedNode,
  addVertex
})

</script>

<style lang="scss" scoped>
.tr-rule {
  position: relative;
  min-height: 100px;
  height: 100%;
  overflow-y: auto;

  transition: all 0.3s;
  &_layer {
    position: absolute;
  }
  &_tool-layer {
    z-index: 101;
  }
  &_node {
    position: absolute;
    display: flex;
    justify-content: left;
    border: solid 1px #e0eaf1;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;

    &-text {
      display: flex;
      align-items: center;
    }
    &-add {
      position: absolute;
      right: 0;
      bottom: 0;
      fill: #e6a23c;
      cursor: pointer;
      z-index: 100;
    }
    &-expand-icon {
      position: absolute;
      background: #fff;
      z-index: 99;
      cursor: pointer;
    }
    &.selected {
      z-index: 101;
    }
  }
  &_line {
    position: inherit;
    &-rect {
      stroke: #fff;
      stroke-width: 1;
      fill: #fff;
    }
    &-text {
      font-size: 12px;
      z-index: 2;
      fill: #666;
      text-anchor: middle; /* 文本水平居中 */
      dominant-baseline: middle; /* 文本垂直居中 */
    }
    &-path {
      stroke: #9e9e9e80;
      stroke-width: 1;
      fill: none;
      cursor: pointer;
    }
  }
}
</style>