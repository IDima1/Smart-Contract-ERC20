import { defineStore } from 'pinia'
import { useProvider } from '@/composables'
import { MetamaskProvider, ProviderDetector } from '@distributedlab/w3p'
import { computed, ref } from 'vue'
import { bus, BUS_EVENTS, ErrorHandler } from '@/helpers'
import { useErc20Contract } from '@/composables/contracts'
import { BigNumber } from 'ethers'
import { BN } from '@distributedlab/tools'
import { providers } from 'ethers'
import { Erc20__factory } from '@/types/contracts'

const STORE_NAME = 'web3-providers-store'

export const useWeb3ProvidersStore = defineStore(STORE_NAME, () => {
  const provider = useProvider()

  const providerDetector = computed(() => new ProviderDetector())

  const isLoaded = ref(false)

  const isLoadFailed = ref(false)

  const inputReplenishment = ref()

  const inputTransferTokens = ref()

  const inputTransferAddress = ref('0x8c39495181151FB3d6Ac8c0215bDb60C076585a9')

  const setInputReplenishment = (value: string) => {
    inputReplenishment.value = value
  }

  const setInputTransferTokens = (value: string) => {
    inputTransferTokens.value = value
  }

  const setInputTransferAddress = (value: string) => {
    inputTransferAddress.value = value
  }

  const contractAddress = '0xffD29DF2d09f0eE3464e7Ab2b6cA88B3F49B6dAc'

  const contractBalance = ref<BigNumber>()

  const contractDecimals = ref<number>()

  const contractSymbol = ref<string>()

  const contractName = ref<string>()

  const contractERC20 = useErc20Contract(contractAddress, provider?.rawProvider)

  const getContractBalance = computed(() => {
    const balance = contractBalance.value

    if (balance) {
      const roundedBalance = Math.round(
        parseFloat(BN.fromBigInt(balance.toString(), 18).toString()),
      )
      return roundedBalance.toString()
    } else {
      return 'Balance is undefined'
    }
  })

  const init = async () => {
    try {
      await providerDetector.value.init()

      await provider.init(MetamaskProvider, {
        providerDetector: providerDetector.value,
      })

      if (!provider?.address.value) {
        return
      }

      contractBalance.value = await contractERC20.getBalanceOf(
        provider?.address.value,
      )
      contractDecimals.value = await contractERC20.getDecimals()
      contractSymbol.value = await contractERC20.getSymbol()
      contractName.value = await contractERC20.getName()

      isLoaded.value = true
    } catch (error) {
      ErrorHandler.process(error, 'Problem with initialization')
      isLoadFailed.value = true
    }
  }

  const getBalance = async () => {
    try {
      if (!provider.address?.value) {
        throw new TypeError('Provider is not defined')
      }

      const encodedTx = await contractERC20.mint(
        provider.address?.value,
        BN.fromRaw(inputReplenishment.value, 18).value,
      )

      await provider.signAndSendTx({
        to: contractAddress,
        data: encodedTx,
      })

      contractBalance.value = await contractERC20.getBalanceOf(
        provider.address?.value,
      )
      bus.emit(
        BUS_EVENTS.success,
        'The contract account was successfully replenished',
      )
    } catch (error) {
      ErrorHandler.process(error, 'Problem with transaction')
    }
  }

  const transferTokens = async () => {
    try {
      if (!provider.address?.value) {
        throw new TypeError('Provider is not defined')
      }

      const contract = Erc20__factory.connect(
        contractAddress,
        new providers.Web3Provider(
          provider?.rawProvider.value as providers.ExternalProvider,
        ),
      )

      const data = contract.interface.encodeFunctionData('transfer', [
        inputTransferAddress.value,
        BN.fromRaw(inputTransferTokens.value, 18).value,
      ])

      return provider.signAndSendTx({
        to: contractAddress,
        data,
      })
    } catch (error) {
      ErrorHandler.process(error, 'Problem with transferring tokens')
    }
  }

  return {
    provider,

    setInputReplenishment,
    setInputTransferAddress,
    setInputTransferTokens,

    isLoaded,
    isLoadFailed,

    contractAddress,
    contractDecimals,
    contractName,
    contractSymbol,

    getBalance,
    getContractBalance,
    transferTokens,
    init,
  }
})
