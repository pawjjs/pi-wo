<script setup>
import { onMounted, ref } from "vue";
import { fetchAvailableTables } from "../../services/tablesApi.js";

const tables = ref([]);
const loading = ref(true);
const error = ref("");

async function loadTables() {
  loading.value = true;
  error.value = "";
  try {
    tables.value = await fetchAvailableTables();
  } catch (err) {
    error.value = err.message || "Nie udało się pobrać listy stołów.";
  } finally {
    loading.value = false;
  }
}

onMounted(loadTables);
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <h1>Lobby</h1>
        <p>Dostępne stoły</p>
      </div>
      <button type="button" :disabled="loading" @click="loadTables">Odśwież</button>
    </div>

    <p v-if="loading" class="status-message" role="status">Pobieram dostępne stoły…</p>
    <div v-else-if="error" class="status-message" role="alert">
      <p>{{ error }}</p>
      <button type="button" @click="loadTables">Spróbuj ponownie</button>
    </div>
    <p v-else-if="tables.length === 0" class="status-message">Brak wolnych stołów.</p>

    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Nazwa stołu</th>
            <th scope="col">Stawki</th>
            <th scope="col">Gracze</th>
            <th scope="col">Wolne miejsca</th>
            <th scope="col">Pokój</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="table in tables" :key="table.id">
            <td>{{ table.name }}</td>
            <td>{{ table.minBet }} / {{ table.bigBet }}</td>
            <td>{{ table.players.length }} / 6</td>
            <td>{{ Math.max(0, 6 - table.players.length) }}</td>
            <td><RouterLink :to="`/table/${table.id}`">Otwórz pokój</RouterLink></td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
