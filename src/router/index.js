import { createRouter, createWebHistory } from 'vue-router'
import loginview from '../views/loginview.vue'  
import homeviwe from '../views/homeviwe.vue'  
import sinupview from '../views/sinupview.vue'  
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
   
    {
    name:"login",
    path:"/login",
    component:loginview,
    meta:{
        requiresAuth:false
    }
    },
    {
    name:"home",
    path:"/home",
    component:homeviwe,
    meta:{
        requiresAuth:true
    }
    },
    {
    name:"sinup",
    path:"/sinup",
    component:sinupview,
    meta:{
        requiresAuth:false
    }
    }    
  ],
})

export default router
