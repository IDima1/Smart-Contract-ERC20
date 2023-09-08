import { useProvider } from '@/composables'
import { defineStore } from 'pinia'

export const useWeb3ProvidersStore = defineStore('web3-provider-store', () => {
  const provider =  useProvider()
  return {
    provider,
  }
})
