
import { useToast } from 'vue-toast-notification'

const toast = useToast()

export function showError(message: string) {
  toast.error(message, {
    position: 'top',
    duration: 4000,
    dismissible: true
  })
}

export function successMsg(message: string) {
  toast.success(message, {
    position: 'top',
    duration: 4000,
    dismissible: true
  })
}
