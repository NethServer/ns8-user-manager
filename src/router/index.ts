import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/BaseTemplate.vue'),
      beforeEnter: () => {
        const { previouslyLogged } = useAuth()
        if (!previouslyLogged.value) {
          return { name: 'login' }
        }
      },
      children: [
        {
          path: 'user/account',
          name: 'user_account',
          component: () => import('../views/HomeView.vue')
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      beforeEnter: () => {
        const { previouslyLogged } = useAuth()
        if (previouslyLogged.value) {
          return { name: 'user_account' }
        }
      }
    }
  ]
})

export default router
