import type { BaseResponse } from '@/lib/axiosHelpers'
import { MessageBag } from '@/lib/validation'
import axios from 'axios'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export interface PasswordPolicyResponse extends BaseResponse {
  policy: {
    expiration: {
      enforced: boolean
      max_age: number
      min_age: number
    }
    strength: {
      complexity_check: boolean
      enforced: boolean
      history_length: number
      password_min_length: number
    }
  }
}

/**
 * Fetch the password policy from the server and validate the password against it.
 */
export function usePasswordPolicy() {
  const { t } = useI18n()

  /**
   * The error thrown from axios.
   */
  const error = ref<Error>()
  /**
   * The loading state of the password policy.
   */
  const loading = ref(true)
  /**
   * The minimum length of the password.
   */
  const minimumLength = ref(0)
  /**
   * If the strength of the password is enforced (min length, and history).
   */
  const strengthEnforced = ref(false)
  /**
   * If the complexity of the password is checked (uppercase, lowercase, numbers, special characters).
   */
  const complexityCheck = ref(false)
  /**
   * The minimum number of uppercase characters required in the password.
   *
   * Note: this field is just a reference, no data is fetched from the server.
   */
  const minimumUppercaseCharacters = ref(1)
  /**
   * The minimum number of lowercase characters required in the password.
   *
   * Note: this field is just a reference, no data is fetched from the server.
   */
  const minimumLowercaseCharacters = ref(1)
  /**
   * The minimum number of number characters required in the password.
   *
   * Note: this field is just a reference, no data is fetched from the server.
   */
  const minimumNumberCharacters = ref(1)
  /**
   * The minimum number of special characters required in the password.
   *
   * Note: this field is just a reference, no data is fetched from the server.
   */
  const minimumSpecialCharacters = ref(1)

  /**
   * Fetch the password policy from the server.
   */
  function fetchPasswordPolicy() {
    axios
      .post<PasswordPolicyResponse>('/api/get-password-policy')
      .then((response) => {
        minimumLength.value = response.data.policy.strength.password_min_length
        strengthEnforced.value = response.data.policy.strength.enforced
        complexityCheck.value = response.data.policy.strength.complexity_check
      })
      .catch((reason) => {
        error.value = reason
      })
      .finally(() => {
        loading.value = false
      })
  }

  /**
   * Validate the password against the password policy.
   *
   * @param password
   * @param confirmPassword
   * @param passwordLabel
   * @param confirmPasswordLabel
   *
   * @returns The message bag with the validation errors, field labels are set by the params.
   */
  function validatePassword(
    password: string,
    confirmPassword: string,
    passwordLabel = 'password',
    confirmPasswordLabel = 'confirm_password'
  ): MessageBag {
    const messageBag = new MessageBag()
    if (password != confirmPassword) {
      messageBag.append(confirmPasswordLabel, t('account_settings.passwords_mismatch'))
    }
    if (strengthEnforced.value) {
      if (password.length < minimumLength.value) {
        messageBag.append(passwordLabel, t('account_settings.password_length', minimumLength.value))
      }
      if (complexityCheck.value) {
        if (!password.match(`(?=(?:.*[A-Z]){${minimumUppercaseCharacters.value},})`)) {
          messageBag.append(
            passwordLabel,
            t('account_settings.password_uppercase', minimumUppercaseCharacters.value)
          )
        }
        if (!password.match(`(?=(?:.*[a-z]){${minimumLowercaseCharacters.value},})`)) {
          messageBag.append(
            passwordLabel,
            t('account_settings.password_lowercase', minimumLowercaseCharacters.value)
          )
        }
        if (!password.match(`(?=(?:.*[0-9]){${minimumNumberCharacters.value},})`)) {
          messageBag.append(
            passwordLabel,
            t('account_settings.password_number', minimumNumberCharacters.value)
          )
        }
        if (!password.match(`(?=(?:.*[^A-Za-z0-9]){${minimumSpecialCharacters.value},})`)) {
          messageBag.append(
            passwordLabel,
            t('account_settings.password_special', minimumSpecialCharacters.value)
          )
        }
      }
    }
    return messageBag
  }

  // Fetch the password policy on component creation
  fetchPasswordPolicy()

  return {
    // password policy
    minimumLength,
    strengthEnforced,
    complexityCheck,
    minimumNumberCharacters,
    minimumSpecialCharacters,
    minimumUppercaseCharacters,
    minimumLowercaseCharacters,
    // loading and error
    passwordPolicyError: error,
    passwordPolicyLoading: loading,
    // methods
    validatePassword
  }
}
