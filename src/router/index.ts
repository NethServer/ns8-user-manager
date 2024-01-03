import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'not_found',
      redirect: { name: 'home' }
    },
    {
      path: '/',
      name: 'home',
      redirect: { name: 'user_account' },
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
          component: () => import('../views/UserAccount.vue')
        },
        {
          path: 'users',
          name: 'user_manager',
          component: () => import('../views/UserManager.vue'),
          beforeEnter: () => {
            const { scopes } = useAuth()
            if (scopes.value.length != 0) {
              return { name: 'user_account' }
            }
          }
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
