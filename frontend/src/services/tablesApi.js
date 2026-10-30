async function request(path) {
  let response;
  try {
    response = await fetch(path, { headers: { "Accept": "application/json" } });
  } catch {
    throw new Error("Nie udało się połączyć z serwerem. Spróbuj ponownie później.");
  }

  if (!response.ok) {
    if (response.status === 404) throw new Error("Nie znaleziono tego stołu.");
    throw new Error(`Serwer zwrócił błąd (${response.status}). Spróbuj ponownie.`);
  }
  return response.json();
}

export function fetchAvailableTables() {
  return request("/api/v1/tables?available=true");
}

export function fetchTable(id) {
  return request(`/api/v1/tables/${encodeURIComponent(id)}`);
}
