<template>
  <div class="the-main-page">
    <contract-form />
  </div>
</template>

<script lang="ts" setup>
import ContractForm from '@/forms/ContractForm.vue'
</script>

<style lang="scss" scoped>
.the-main-page {
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
