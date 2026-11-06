<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import {
  createTable,
  fetchAllTables,
  getStoredNickname,
  joinTable,
  setStoredNickname,
} from "../../services/tablesApi.js";

const router = useRouter();
const tables = ref([]);
const nickname = ref(getStoredNickname());
const loading = ref(false);
const error = ref("");
const showCreateForm = ref(false);
const creatingTable = ref(false);
const joiningTableId = ref(null);
const createForm = ref({
  name: "",
  minBet: 5,
  bigBet: 10,
  decisionTimeSec: 30,
  maxBuyIn: 1000,
});
let tablesInterval;
let loadingTables = false;

function tablePlayers(table) {
  return table.seats.filter(Boolean);
}

function hasNicknameAtTable(table) {
  const currentNickname = nickname.value.trim();
  return Boolean(currentNickname) && tablePlayers(table).some((seat) => seat.nickname === currentNickname);
}

function tableIsJoinable(table) {
  return table.status === "waiting"
    && tablePlayers(table).length < table.maxPlayers
    && !hasNicknameAtTable(table);
}

function statusLabel(status) {
  return {
    waiting: "Oczekuje",
    countdown: "Odliczanie",
    playing: "Gra trwa",
    closed: "Zamknięty",
  }[status] || status;
}

async function loadTables() {
  if (loadingTables) return;
  loadingTables = true;
  loading.value = tables.value.length === 0;
  error.value = "";
  try {
    tables.value = await fetchAllTables();
  } catch (err) {
    error.value = err.message || "Nie udało się pobrać listy stołów.";
  } finally {
    loading.value = false;
    loadingTables = false;
  }
}

function saveNickname() {
  const normalizedNickname = nickname.value.trim();
  if (!normalizedNickname) {
    error.value = "Podaj nick, aby utworzyć lub dołączyć do stołu.";
    return "";
  }
  nickname.value = normalizedNickname;
  setStoredNickname(normalizedNickname);
  return normalizedNickname;
}

async function submitCreateTable() {
  const currentNickname = saveNickname();
  if (!currentNickname) return;
  creatingTable.value = true;
  error.value = "";
  try {
    const table = await createTable({ ...createForm.value, nickname: currentNickname });
    await router.push(`/table/${table.id}`);
  } catch (err) {
    error.value = err.message || "Nie udało się utworzyć stołu.";
  } finally {
    creatingTable.value = false;
  }
}

async function joinSelectedTable(table) {
  const currentNickname = saveNickname();
  if (!currentNickname) return;
  joiningTableId.value = table.id;
  error.value = "";
  try {
    await joinTable(table.id, currentNickname);
    await router.push(`/table/${table.id}`);
  } catch (err) {
    error.value = err.message || "Nie udało się dołączyć do stołu.";
  } finally {
    joiningTableId.value = null;
  }
}

onMounted(() => {
  loadTables();
  // TODO(socket-io): replace polling with table state events when realtime transport is available.
  tablesInterval = window.setInterval(loadTables, 3000);
});

onUnmounted(() => {
  window.clearInterval(tablesInterval);
});
</script>

<template>
  <section>
    <div class="page-heading">
      <div>
        <h1>Lobby</h1>
        <p>Utwórz stół albo wybierz poczekalnię.</p>
      </div>
      <button type="button" :disabled="loading" @click="loadTables">Odśwież</button>
    </div>

    <div class="lobby-actions">
      <label>
        Nick
        <input v-model="nickname" type="text" maxlength="24" autocomplete="nickname" placeholder="Twój nick" />
      </label>
      <button type="button" @click="showCreateForm = !showCreateForm">
        {{ showCreateForm ? "Anuluj tworzenie" : "Utwórz stół" }}
      </button>
    </div>

    <form v-if="showCreateForm" class="create-table-form" @submit.prevent="submitCreateTable">
      <label>
        Nazwa stołu
        <input v-model="createForm.name" type="text" required />
      </label>
      <label>
        Mała stawka
        <input v-model.number="createForm.minBet" type="number" min="1" required />
      </label>
      <label>
        Duża stawka
        <input v-model.number="createForm.bigBet" type="number" min="1" required />
      </label>
      <label>
        Czas decyzji (s)
        <input v-model.number="createForm.decisionTimeSec" type="number" min="1" required />
      </label>
      <label>
        Maksymalny buy-in
        <input v-model.number="createForm.maxBuyIn" type="number" min="1" required />
      </label>
      <button type="submit" :disabled="creatingTable">
        {{ creatingTable ? "Tworzę…" : "Utwórz i otwórz poczekalnię" }}
      </button>
    </form>

    <p v-if="error" class="status-message" role="alert">{{ error }}</p>
    <p v-if="loading" class="status-message" role="status">Pobieram stoły…</p>
    <p v-else-if="tables.length === 0" class="status-message">Brak stołów.</p>

    <div v-else class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th scope="col">Nazwa stołu</th>
            <th scope="col">Stawki</th>
            <th scope="col">Gracze</th>
            <th scope="col">Status</th>
            <th scope="col">Akcje</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="table in tables" :key="table.id">
            <td>{{ table.name }}</td>
            <td>{{ table.minBet }} / {{ table.bigBet }}</td>
            <td>{{ tablePlayers(table).length }} / {{ table.maxPlayers }}</td>
            <td>{{ statusLabel(table.status) }}</td>
            <td class="table-actions">
              <button
                v-if="tableIsJoinable(table)"
                type="button"
                :disabled="joiningTableId === table.id"
                @click="joinSelectedTable(table)"
              >
                {{ joiningTableId === table.id ? "Dołączam…" : "Dołącz" }}
              </button>
              <RouterLink v-else-if="hasNicknameAtTable(table)" :to="`/table/${table.id}`">
                Wróć do stołu
              </RouterLink>
              <span v-else>{{ table.status === "waiting" ? "Brak miejsc" : "Niedostępny" }}</span>
              <RouterLink :to="`/table/${table.id}`">Podgląd</RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.lobby-actions, .create-table-form, .table-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: end; }
.lobby-actions { margin-bottom: 16px; }
.create-table-form { margin-bottom: 20px; padding: 16px; border: 1px solid #aaa; }
.create-table-form label, .lobby-actions label { display: grid; gap: 4px; }
.table-actions { align-items: center; }
</style>
