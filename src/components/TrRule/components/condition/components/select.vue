<template>
  <el-select
    v-model="modelValue"
    ref="selectRef"
    popper-class="tr-rule-dropdown"
    class="tr-cond-operation__select"
    filterable
    :multiple="isMultiple"
    @change="onInput"
    @visible-change="onVisibleChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>

<script setup>
import {  ref,onMounted, shallowRef,nextTick } from 'vue'
const emits = defineEmits(['input','hide'])
const props = defineProps({
  value: {
      type: [Number, String, Array],
      default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  isMultiple: {
    type: Boolean,
    default: () => false
  }
})
const modelValue = ref('')
const selectRef = shallowRef(null)

const onInput = (value)=> {
  emits('input', value)
}

const onVisibleChange = (visible)=> {
  nextTick(() => {
    if (!visible) hideOperation()
  })
}

const hideOperation = ()=> {
  emits('hide')
}

onMounted(()=>{
  selectRef.value.focus()
  selectRef.value.inputRef.click()
  modelValue.value = props.value
})
</script>

<style lang="scss" scoped>
.tr-cond-operation {
  &__select{
    position: relative;
    top: -30px;
  }
}
</style>