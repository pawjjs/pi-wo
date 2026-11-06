<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  fetchTable,
  getStoredNickname,
  joinTable,
  kickPlayer,
  leaveTable,
  setReady,
  startTable,
} from "../../services/tablesApi.js";

const route = useRoute();
const router = useRouter();
const table = ref(null);
const loading = ref(true);
const error = ref("");
const actionError = ref("");
const nickname = ref(getStoredNickname());
const actionInProgress = ref(false);
const countdownNow = ref(Date.now());
let refreshTimer;
let countdownTimer;
let requestInProgress = false;

const myNickname = computed(() => nickname.value.trim());
const mySeat = computed(() => table.value?.seats?.find((seat) => seat?.nickname === myNickname.value) ?? null);
const isHost = computed(() => myNickname.value && myNickname.value === table.value?.hostNickname);
const isSpectator = computed(() => Boolean(table.value) && !mySeat.value);
const countdownSeconds = computed(() => {
  if (!table.value?.countdownEndsAt) return 0;
  return Math.max(0, Math.ceil((Date.parse(table.value.countdownEndsAt) - countdownNow.value) / 1000));
});

function pollingDelay(status) {
  if (status === "countdown") return 1000;
  if (status === "waiting") return 2000;
  return 0;
}

function stopRefresh() {
  if (refreshTimer) window.clearTimeout(refreshTimer);
  refreshTimer = undefined;
}

function scheduleRefresh() {
  stopRefresh();
  const delay = pollingDelay(table.value?.status);
  if (delay) refreshTimer = window.setTimeout(loadTable, delay);
}

async function loadTable() {
  if (requestInProgress) return;
  requestInProgress = true;
  error.value = "";
  try {
    table.value = await fetchTable(route.params.id);
    scheduleRefresh();
  } catch (err) {
    error.value = err.message || "Nie udało się pobrać danych stołu.";
    stopRefresh();
  } finally {
    loading.value = false;
    requestInProgress = false;
  }
}

async function runAction(action) {
  if (actionInProgress.value || !myNickname.value) {
    if (!myNickname.value) actionError.value = "Podaj nick w lobby przed wykonaniem tej operacji.";
    return;
  }
  actionInProgress.value = true;
  actionError.value = "";
  try {
    table.value = await action();
    scheduleRefresh();
  } catch (err) {
    actionError.value = err.message || "Nie udało się wykonać operacji.";
  } finally {
    actionInProgress.value = false;
  }
}

function toggleReady() {
  return runAction(() => setReady(route.params.id, myNickname.value, !mySeat.value.ready));
}

function leave() {
  return runAction(async () => {
    const result = await leaveTable(route.params.id, myNickname.value);
    await router.push("/lobby");
    return result;
  });
}

function join() {
  return runAction(() => joinTable(route.params.id, myNickname.value));
}

function kick(targetNickname) {
  return runAction(() => kickPlayer(route.params.id, myNickname.value, targetNickname));
}

function start() {
  return runAction(() => startTable(route.params.id, myNickname.value));
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString("pl-PL") : "—";
}

watch(() => route.params.id, () => {
  loading.value = true;
  table.value = null;
  loadTable();
});

watch(() => table.value?.status, (status) => {
  if (status === "countdown") {
    if (!countdownTimer) countdownTimer = window.setInterval(() => {
      countdownNow.value = Date.now();
    }, 250);
  } else if (countdownTimer) {
    window.clearInterval(countdownTimer);
    countdownTimer = undefined;
  }
});

onMounted(loadTable);

onUnmounted(() => {
  stopRefresh();
  if (countdownTimer) window.clearInterval(countdownTimer);
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

      <div v-if="table.status === 'closed'" class="status-message" role="status">
        <h2>Poczekalnia zamknięta</h2>
        <p>Host zamknął ten stół.</p>
        <RouterLink to="/lobby">Wróć do lobby</RouterLink>
      </div>

      <div v-else-if="table.status === 'playing'" class="game-placeholder">
        <h2>Gra rozpoczęta</h2>
        <p>To jest placeholder stołu gry. Właściwe komponenty zostaną podłączone w kolejnym etapie.</p>
        <dl>
          <dt>Sesja</dt><dd>{{ table.gameSession?.sessionId || "—" }}</dd>
          <dt>Start</dt><dd>{{ formatDate(table.gameSession?.startedAt) }}</dd>
          <dt>Skład</dt><dd>{{ table.gameSession?.players?.map((player) => player.nickname).join(", ") || "—" }}</dd>
        </dl>
        <button type="button" @click="leave">Opuść stół / Wróć do lobby</button>
      </div>

      <template v-else>
        <p>Status: <strong>{{ table.status }}</strong></p>
        <p v-if="table.status === 'countdown'" class="countdown" role="timer">
          Start za {{ countdownSeconds }} s ({{ table.countdownMode }})
        </p>
        <p v-if="isSpectator" class="status-message">Oglądasz stół jako podgląd.</p>
        <p v-if="actionError" class="status-message" role="alert">{{ actionError }}</p>

        <div class="table-wrap">
          <table class="data-table seats-table">
            <thead>
              <tr><th>Miejsce</th><th>Gracz</th><th>Stan</th><th>Akcja</th></tr>
            </thead>
            <tbody>
              <tr v-for="(seat, index) in table.seats" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ seat?.nickname || "—" }} <strong v-if="seat?.nickname === table.hostNickname">HOST</strong><strong v-if="seat?.nickname === myNickname">TY</strong></td>
                <td>{{ seat ? (seat.ready ? "Gotowy" : "Nie gotowy") : "Wolne" }}</td>
                <td>
                  <button v-if="isHost && seat && seat.nickname !== myNickname" type="button" :disabled="actionInProgress" @click="kick(seat.nickname)">Wyrzuć</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="room-actions">
          <button v-if="mySeat" type="button" :disabled="actionInProgress || table.status === 'countdown'" @click="toggleReady">
            {{ mySeat.ready ? "Cofnij gotowość" : "Gotowy" }}
          </button>
          <button v-if="mySeat" type="button" :disabled="actionInProgress" @click="leave">Opuść stół</button>
          <button v-if="isSpectator && table.status === 'waiting'" type="button" :disabled="actionInProgress" @click="join">Dołącz do stołu</button>
          <button v-if="isHost && table.status === 'countdown'" type="button" :disabled="actionInProgress" @click="start">Rozpocznij po odliczaniu</button>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
.seats-table { max-width: 900px; }
.room-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.countdown { font-size: 1.25rem; font-weight: 700; }
.game-placeholder { border: 2px solid #555; padding: 20px; max-width: 700px; }
.game-placeholder dl { display: grid; grid-template-columns: max-content 1fr; gap: 8px 16px; }
.game-placeholder dt { font-weight: 700; }
</style>
