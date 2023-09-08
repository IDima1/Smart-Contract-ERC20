<template>
  <form class="contract-form" @submit.prevent="submit">
    <div class="contract-form">
      <template v-if="provider?.isConnected?.value">
        <div class="contract-form__description">
          <div class="contract-form__wallet-info">
            <h1 class="contract-form__description-header">{{$t('contract-form.description-header')}}</h1>
            <p class="contract-form__description-text">{{$t('contract-form.description-wallet-address')}} {{ provider?.address }}</p>
            <p class="contract-form__description-text">{{$t('contract-form.description-chain-id')}} {{ provider?.chainId }}</p>
            <p class="contract-form__description-text">{{$t('contract-form.description-chain-type')}} {{ provider?.chainType }}</p>
          </div>
          <div class="contract-form__contract-info">
            <h1 class="contract-form__description-header">{{$t('contract-form.description-contract-description-header')}}</h1>
            <p class="contract-form__description-text">{{$t('contract-form.description-contract-name')}} {{ contractName }}</p>
            <p class="contract-form__description-text">{{$t('contract-form.description-contract-decimals')}} {{ contractDecimals }}</p>
            <p class="contract-form__description-text">{{$t('contract-form.description-contract-symbol')}} {{ contractSymbol }}</p>
          </div>
        </div>
        <div class="contract-form__interaction">
          <div class="contract-form__interaction-replenishment">
            <h2 class="contract-form__interaction-header">{{$t('contract-form.replenishment-header')}}</h2>
            <p class="contract-form__interaction-text">{{$t('contract-form.replenishment-contract-balance')}} {{ getContractBalance }} {{ contractSymbol }}</p>
            <input-field
              class="contract-form__interaction-input"
              v-model="form.inputReplenishment"
              :label="$t('placeholders.form-inputReplenishment')"
              :errorMessage="getFieldErrorMessage('inputReplenishment')"
              :minLength="1"
            />
            <app-button
              class="contract-form__interaction-button"
              size="large"
              :text="$t('contract-form.replenishment-btn')"
              @click="getBalance">
            </app-button>
          </div>

          <div class="contract-form__interaction-transfer">
            <h2 class="contract-form__interaction-header">{{$t('contract-form.transfer-header')}}</h2>
            <p class="contract-form__interaction-text">{{$t('contract-form.transfer-quantity')}}</p>
            <input-field
              class="contract-form__interaction-input"
              v-model="form.inputTransferTokens"
              :label="$t('placeholders.form-inputTransferTokens')"
              :minLength="1"
              :errorMessage="getFieldErrorMessage('inputTransferTokens')"
            />
            <p class="contract-form__interaction-text">{{$t('contract-form.transfer-address')}}</p>
            <input-field
              class="contract-form__interaction-input"
              v-model="form.inputTransferAddress"
              :label="$t('placeholders.form-inputTransferAddress')"
              :minLength="42"
              :maxLength="42"
              :errorMessage="getFieldErrorMessage('inputTransferAddress')"
            />
            <app-button
              class="contract-form__interaction-button"
              size="large"
              :text="$t('contract-form.transfer-btn')"
              @click="transferTokens">
            </app-button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="contract-form__unconnected">
          <h1 class="contract-form__unconnected-header">{{ $t('contract-form.unconnected-header') }}</h1>
          <app-button
            class="contract-form__unconnected-button"
            size="large"
            :text="$t('contract-form.unconnected-btn')"
            modification="border-rounded"
            @click="provider?.connect">
          </app-button>
        </div>
      </template>
    </div>
  </form>
</template>

<script lang="ts" setup>
import AppButton from '@/common/AppButton.vue'
import InputField from '@/fields/InputField.vue'
import { useProvider, useForm, useFormValidation } from '@/composables'
import { MetamaskProvider, ProviderDetector } from '@distributedlab/w3p'
import { computed, ref, onMounted, reactive, Ref, Raw } from 'vue'
import { bus, BUS_EVENTS, ErrorHandler, numeric, minLength, required, maxLength } from '@/helpers'
import { useErc20Contract } from '@/composables/contracts'
import { BigNumber } from 'ethers'
import { BN } from '@distributedlab/tools'
import { useI18n } from 'vue-i18n'
import { providers } from 'ethers'
import { Erc20__factory } from '@/types/contracts'

const { t } = useI18n()

const provider = useProvider()

const providerDetector = computed(() => new ProviderDetector())

const contractAddress = '0xd987988D019BE0Ffe28f4fc1E04186eD78828e13'

const contractBalance = ref<BigNumber>()

const contractDecimals = ref<Number>()

const contractSymbol = ref<String>()

const contractName = ref<String>()

