<template>
  <svg viewBox="0 0 1024 1024" width="10" height="10">
    <rect width="1024" height="1024" fill="#fff" />
    <path v-if="expand" d="M512 1024A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z m3.008-92.992a416 416 0 1 0 0-832 416 416 0 0 0 0 832zM192 448h640v128H192V448z" fill="#1890ff6b" />
    <path v-else d="M448 448V192h128v256h256v128H576v256H448V576H192V448h256z m64 576A512 512 0 1 1 512 0a512 512 0 0 1 0 1024z m3.008-92.992a416 416 0 1 0 0-832 416 416 0 0 0 0 832z" fill="#1890ff6b" />
  </svg>

</template>
<script setup>
defineProps({
  expand: {
    type: Boolean,
    default: true
  }
})
</script>

<style>

</style>
