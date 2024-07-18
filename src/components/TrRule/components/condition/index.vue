<template>
  <div class="tr-cond" @click="onClick" >
    <div class="tr-cond-main">
      <span class="tr-cond-item tr-cond-attr">
        {{ getItemLabel('label') }}
      </span>
      <span class="tr-cond-item tr-cond-formula">
        {{ getItemLabel('formula') }}
      </span>
      <span class="tr-cond-item tr-cond-value">
        {{ getItemLabel('value') }}
      </span>
    </div>
    <component
      :is="currComp"
      v-model="operation.value"
      class="tr-cond-operation"
       v-if="operation.visible"
      :options="operation.options"
      :is-multiple="isMultiple"
      @input="onInput"
      @hide='hide'
    />
  </div>
</template>

<script setup>
import { traverse } from './util'
import { ref,computed,onMounted } from 'vue'
import Input from './components/input.vue'
import Select from './components//select.vue'
const emits = defineEmits(['select'])
const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  attrList: {
    type: Array,
    default: () => []
  },
  formulaList: {
    type: Array,
    default: () => [],
    comment: '条件下拉框选项'
  },
})

const item = ref({
  label: '',
  formula: '',
  value: ''
})

const currComp = computed(()=>{
  let map = {
    select: Select,
  }
  return map[operation.value.type] || Input
})

const isMultiple = ref(false)
const operation = ref({
  visible: false,
  key: 'label',
  type: 'select', // 下拉框的类型
  value: '',
  options:[],
  style: {
    top: 0,
    left: 0
  }
})
const getValue = (key,value)=>{
  if(key === 'label'){
    return props.attrList.find(item=>item.value === value)?.label || value
  }else if(key  === 'formula'){
    return props.formulaList.find(item=>item.value === value)?.label || value
  }
  return value
}
const getItemLabel = (key)=> {
  const val = JSON.parse(JSON.stringify(item.value[key]))
  let map = {
    label: '属性',
    formula: '公式',
    value: '参数'
  }
  if(val){
    map[key] = getValue(key,val)
  }
  return map[key]
}
const onInput = (value)=> {
  item.value[operation.value.key] = value
}
const onAttrItemClick = (key)=>{
  operation.value.key = key
  operation.value.type = 'select'
  operation.value.value = item.value[key]
  operation.value.options = props.attrList
}
const onFormulaClick = (key)=> {
  operation.value.key = 'formula'
  operation.value.type = 'select'
  operation.value.value = item.value[key]
  isMultiple.value = false
  operation.value.options = props.formulaList
}
const onValueClick = (key)=>{
  operation.value.key = 'value'
  operation.value.type = 'input'
  operation.value.value = item.value[key]
}
const hide  = ()=>{
  operation.value.visible = false
  emits('select')
}
const onClick = (event)=>{
  const $el = event.target
  const classList = $el.classList
  if (classList.contains('tr-cond-item')) {
    // 设置选中状态
    const selectedEl = document.querySelector('.tr-cond-item.selected')
    selectedEl?.classList.remove('selected')
    $el.classList.add('selected')
    if (classList.contains('tr-cond-attr')) {
      onAttrItemClick('label')
    } else if (classList.contains('tr-cond-formula')) {
      onFormulaClick('formula')
    } else if (classList.contains('tr-cond-value')) {
      onValueClick('value')
    }
    operation.value.visible = true
  }
}
onMounted(()=>{
  if (!props.data.item) {
    props.data.item = {
      label: '',
      formula: '',
      value: ''
    }
  }
  item.value = props.data.item
})
</script>

<style lang="scss" scoped>
.tr-cond {
  position: relative;
  height: 27px;
  z-index: 2;
  &-main {
    display: flex;
    justify-content: left;
  }

  &-operation {
    z-index: 4;
    margin-top: 3px;

    &__input {
      width: 100%;
    }
  }
  &-item {
    white-space: nowrap;
    padding: 1px 5px;
    font-size: 14px;
    cursor: pointer;
    border: solid 1px transparent;
    border-radius: 1px;
    min-width: 40px;
    height: 24px;
    &.selected {
      border-color: #409eff;
    }
  }
  &-attr {
    background: rgba(0, 238, 255, 0.11);
    color: #58f;
  }
  &-formula {
    background: rgba(255, 238, 0, 0.3);
    color: #d70;
    text-align: center;
  }
  &-value {
    background: rgba(0, 238, 0, 0.11);
    color: #0a0;
  }
}
</style>
