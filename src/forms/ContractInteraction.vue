<template>
  <form class="contract-form" @submit.prevent="submit">
    <div class="contract-interaction">
      <div class="contract-interaction__replenishment">
        <h2 class="contract-interaction__replenishment-header">
          {{ $t('contract-interaction.replenishment-header') }}
        </h2>
        <p class="contract-interaction__replenishment-text">
          {{ $t('contract-details.contract-balance-text') }}
          {{ getContractBalance }}
        </p>
        <input-field
          class="contract-interaction__replenishment-input"
          v-model="form.amount"
          :label="$t('placeholders.tokens-to-replenish-label')"
          :error-message="getFieldErrorMessage('amount')"
        />
        <app-button
          type="button"
          class="contract-interaction__replenishment-button"
          size="large"
          :text="$t('contract-interaction.replenish-balance-btn')"
          @click="getBalance"
        >
        </app-button>
      </div>

      <div class="contract-interaction__transfer">
        <h2 class="contract-interaction__transfer-header">
          {{ $t('contract-interaction.transfer-header') }}
        </h2>
        <p class="contract-interaction__transfer-text">
          {{ $t('contract-interaction.amount-of-tokens-text') }}
        </p>
        <input-field
          class="contract-interaction__transfer-input"
          v-model="form.tokens"
          :label="$t('placeholders.tokens-to-transfer-label')"
          :error-message="getFieldErrorMessage('tokens')"
        />
        <p class="contract-interaction__transfer-text">
          {{ $t('contract-interaction.recipient-address-text') }}
        </p>
        <input-field
          class="contract-interaction__transfer-input"
          v-model="form.address"
          :label="$t('placeholders.tokens-to-transfer-label')"
          :error-message="getFieldErrorMessage('address')"
        />
        <app-button
          type="button"
          class="contract-interaction__transfer-button"
          size="large"
          :text="$t('contract-interaction.transfer-tokens-btn')"
          @click="transferTokens"
        >
        </app-button>
      </div>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'
import { InputField } from '@/fields'
import { useI18n } from 'vue-i18n'
import { useForm, useFormValidation } from '@/composables'
import { useProviderInitStore } from '@/store'
import { BN } from '@distributedlab/tools'
import { reactive, computed, defineProps } from 'vue'
import { BigNumber } from 'ethers'
import {
  bus,
  BUS_EVENTS,
  ErrorHandler,
  numeric,
  required,
  correctAddress,
  formatBalance,
} from '@/helpers'
import { error } from 'console'

const props = defineProps<{
  contractBalance?: BigNumber
  contractInit?: object
}>()

const { t } = useI18n()

const form = reactive({
  amount: '55',
  tokens: '25',
  address: '0x8c39495181151FB3d6Ac8c0215bDb60C076585a9',
})

const { disableForm, enableForm } = useForm()

const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  amount: { required, numeric },
  tokens: { required, numeric },
  address: { required, correctAddress },
})

const submit = async () => {
  if (!isFormValid()) return

  disableForm()
  try {
    // await postSomeData('/some-endpoint', {
    //   login: form.login, password: form.password
    // })
    bus.emit(BUS_EVENTS.success, t('login-form.login-success-msg'))
  } catch (error) {
    ErrorHandler.process(error)
  }
  enableForm()
}

const storeProvider = useProviderInitStore()

const getContractBalance = computed(() => {
  const balance = props.contractBalance
  if (balance !== undefined) {
    return formatBalance(balance, 18)
  }
  return ''
})

const getBalance = async () => {
  try {
    if (!props.contractInit) throw new TypeError('ContractInit is undefined')

    const decimals = await props.contractInit.getDecimals()

    await props.contractInit.mint(
      storeProvider.provider?.address,
      BN.fromRaw(form.amount, decimals).value,
    )

    props.contractBalance = await props.contractInit.getBalanceOf(
      storeProvider.provider?.address,
    )
    bus.emit(BUS_EVENTS.success, t('notification.contract-message-replenish'))
  } catch (error) {
    ErrorHandler.process(error, 'Problem with transaction')
  }
}

const transferTokens = async () => {
  try {
    if (!props.contractInit) throw new TypeError('ContractInit is undefined')

    await props.contractInit.transfer(
      form.address,
      BN.fromRaw(form.tokens, 18).value,
    )

    bus.emit(BUS_EVENTS.success, t('notification.contract-message-tranfer'))
  } catch (error) {
    ErrorHandler.process(error, 'Problem with transferring tokens')
  }
}
</script>

<style lang="scss" scoped>
.contract-interaction {
  display: flex;
  flex-direction: column;
  gap: toRem(16);
}

.contract-interaction__replenishment,
.contract-interaction__transfer {
  background-color: var(--background-primary-light);
  padding: toRem(20);
  border-radius: toRem(10);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
  width: 100%;
}

.contract-interaction__replenishment-input,
.contract-interaction__transfer-input {
  width: 100%;
  padding: toRem(10) toRem(10) toRem(10) toRem(0);
  margin-bottom: toRem(10);
  border-radius: toRem(5);
}

.contract-interaction__replenishment-button,
.contract-interaction__transfer-button {
  background-color: var(--primary-main);
  color: var(--text-primary-invert-light);
  border: none;
  border-radius: toRem(12);
  padding: toRem(10) toRem(20);
  cursor: pointer;
  transition: var(--primary-main) 0.3s ease;
}

.contract-interaction__replenishment-button,
.contract-interaction__transfer-button:hover {
  background-color: var(--primary-dark);
}
</style>
