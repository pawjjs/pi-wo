import HomePage from "./views/stats/HomePage.vue";
import LobbyView from "./views/lobby/LobbyView.vue";
import TableView from "./views/game/TableView.vue";
import TestPage from "./views/stats/TestPage.vue";
import ErrorPage from "./ErrorPage.vue";
import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
    history: createWebHistory(),
    routes: [
    {
        path: '/',
        component: HomePage
    },
    {
        path: "/lobby",
        component: LobbyView
    },
    {
        path: "/table/:id(\\d+)",
        component: TableView
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
