<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { fetchTable } from "../../services/tablesApi.js";

const route = useRoute();
const table = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    table.value = await fetchTable(route.params.id);
  } catch (err) {
    error.value = err.message || "Nie udało się pobrać danych stołu.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section>
    <p><RouterLink to="/lobby">← Wróć do lobby</RouterLink></p>
    <p v-if="loading" class="status-message" role="status">Pobieram stan stołu…</p>
    <div v-else-if="error" class="status-message" role="alert">
      <h1>Nie można otworzyć pokoju</h1>
      <p>{{ error }}</p>
      <RouterLink to="/lobby">Wróć do lobby</RouterLink>
    </div>
    <template v-else-if="table">
      <h1>{{ table.name }}</h1>
      <p>Stół #{{ table.id }} · Stawki: {{ table.minBet }} / {{ table.bigBet }}</p>
      <div class="table-wrap">
        <table class="data-table seats-table">
          <thead>
            <tr>
              <th scope="col">Miejsce</th>
              <th scope="col">Gracz</th>
              <th scope="col">Stan</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="seat in 6" :key="seat">
              <td>{{ seat }}</td>
              <td>{{ table.players[seat - 1] || "—" }}</td>
              <td>{{ table.players[seat - 1] ? "Zajęte" : "Wolne" }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Podgląd pokoju</p>
    </template>
  </section>
</template>

<style scoped>
.seats-table { max-width: 700px; }
</style>
