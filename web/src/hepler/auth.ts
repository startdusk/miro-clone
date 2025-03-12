import { jwtDecode } from "jwt-decode";

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
    return localStorage.getItem(tokenKey)
}

export const getUserData = () => {
    const token = localStorage.getItem(tokenKey)
    if (!token) {
        return null
    }
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
    return now < payload.exp
}

export const redirectLogin = () => {
    localStorage.clear()
    window.location.href = '/login'
}