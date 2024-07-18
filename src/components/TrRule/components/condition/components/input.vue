<template>
  <el-input
    ref="inputRef"
    v-model="modelValue"
    class="tr-cond-operation__input"
    placeholder="逗号分隔"
    @input="onInput"
    @blur="onBlur"
  />
</template>

<script setup>
import { ref,onMounted, shallowRef } from 'vue'
const emits = defineEmits(['input'])
const props = defineProps({
  value: {
    type: [Number, String],
    default: ''
  },
})
const modelValue = ref('')
const inputRef = shallowRef(null)
onMounted(() => {
  inputRef.value.focus()
  modelValue.value = props.value
})

const onInput = (value)=> {
  emits('input', value)
}
const onBlur = ()=> {
  emits('hide')
}
</script>

<style lang="scss" scoped>
.tr-cond-operation {
  &__input{
    position: relative;
    top: -30px;
  }
}
</style>