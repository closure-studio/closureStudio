<template>
  <dialog id="login" class="modal">
    <Docker />
    <div class="modal-box shadow-lg max-w-md rounded-lg py-8">
      <LoginForm
        v-if="modelType === AuthModelType.Login"
        :login-params="loginParams"
        :agree-terms="agreeTerms"
        :is-loading="isLoading"
        :on-login="loginBtn"
        @switch-register="modelType = AuthModelType.Register"
        @switch-forget-account="modelType = AuthModelType.ForgetAccount"
        @switch-forget-password="modelType = AuthModelType.ForgetPassword"
        @update:agree-terms="agreeTerms = $event"
      />

      <RegisterForm
        v-else-if="modelType === AuthModelType.Register"
        :reg-params="regParams"
        :agree-terms="agreeTerms"
        :is-loading="isLoading"
        :is-send-coding-is-loading="isSendCodingIsLoading"
        :on-send-code="sendCode"
        :on-register="regBtn"
        @switch-login="modelType = AuthModelType.Login"
        @update:agree-terms="agreeTerms = $event"
      />

      <ForgotPasswordForm
        v-else-if="modelType === AuthModelType.ForgetPassword"
        :forget-params="forgetParams"
        :is-loading="isLoading"
        :is-send-coding-is-loading="isSendCodingIsLoading"
        :on-send-code="sendCode"
        :on-reset="resetPasswordBtn"
        @switch-login="modelType = AuthModelType.Login"
      />

      <ForgotAccountForm
        v-else
        :find-account-params="findAccountParams"
        :find-account-resp-data="findAccountRespData"
        :is-find-account-loading="isFindAccountLoading"
        :on-find-account="handleFindAccountBtnOnClick"
        @switch-login="modelType = AuthModelType.Login"
      />
    </div>

    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
import Docker from "@/shared/components/toast/Docker.vue";
import LoginForm from "@/features/auth/components/LoginForm.vue";
import RegisterForm from "@/features/auth/components/RegisterForm.vue";
import ForgotPasswordForm from "@/features/auth/components/ForgotPasswordForm.vue";
import ForgotAccountForm from "@/features/auth/components/ForgotAccountForm.vue";
import { AuthModelType, useAuthForm } from "@/features/auth/composables/useAuthForm";
import { useAuthActions } from "@/features/auth/composables/useAuthActions";

const {
  modelType,
  loginParams,
  forgetParams,
  regParams,
  findAccountParams,
  agreeTerms,
  findAccountRespData,
} = useAuthForm();

const {
  isLoading,
  isSendCodingIsLoading,
  isFindAccountLoading,
  loginBtn,
  sendCode,
  regBtn,
  resetPasswordBtn,
  handleFindAccountBtnOnClick,
} = useAuthActions({
  modelType,
  loginParams,
  forgetParams,
  regParams,
  findAccountParams,
  agreeTerms,
  findAccountRespData,
});
</script>
