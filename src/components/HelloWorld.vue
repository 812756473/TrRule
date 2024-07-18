<template>
    <tr-rule
      ref="ruleRef"
      class="rule"
      :attr-list="attrList"
      height='100%'
      :formula-list="formulaList"
    />
    <!-- <el-button @click="onClick">点击</el-button> -->
</template>

<script setup>
import TrRule from './TrRule/index.vue'
import { ref,shallowRef,onMounted } from 'vue'
const attrList = ref([
  {
    label:'物料编码',
    value:'MATNR',
    key:'MATNR'
  },
  {
    label:'物料类型',
    value:'MTART',
    key:'MTART'
  },
  {
    label:'行业领域',
    value:'MBRSH',
    key:'MBRSH'
  },
])

const formulaList = ref([
  {
    label:'=',
    value:'a',
    key:'a',
  },
  {
    label:'!=',
    value:'b',
    key:'b',
  },
  {
    label:'包含',
    value:'c',
    key:'c',
  },
])

const ruleRef = shallowRef(null)
const jsonObj = ref(null)
const onChange = (graph) => {
  jsonObj.value = graph.toObj()
}

const init = (objBak)=> {
  let obj = {
    nodes: [
      { id: 1, name: '规则', type: 'group', style: { fontWeight: 'bold' } }
    ],
    lines: []
  }

  if (objBak) {
    obj = objBak
  }
  ruleRef.value.initGraph(obj)
}
let obj = ref({
    "nodes": [
        {
            "id": 1,
            "name": "规则",
            "type": "group",
            "style": {
                "fontWeight": "bold"
            }
        },
        {
            "id": "2b66a7d1-cb93-4e33-b305-f67cb215bf6b",
            "type": "item",
            "name": "条件项",
            "item": {
                "label": "MATNR",
                "formula": "a",
                "value": "12341"
            }
        },
        {
            "id": "d4b46865-67b5-4ed5-9ccd-574a33d502de",
            "type": "group",
            "name": "并且",
            "key": "and",
            "style": {
                "justifyContent": "center",
                "color": "#67C23A"
            }
        },
        {
            "id": "5a107ba7-f792-41ad-9404-62944002915d",
            "type": "item",
            "name": "条件项",
            "item": {
                "label": "MTART",
                "formula": "b",
                "value": "15"
            }
        }
    ],
    "lines": [
        {
            "fromId": 1,
            "toId": "2b66a7d1-cb93-4e33-b305-f67cb215bf6b"
        },
        {
            "fromId": 1,
            "toId": "d4b46865-67b5-4ed5-9ccd-574a33d502de"
        },
        {
            "fromId": "d4b46865-67b5-4ed5-9ccd-574a33d502de",
            "toId": "5a107ba7-f792-41ad-9404-62944002915d"
        }
    ]
})
// const onClick = ()=>{
//   let  graph= ruleRef.value.graph
//   jsonObj.value = graph.toObj()
// }
onMounted(()=>{
  init(obj.value)
})
</script>

<style lang="scss" scoped>

</style>