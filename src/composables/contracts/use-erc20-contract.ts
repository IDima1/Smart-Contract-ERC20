import { computed } from 'vue'
import { Erc20, Erc20__factory } from '@/types/contracts'
import { BigNumberish, providers } from 'ethers'
import { useProviderInitStore } from '@/store'

export const useErc20Contract = (address: string) => {
  const storeProvider = useProviderInitStore()

  const provider = computed(() => storeProvider.provider)

  const contractInstance = computed<Erc20 | undefined>(() => {
    if (!provider?.value?.rawProvider && address) {
      return undefined
    } else {
      const web3Provider = new providers.Web3Provider(
        provider.value.rawProvider as providers.ExternalProvider,
      )
      return Erc20__factory.connect(address, web3Provider)
    }
  })

  const contractInterface = Erc20__factory.createInterface()

  const approve = async (spender: string, amount: BigNumberish) => {
    const data = contractInterface.encodeFunctionData('approve', [
      spender,
      amount,
    ])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const decreaseAllowance = async (
    spender: string,
    subtractedValue: BigNumberish,
  ) => {
    const data = contractInterface.encodeFunctionData('decreaseAllowance', [
      spender,
      subtractedValue,
    ])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const increaseAllowance = async (
    spender: string,
    addedValue: BigNumberish,
  ) => {
    const data = contractInterface.encodeFunctionData('increaseAllowance', [
      spender,
      addedValue,
    ])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const mint = async (to: string, amount: BigNumberish) => {
    const data = contractInterface.encodeFunctionData('mint', [to, amount])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const renounceOwnership = async () => {
    const data = contractInterface.encodeFunctionData('renounceOwnership')

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const transfer = async (spender: string, amount: BigNumberish) => {
    const data = contractInterface.encodeFunctionData('transfer', [
      spender,
      amount,
    ])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const transferFrom = async (
    from: string,
    to: string,
    amount: BigNumberish,
  ) => {
    const data = contractInterface.encodeFunctionData('transferFrom', [
      from,
      to,
      amount,
    ])

    return provider.value.signAndSendTx({
      to: address,
      data,
    })
  }

  const getAllowance = async (owner: string, spender: string) => {
    return contractInstance.value?.allowance(owner, spender)
  }

  const getBalanceOf = async (address: string) => {
    return contractInstance.value?.balanceOf(address)
  }

  const getDecimals = async () => {
    return contractInstance.value?.decimals()
  }

  const getName = async () => {
    return contractInstance.value?.name()
  }

  const getOwner = async () => {
    return contractInstance.value?.owner()
  }

  const getSymbol = async () => {
    return contractInstance.value?.symbol()
  }

  const getTotalSupply = async () => {
    return contractInstance.value?.totalSupply()
  }

  return {
    approve,
    decreaseAllowance,
    increaseAllowance,
    mint,
    renounceOwnership,
    transfer,
    transferFrom,
    getAllowance,
    getBalanceOf,
    getDecimals,
    getName,
    getOwner,
    getSymbol,
    getTotalSupply,
  }
}
