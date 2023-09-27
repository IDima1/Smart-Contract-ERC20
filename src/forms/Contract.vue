<template>
  <template v-if="storeProvider.isLoaded">
    <template v-if="storeProvider.isLoadFailed">
      <p>{{ $t('errors.loaded-failed-msg') }}</p>
    </template>
    <template v-else-if="storeProvider.provider?.isConnected">
      <div class="contract">
        <contract-details
          :contract-decimals="contractDecimals"
          :contract-symbol="contractSymbol"
          :contract-name="contractName"
        />
        <contract-interaction
          :contract-balance="contractBalance"
          :contract-init="contractInit"
        />
      </div>
    </template>
    <template v-else>
      <div class="contract__unconnected">
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
  </template>
  <template v-else>
    <div>
      <p>{{ `Loading...` }}</p>
    </div>
  </template>
</template>

<script lang="ts" setup>
import ContractDetails from '@/forms/ContractDetails.vue'
import ContractInteraction from '@/forms/ContractInteraction.vue'
import { AppButton } from '@/common'
import { useProviderInitStore } from '@/store'
import { useErc20Contract } from '@/composables/contracts'
import { BigNumber } from 'ethers'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const storeProvider = useProviderInitStore()
const contractInit = useErc20Contract(
  '0x5a307c8C0198F855266c96DeC43a3429f474291d',
)
const contractBalance = ref<BigNumber>()
const contractDecimals = ref<number>()
const contractSymbol = ref<string>()
const contractName = ref<string>()

const initContractData = async () => {
  if (!storeProvider.provider.address)
    throw new TypeError('Provider is not defined')

  contractBalance.value = await contractInit.getBalanceOf(
    storeProvider.provider?.address,
  )
  contractName.value = await contractInit.getName()
  contractDecimals.value = await contractInit.getDecimals()
  contractSymbol.value = await contractInit.getSymbol()
}

initContractData()
</script>

<style lang="scss" scoped>
.contract__unconnected {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: toRem(16);
}
</style>
