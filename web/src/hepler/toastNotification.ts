
import { useToast } from 'vue-toast-notification'
import { redirectLogin } from './auth'

const toast = useToast()

export function showError(message: string) {
  if (message === 'Not authenticated' || message === 'Failed to fetch') {
    redirectLogin()
    return
  }
  toast.error(message, {
    position: 'bottom-right',
    duration: 4000,
    dismissible: true
  })
}

export function successMsg(message: string) {
  toast.success(message, {
    position: 'bottom-right',
    duration: 4000,
    dismissible: true
  })
}
