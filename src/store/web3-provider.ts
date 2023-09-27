import { defineStore } from 'pinia'
import { ProviderDetector, MetamaskProvider } from '@distributedlab/w3p'
import { useProvider } from '@/composables'
import { computed, ref } from 'vue'
import { ErrorHandler } from '@/helpers'

const STORE_NAME = 'provider-initialization-store'

export const useProviderInitStore = defineStore(STORE_NAME, () => {
  const provider = useProvider()
  const providerDetector = computed(() => new ProviderDetector())

  const isLoaded = ref(false)
  const isLoadFailed = ref(false)

  const initProvider = async () => {
    try {
      await providerDetector.value.init()

      await provider.init(MetamaskProvider, {
        providerDetector: providerDetector.value,
      })

      isLoaded.value = true
    } catch (error) {
      ErrorHandler.process(error)
      isLoadFailed.value = true
    }
  }

  return {
    isLoaded,
    isLoadFailed,

    provider,
    initProvider,
  }
})
