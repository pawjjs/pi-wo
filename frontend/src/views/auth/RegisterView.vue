<script setup>
import { ref } from 'vue'
const username = ref('')
const email = ref('')
const password = ref('')

const serverMessage = ref('')

async function handleRegister() 
{
    const response = await fetch("/api/v1/auth/register", 
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username.value,
            email: email.value,
            password: password.value
        })
    })
    
    const data = await response.json()

    if(!response.ok){
        serverMessage.value = "Błąd:" + data.error
    }else{
        serverMessage.value = "Sukces: " + data.message

        username.value = ''
        email.value = ''
        password.value = ''
    }
}
</script>


<template>
    <div>
        <h2>Rejestracja w Pi wo Poker</h2>
        <form @submit.prevent="handleRegister">
            <div>
                <label>Login: </label>
                <input v-model="username" type="text" placeholder="Wpisz swój nick" required>
            </div>

            <div>
                <label>E-mail: </label>
                <input v-model="email" type="email" placeholder="Wpisz E-mail" required>
            </div>

            <div>
                <label>Hasło: </label>
                <input v-model="password" type="password" placeholder="Min. 6 znaków" required>
            </div>

            <button type="submit">Zarejestruj się</button>
            <p>Masz już konto?
                <RouterLink to="/login">Zaloguj się tutaj</RouterLink>
            </p>
            <p style="font-weight: bold;">{{ serverMessage }}</p>
            

        </form>
    </div>

    
</template>