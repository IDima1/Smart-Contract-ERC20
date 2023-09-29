<template>
  <div class="contract-details">
    <template v-if="storeProvider?.provider.isConnected">
      <div class="contract-details__account">
        <h1 class="contract-details__account-header">
          {{ $t('contract-details.account-title') }}
        </h1>
        <p class="contract-details__account-text">
          {{ $t('contract-details.address-text') }}
          {{ storeProvider.provider?.address }}
        </p>
        <p class="contract-details__account-text">
          {{ $t('contract-details.chain-id-text') }}
          {{ storeProvider.provider?.chainId }}
        </p>
        <p class="contract-details__account-text">
          {{ $t('contract-details.chain-type-text') }}
          {{ storeProvider.provider?.chainType }}
        </p>
      </div>
      <template v-if="isLoaded">
        <template v-if="isLoadFailed">
          <p>{{ $t('errors.loaded-failed-msg') }}</p>
        </template>
        <template v-else>
          <div class="contract-details__contract">
            <h1 class="contract-details__account-header">
              {{ $t('contract-details.contract-title') }}
            </h1>
            <p class="contract-details__account-text">
              {{ $t('contract-details.contract-name-text') }}
              {{ contractName }}
            </p>
            <p class="contract-details__account-text">
              {{ $t('contract-details.contract-decimals-text') }}
              {{ contractDecimals }}
            </p>
            <p class="contract-details__account-text">
              {{ $t('contract-details.contract-symbol-text') }}
              {{ contractSymbol }}
            </p>
          </div>
        </template>
      </template>
      <template v-else>
        <p>{{ $t('errors.loading-err-msg') }}</p>
      </template>
    </template>
    <template v-else>
      <div class="contract-form__unconnected">
        <h1 class="contract-form__unconnected-header">
          {{ $t('contract.unconnected-title') }}
        </h1>
        <app-button
          class="contract-form__unconnected-button"
          size="large"
          :text="$t('contract.unconnected-btn')"
          modification="border-rounded"
          @click="storeProvider.provider?.connect"
        >
        </app-button>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useProviderInitStore } from '@/store'
import { BigNumber } from 'ethers'
import { useI18n } from 'vue-i18n'

defineProps<{
  contractName?: string | undefined
  contractDecimals?: number | undefined
  contractSymbol?: string | undefined
  contractBalance?: BigNumber | undefined
  isLoaded: boolean
  isLoadFailed: boolean
}>()

const { t } = useI18n()
const storeProvider = useProviderInitStore()
</script>

<style lang="scss" scoped>
.contract-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: toRem(20);
  gap: toRem(16);

  background-color: var(--background-primary-dark);
  padding: toRem(20);
  border-radius: toRem(10);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
}

.contract-details__account-header,
.contract-details__interaction-header,
.contract-details__unconnected-header {
  margin-bottom: toRem(10);
  color: var(--text-primary-main);
  padding-bottom: toRem(18);
  border-bottom: toRem(2) solid var(--border-primary-main);
}

.contract-details__account-text,
.contract-details__interaction-text {
  margin-bottom: toRem(2);
}

.contract-details__account,
.contract-details__contract {
  flex: 1;
  padding: toRem(18);
  background-color: var(--background-primary-light);
  border-radius: toRem(12);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
}

.contract-form__unconnected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(16);
}
</style>
