<script setup>
    import { ref, onMounted } from 'vue';
    import { getToken } from '../../services/authStore.js';
    
    const user = ref(null);

    async function getProfile() {
        const token = getToken();

        const response = await fetch('/api/v1/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })  
        
        const data = await response.json();
        
        user.value = data.user;
    }
    onMounted(() =>{
        getProfile();
    });

</script>


<template>
    <div>
        <h2>Mój Profil</h2>

        <div v-if="user">
            <p>Nick: {{ user.username }}</p>
            <p>Żetony: {{ user.chips }}</p>
        </div>

    </div>
</template>