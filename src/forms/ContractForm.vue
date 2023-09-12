<template>
  <form class="contract-form" @submit.prevent="submit">
    <div class="contract-form">
      <template v-if="store.isLoaded">
        <template v-if="store.isLoadFailed">
          <p>{{ $t('errors.err-not-loaded') }}</p>
        </template>
        <template v-else-if="store.provider?.isConnected">
          <div class="contract-form__description">
            <div class="contract-form__wallet-info">
              <h1 class="contract-form__description-header">
                {{ $t('contract-form.description-header') }}
              </h1>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-wallet-address') }}
                {{ store.provider?.address }}
              </p>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-chain-id') }}
                {{ store.provider?.chainId }}
              </p>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-chain-type') }}
                {{ store.provider?.chainType }}
              </p>
            </div>
            <div class="contract-form__contract-info">
              <h1 class="contract-form__description-header">
                {{
                  $t('contract-form.description-contract-description-header')
                }}
              </h1>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-contract-name') }}
                {{ store.contractName }}
              </p>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-contract-decimals') }}
                {{ store.contractDecimals }}
              </p>
              <p class="contract-form__description-text">
                {{ $t('contract-form.description-contract-symbol') }}
                {{ store.contractSymbol }}
              </p>
            </div>
          </div>
          <div class="contract-form__interaction">
            <div class="contract-form__interaction-replenishment">
              <h2 class="contract-form__interaction-header">
                {{ $t('contract-form.replenishment-header') }}
              </h2>
              <p class="contract-form__interaction-text">
                {{ $t('contract-form.replenishment-contract-balance') }}
                {{ store.getContractBalance }} {{ store.contractSymbol }}
              </p>
              <input-field
                class="contract-form__interaction-input"
                v-model="form.inputReplenishment"
                :label="$t('placeholders.form-inputReplenishment')"
                :error-message="getFieldErrorMessage('inputReplenishment')"
                :min-length="LENGTH_VALUE.MIN_LENGTH.tokens"
                @input="updateInputReplenishment"
              />
              <app-button
                class="contract-form__interaction-button"
                size="large"
                :text="$t('contract-form.replenishment-btn')"
                @click="store.getBalance"
              >
              </app-button>
            </div>

            <div class="contract-form__interaction-transfer">
              <h2 class="contract-form__interaction-header">
                {{ $t('contract-form.transfer-header') }}
              </h2>
              <p class="contract-form__interaction-text">
                {{ $t('contract-form.transfer-quantity') }}
              </p>
              <input-field
                class="contract-form__interaction-input"
                v-model="form.inputTransferTokens"
                :label="$t('placeholders.form-inputTransferTokens')"
                :min-length="LENGTH_VALUE.MIN_LENGTH.tokens"
                :error-message="getFieldErrorMessage('inputTransferTokens')"
                @input="updateTransferTokens"
              />
              <p class="contract-form__interaction-text">
                {{ $t('contract-form.transfer-address') }}
              </p>
              <input-field
                class="contract-form__interaction-input"
                v-model="form.inputTransferAddress"
                :label="$t('placeholders.form-inputTransferAddress')"
                :min-length="LENGTH_VALUE.MIN_LENGTH.address"
                :max-length="LENGTH_VALUE.MAX_LENGTH.address"
                :error-message="getFieldErrorMessage('inputTransferAddress')"
                @input="updateTransferAddress"
              />
              <app-button
                class="contract-form__interaction-button"
                size="large"
                :text="$t('contract-form.transfer-btn')"
                @click="store.transferTokens"
              >
              </app-button>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="contract-form__unconnected">
            <h1 class="contract-form__unconnected-header">
              {{ $t('contract-form.unconnected-header') }}
            </h1>
            <app-button
              class="contract-form__unconnected-button"
              size="large"
              :text="$t('contract-form.unconnected-btn')"
              modification="border-rounded"
              @click="store.provider?.connect"
            >
            </app-button>
          </div>
        </template>
      </template>
      <template v-else>
        <p>{{ $t('errors.err-loaded') }}</p>
      </template>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { AppButton } from '@/common'
import { InputField } from '@/fields'
import { LENGTH_VALUE } from '@/enums'
import { useForm, useFormValidation } from '@/composables'
import { reactive } from 'vue'
import {
  bus,
  BUS_EVENTS,
  ErrorHandler,
  numeric,
  minLength,
  required,
  maxLength,
} from '@/helpers'
import { useI18n } from 'vue-i18n'
import { useWeb3ProvidersStore } from '@/store'

const { t } = useI18n()

const store = useWeb3ProvidersStore()

const form = reactive({
  inputReplenishment: '',
  inputTransferTokens: '',
  inputTransferAddress: '0x8c39495181151FB3d6Ac8c0215bDb60C076585a9',
})

const updateInputReplenishment = () => {
  store.setInputReplenishment(form.inputReplenishment)
}

const updateTransferTokens = () => {
  store.setInputTransferTokens(form.inputTransferTokens)
}

const updateTransferAddress = () => {
  store.setInputTransferAddress(form.inputTransferAddress)
}

const { disableForm, enableForm } = useForm()
const { isFormValid, getFieldErrorMessage } = useFormValidation(form, {
  inputReplenishment: { required, numeric, minLength },
  inputTransferTokens: { required, numeric, minLength },
  inputTransferAddress: { required, minLength, maxLength },
})

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
store.init()
</script>

<style lang="scss" scoped>
.contract-form {
  background-color: var(--background-primary-dark);
  padding: toRem(20);
  border-radius: toRem(10);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
}

.contract-form__description {
  display: flex;
  justify-content: space-between;
  margin-bottom: toRem(20);
  gap: toRem(16);
}

.contract-form__description-header,
.contract-form__interaction-header,
.contract-form__unconnected-header {
  margin-bottom: toRem(10);
  color: var(--text-primary-main);
  padding-bottom: toRem(18);
  border-bottom: toRem(2) solid var(--border-primary-main);
}

.contract-form__description-text,
.contract-form__interaction-text {
  margin-bottom: toRem(2);
}

.contract-form__wallet-info,
.contract-form__contract-info {
  flex: 1;
  padding: toRem(18);
  background-color: var(--background-primary-light);
  border-radius: toRem(12);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
}

.contract-form__interaction {
  display: flex;
  flex-direction: column;
  gap: toRem(16);
}

.contract-form__interaction-replenishment,
.contract-form__interaction-transfer {
  background-color: var(--background-primary-light);
  padding: toRem(20);
  border-radius: toRem(10);
  box-shadow: 0 toRem(2) toRem(5) rgba(var(--black-rgb), 0.15);
  width: 100%;
}

.contract-form__interaction-input {
  width: 100%;
  padding: toRem(10) toRem(10) toRem(10) toRem(0);
  margin-bottom: toRem(10);
  border-radius: toRem(5);
}

.contract-form__interaction-button,
.contract-form__unconnected-button {
  background-color: var(--primary-main);
  color: var(--text-primary-invert-light);
  border: none;
  border-radius: toRem(12);
  padding: toRem(10) toRem(20);
  cursor: pointer;
  transition: var(--primary-main) 0.3s ease;
}

.contract-form__interaction-button:hover {
  background-color: var(--primary-dark);
}
</style>
