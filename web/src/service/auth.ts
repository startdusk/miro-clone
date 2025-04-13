
import { getUserData, redirectLogin } from "../hepler/auth"
import { useAuthStore } from "../store/authStore"

export async function loggout() {
  const authStore = useAuthStore()
    authStore.disconnectSse()
    const user = getUserData()
    if (!user) {
        redirectLogin()
        return
    }

    redirectLogin()
}

const authorizeUrlKey = 'authorize_url'

export async function loginWithGithub() {
  fetch('http://localhost:18888/auth/github/authorize').then(res => {
    res.json().then(data => {
        const { authorize_url } = data.data
        localStorage.setItem(authorizeUrlKey, authorize_url)
    })
  }).catch(err => {
      console.error(err)
  })
}

export function authenticate() {
  const authorize_url = localStorage.getItem(authorizeUrlKey) || ''
  window.location.href = authorize_url
  localStorage.removeItem(authorizeUrlKey)
}