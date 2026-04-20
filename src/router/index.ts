import Detail from '@/views/Detail.vue'
import Overview from '@/views/Overview.vue'
import { syncRouteSeo } from '@/utils/seo'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview',
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview,
    },
    {
      path: '/overview/:code',
      name: 'detail',
      component: Detail,
    },
  ],
})

// keep document metadata aligned with current client-side route
router.afterEach((to) => {
  syncRouteSeo(to)
})

export default router
