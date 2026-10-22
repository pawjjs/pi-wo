import HomePage from "./views/stats/HomePage.vue";
import TestPage from "./views/stats/TestPage.vue";
import ErrorPage from "./ErrorPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
    {
        path: '/',
        component: HomePage,
        props: {message: "Hello World!"}
    },
    {
        path: '/testing',
        component: TestPage
    },
    {
        path: '/:pathMatch(.*)*',
        component: ErrorPage
    }
    ]

})

export default router;