<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router';
import { setLogin } from '../../services/authStore'

const router = useRouter();

const email = ref('')
const password = ref('')
const serverMessage = ref('')

async function handleLogin() {
    
    const response = await fetch("/api/v1/auth/login",
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email.value,
            password: password.value
        })

    })

    const data = await response.json()

    if(!response.ok){
        serverMessage.value = "Błąd:" + data.error
    }else{
        serverMessage.value = "Sukces: " + data.message

        setLogin(data.token);
        router.push('/profile')
        email.value = ''
        password.value = ''
    }
}


</script>


<template>
    <div>
        <h2>Logowanie do Pi wo Poker</h2>
        <form @submit.prevent = "handleLogin">
            <div>
                <label>Email: </label>
                <input v-model="email" type="text" placeholder = "Wpisz swój Email" required>
            </div>
            <div>
                <label>Hasło: </label>
                <input v-model="password" type="password" placeholder = "Wpisz Hasło" required>
            </div>
            <button type="submit">Zaloguj sie!</button>
            <p>Nie masz konta?
                <RouterLink to="/register">Zarejestruj sie tutaj</RouterLink>
            </p>
            <p style="font-weight: bold;">{{ serverMessage }}</p>

        </form>

    </div>
</template>