const { mint, getBalanceOf, getDecimals, getSymbol, getName,  transfer } = useErc20Contract(contractAddress, provider?.rawProvider)

const form = reactive({
  inputReplenishment: '',
  inputTransferTokens: '',
  inputTransferAddress: '0x8c39495181151FB3d6Ac8c0215bDb60C076585a9',
})

const { disableForm, enableForm } = useForm();
const { isFormValid, getFieldErrorMessage} = useFormValidation(
  form,
  {
    inputReplenishment: { required, numeric, minLength },
    inputTransferTokens: { required, numeric, minLength },
    inputTransferAddress: { required, minLength, maxLength },
  }
);

const submit = async () => {
  if (!isFormValid()) return

  disableForm()

  try {
    bus.emit(BUS_EVENTS.success, t('login-form.login-success-msg'))
  } catch (error) {
    ErrorHandler.process(error)
  }

  enableForm()
}

const getContractBalance = computed(() => {
  const balance = contractBalance.value

  if (balance) {
    const roundedBalance = Math.round(parseFloat(BN.fromBigInt(balance.toString(), 18).toString()))
    return roundedBalance.toString()
  } else {
    return 'Balance is undefined'
  }
})

onMounted(async () => {
  try {
    await providerDetector.value.init()

    await provider.init(MetamaskProvider, {
      providerDetector: providerDetector.value,
      listeners: {
        onConnect: () => {
          console.log('Connected to MetaMask');
        },
        onDisconnect: () => {
          console.log('Disconnected from MetaMask');
        },
        onAccountChanged: () => {
          console.log('Account changed');
        },
        onChainChanged: () => {
          console.log('Chain changed');
        },
      },
    })

    if (!provider?.address.value) {
      return
    }

    contractBalance.value = await getBalanceOf(provider?.address.value)
    contractDecimals.value = await getDecimals()
    contractSymbol.value = await getSymbol()
    contractName.value = await getName()
  } catch (error) {
    ErrorHandler.process(error, 'Problem with initialization')
  }
})

const getBalance = async () => {
  try {
    if (!provider.address?.value) {
      throw new TypeError('Provider is not defined')
    }

    const encodedTx = await mint(
      provider.address?.value,
      BN.fromRaw(form.inputReplenishment, 18).value,
    )

    await provider.signAndSendTx({
      to: contractAddress,
      data: encodedTx,
    })

    contractBalance.value = await getBalanceOf(provider.address?.value)
    bus.emit(BUS_EVENTS.success, 'The contract account was successfully replenished')
  } catch (error) {
    ErrorHandler.process(error, 'Problem with transaction')
  }
}

const transferTokens = async () => {
  try {
    if (!provider.address?.value) {
      throw new TypeError('Provider is not defined')
    }

    const inputAmount = BN.fromRaw(form.inputTransferTokens, 18).value

    const contract = Erc20__factory.connect(
      contractAddress,
      new providers.Web3Provider(
        provider?.rawProvider.value as providers.ExternalProvider,
      ),
    )

    const data = contract.interface.encodeFunctionData('transfer', [form.inputTransferAddress, inputAmount])

    return provider.signAndSendTx({
      to: contractAddress,
      data
    })

  } catch (error) {
    ErrorHandler.process(error, 'Problem with transferring tokens');
  }
}

</script>

<style lang="scss" scoped>

.contract-form {
  background-color: var(--background-primary-dark);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(var(--black-rgb), 0.15);
}

.contract-form__description {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.contract-form__description-header,
.contract-form__interaction-header,
.contract-form__unconnected-header  {
  margin-bottom: 10px;
  color: var(--text-primary-main);
  padding-bottom: toRem(18);
  border-bottom: 2px solid var(--border-primary-main)
}

.contract-form__description-text,
.contract-form__interaction-text{
  margin-bottom: 2px;
}

.contract-form__wallet-info,
.contract-form__contract-info {
  flex: 1;
  padding: toRem(18);
  background-color: var(--background-primary-light);
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(var(--black-rgb), 0.15);
}

.contract-form__interaction {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 16px;
}

.contract-form__interaction-replenishment,
.contract-form__interaction-transfer {
  background-color: var(--background-primary-light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(var(--black-rgb), 0.15);
  width: 100%;
}

.contract-form__interaction-input {
  width: 100%;
  padding: 10px 10px 10px 0px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.contract-form__interaction-button,
.contract-form__unconnected-button {
  background-color: var(--primary-main);
  color: var(--text-primary-invert-light);
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  cursor: pointer;
  transition: var(--primary-main) 0.3s ease;
}

.contract-form__interaction-button:hover {
  background-color: var(--primary-dark);
}
</style>
