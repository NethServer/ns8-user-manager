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
      children: [
        {
          path: 'user/account',
          name: 'user_account',
          component: () => import('../views/UserAccount.vue'),
          beforeEnter: () => {
            const { previouslyLogged } = useAuth()
            if (!previouslyLogged.value) {
              return { name: 'login' }
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
