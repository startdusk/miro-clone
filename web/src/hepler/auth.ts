import { useRouter } from 'vue-router';
import { jwtDecode } from "jwt-decode";
import { redirectTo } from '../types';


export interface AuthToken extends User {
    iat: number;
    exp: number;
    nbf: number;
    iss: string;
    aud: string;
}

export interface User {
    id: number;
    username: string;
    email: string;
    github_id: string;
    created_at: string;
    updated_at: string;
}

const tokenKey = 'token'

export const storeUserToken = (token: string) => {
    localStorage.setItem(tokenKey, token)
}

export const getUserToken = () => {
    if (!hasLogined()) {
        return null
    }
    return localStorage.getItem(tokenKey)
}

export const getUserData = () => {
    if (!hasLogined()) {
        return null
    }
    const token = getUserToken()!
    const payload: AuthToken = jwtDecode(token)
    const user: User = {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        github_id: payload.github_id,
        created_at: payload.created_at,
        updated_at: payload.updated_at,
    }
    return user
}

export const hasLogined = () => {
    const token = localStorage.getItem(tokenKey)
    if (!token) {
        return false
    }
    const payload: AuthToken = jwtDecode(token)
    const now = Math.floor(Date.now() / 1000)
    const result = now < payload.exp
    if (!result) {
        redirectLogin()
    }
    return result
}

export const redirectLogin = () => {
    localStorage.clear()
    redirectTo('/login')
}