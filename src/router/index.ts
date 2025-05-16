import Detail from '@/views/Detail.vue'
import Overview from '@/views/Overview.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/overview', // redirect to overview by default
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview,
    },
    {
      path: '/overview/:code',
      // name: 'overview',
      component: Detail,
    },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   // component: () => import('../views/AboutView.vue'),
    // },
  ],
})

export default router
