const NICKNAME_STORAGE_KEY = "pi-wo.nickname";

async function request(path, { method = "GET", body } = {}) {
  let response;
  try {
    // TODO(auth): DODAĆ autoryzację użytkowników gdy moduł autentykacji zostanie dodany.
    response = await fetch(path, {
      method,
      headers: {
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error("Nie udało się połączyć z serwerem. Spróbuj ponownie później.");
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    if (!response.ok) {
      const error = new Error(`Serwer zwrócił błąd (${response.status}).`);
      error.status = response.status;
      throw error;
    }
  }

  if (!response.ok) {
    const error = new Error(payload?.error || `Serwer zwrócił błąd (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function requireNickname(nickname) {
  const normalizedNickname = typeof nickname === "string" ? nickname.trim() : "";
  if (!normalizedNickname) throw new Error("Nick jest wymagany.");
  return normalizedNickname;
}

export function fetchAvailableTables() {
  return request("/api/v1/tables?available=true");
}

export function fetchAllTables() {
  return request("/api/v1/tables");
}

export function fetchTable(id) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}`);
}

export function createTable({ name, minBet, bigBet, decisionTimeSec, maxBuyIn, nickname }) {
  return request("/api/v1/tables", {
    method: "POST",
    body: { name, minBet, bigBet, decisionTimeSec, maxBuyIn, nickname: requireNickname(nickname) },
  });
}

export function joinTable(id, nickname) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}/join`, {
    method: "POST",
    body: { nickname: requireNickname(nickname) },
  });
}

export function setReady(id, nickname, ready) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}/ready`, {
    method: "PATCH",
    body: { nickname: requireNickname(nickname), ready },
  });
}

export function kickPlayer(id, nickname, targetNickname) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}/kick`, {
    method: "POST",
    body: { nickname: requireNickname(nickname), targetNickname: requireNickname(targetNickname) },
  });
}

export function leaveTable(id, nickname) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}/leave`, {
    method: "POST",
    body: { nickname: requireNickname(nickname) },
  });
}

export function startTable(id, nickname) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}/start`, {
    method: "POST",
    body: { nickname: requireNickname(nickname) },
  });
}

export function getStoredNickname() {
  return sessionStorage.getItem(NICKNAME_STORAGE_KEY) || "";
}

export function setStoredNickname(nickname) {
  const normalizedNickname = typeof nickname === "string" ? nickname.trim() : "";
  if (!normalizedNickname) {
    sessionStorage.removeItem(NICKNAME_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(NICKNAME_STORAGE_KEY, normalizedNickname);
}
