import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Auth
  { path: '/login',    component: () => import('@/views/auth/Login.vue'), meta: { guest: true } },
  { path: '/register', component: () => import('@/views/auth/Register.vue'), meta: { guest: true } },

  // User pages
  {
    path: '/',
    component: () => import('@/views/user/Layout.vue'),
    children: [
      { path: '',          component: () => import('@/views/user/Home.vue') },
      { path: 'games',     component: () => import('@/views/user/GameList.vue') },
      { path: 'games/:id', component: () => import('@/views/user/GameDetail.vue') },
      { path: 'cart',      component: () => import('@/views/user/Cart.vue'),    meta: { auth: true } },
      { path: 'orders',    component: () => import('@/views/user/Orders.vue'),  meta: { auth: true } },
      { path: 'profile',   component: () => import('@/views/user/Profile.vue'), meta: { auth: true } },
      { path: 'cdk',       component: () => import('@/views/user/MyCdk.vue'),   meta: { auth: true } },
    ]
  },

  // Merchant dashboard
  {
    path: '/merchant',
    component: () => import('@/views/merchant/Layout.vue'),
    meta: { auth: true, role: 'MERCHANT' },
    children: [
      { path: '',       component: () => import('@/views/merchant/Dashboard.vue') },
      { path: 'games',  component: () => import('@/views/merchant/GameManage.vue') },
      { path: 'orders', component: () => import('@/views/merchant/Orders.vue') },
      { path: 'cdk',    component: () => import('@/views/merchant/CdkManage.vue') },
    ]
  },

  // Admin dashboard
  {
    path: '/admin',
    component: () => import('@/views/admin/Layout.vue'),
    meta: { auth: true, role: 'ADMIN' },
    children: [
      { path: '',       component: () => import('@/views/admin/Dashboard.vue') },
      { path: 'users',  component: () => import('@/views/admin/Users.vue') },
      { path: 'games',  component: () => import('@/views/admin/Games.vue') },
      { path: 'orders', component: () => import('@/views/admin/Orders.vue') },
    ]
  },

  // 404 fallback - 回首页而不是崩溃
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  if (to.meta.guest && auth.isLoggedIn) {
    const role = auth.user?.role
    if (role === 'ADMIN') return next('/admin')
    if (role === 'MERCHANT') return next('/merchant')
    return next('/')
  }

  if (to.meta.auth && !auth.isLoggedIn) return next('/login')

  if (to.meta.role === 'ADMIN' && !auth.isAdmin) return next('/')
  if (to.meta.role === 'MERCHANT' && !auth.isMerchant) return next('/')

  next()
})

export default router