import { defineStore } from 'pinia'
import { ProviderDetector, MetamaskProvider } from '@distributedlab/w3p'
import { useProvider } from '@/composables'
import { computed } from 'vue'
import { ErrorHandler } from '@/helpers'

const STORE_NAME = 'web3-provider-store'

export const useProviderInitStore = defineStore(STORE_NAME, () => {
  const provider = useProvider()
  const providerDetector = computed(() => new ProviderDetector())

  const initProvider = async () => {
    try {
      await providerDetector.value.init()

      await provider.init(MetamaskProvider, {
        providerDetector: providerDetector.value,
      })
    } catch (error) {
      ErrorHandler.process(error)
    }
  }

  return {
    provider,
    initProvider,
  }
})
