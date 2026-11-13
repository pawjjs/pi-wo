import { ref } from 'vue';


export function getToken(){
    return localStorage.getItem('token');
}

export const isLoggedIn = ref(getToken() !== null);

export function setLogin(token) {
    localStorage.setItem('token', token);
    isLoggedIn.value = true; 
}


export function setLogout() {
    localStorage.removeItem('token');
    isLoggedIn.value = false; 
}