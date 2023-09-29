<template>
  <div class="contract">
    <contract-details
      :contract-decimals="contractDecimals"
      :contract-symbol="contractSymbol"
      :contract-name="contractName"
      :is-loaded="isLoaded"
      :is-load-failed="isLoadFailed"
    />
    <contract-interaction
      :contract-balance="contractBalance"
      :contract-init="contractInit"
    />
  </div>
</template>

<script lang="ts" setup>
import ContractDetails from '@/forms/ContractDetails.vue'
import ContractInteraction from '@/forms/ContractInteraction.vue'
import { useProviderInitStore } from '@/store'
import { useErc20Contract } from '@/composables/contracts'
import { BigNumber } from 'ethers'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ErrorHandler } from '@/helpers'

const { t } = useI18n()
const storeProvider = useProviderInitStore()
const contractInit = useErc20Contract(
  '0x5a307c8C0198F855266c96DeC43a3429f474291d',
)
const contractBalance = ref<BigNumber>()
const contractDecimals = ref<number>()
const contractSymbol = ref<string>()
const contractName = ref<string>()

const isLoaded = ref<boolean>(false)
const isLoadFailed = ref<boolean>(false)

const initContractData = async (): Promise<void> => {
  try {
    if (!storeProvider.provider.address)
      throw new TypeError('Provider is not defined')
    contractBalance.value = await contractInit.getBalanceOf(
      storeProvider.provider?.address,
    )
    contractName.value = await contractInit.getName()
    contractDecimals.value = await contractInit.getDecimals()
    contractSymbol.value = await contractInit.getSymbol()

    isLoaded.value = true
  } catch (error) {
    isLoadFailed.value = true
    ErrorHandler.process(error)
  }
}

initContractData()
</script>

<style lang="scss" scoped></style>
