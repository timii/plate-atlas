import Detail from '@/views/Detail.vue'
import Overview from '@/views/Overview.vue'
import { syncRouteSeo } from '@/utils/seo'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // reset route changes to top so detail pages do not inherit overview scroll position
    if (savedPosition) {
      return savedPosition
    }

    return { top: 0 }
  },
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
