import { createRouter, createWebHistory } from 'vue-router'
import Search from './views/Search.vue'
import Add from './views/Add.vue'
import Admin from './views/Admin.vue'
import Comics from './views/Comics.vue'
import Content from './views/Content.vue'
import PageNotFound from './views/PageNotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
          path: '/',
          name: 'search',
          component: Search
      },
      {
          path: '/add',
          name: 'add',
          component: Add
      },
      {
          path: '/admin',
          name: 'admin',
          component: Admin
      },
      {
          path: '/comics/:id',
          name: 'comics',
          component: Comics
      },
      {
          path: '/comics/:id/:volume/:chapter',
          name: 'content',
          component: Content
      },
      {
          path: '/pageNotFound',
          name: 'pageNotFound',
          component: PageNotFound
      },
      // {
      //     path:'/:pathMatch(.*)',
      //     redirect:'/pageNotFound',
      // },
      {
          path:'/:catchAll(.*)',
          redirect:'/pageNotFound',
      },
  ]
})

export default router
