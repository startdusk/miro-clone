import {  createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'login',
        component: () => import('../pages/auth/Login.vue')
    },
    {
        path: '/projects',
        name: 'projects',
        component: () => import('../pages/admin/Project.vue')
    },
    {
        path: '/project-boards',
        name: 'project-board',
        component: () => import('../pages/admin/ProjectBoard.vue')
    },
    { path: '/', redirect: { name: 'login' } },
    { path: '/*', redirect: { name: 'login' } }
] as const

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
