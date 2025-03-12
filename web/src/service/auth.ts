
import { getUserData, redirectLogin } from "../hepler/auth"
import { makeHttpReq } from "../hepler/http"
import { showError } from "../hepler/toastNotification"

interface LogoutInput {
  userId: number
}

interface LogoutResp {
}

export async function loggout() {
    const user = getUserData()
    if (!user) {
        redirectLogin()
        return
    }

    redirectLogin()
    return
    // try {
    //   await makeHttpReq<LogoutInput, LogoutResp>('/api/v1/user/logout', 'POST', {
    //       userId: user.id,
    //   })

    //   redirectLogin()
    // } catch (error) {
    //   showError((error as Error).message)
    // }
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