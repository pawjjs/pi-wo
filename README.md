# Pi Wo

Prototyp aplikacji pokerowej przygotowywany przez zespół Pi Wo.

## Zespół

- Michał Pączkowski
- Michał Małecki
- Miłosz Szymczuk
- Miłosz Pawlaczyk
- Maciej Cyuńczyk — lider

## Makieta

[Projekt w Figmie](https://www.figma.com/design/bL3Y0ZhbUd7fBwTjebnxHM/Untitled?node-id=0-1&m=dev&t=d0mDF31UALysgHkF-1)

## Uruchomienie

Wymagane są Node.js i zależności projektu. Zależności instalujemy w katalogu głównym:

```sh
npm install
```

Backend i frontend uruchamiamy w **dwóch osobnych terminalach**:

```sh
npm run start:server
```

```sh
npm run dev
```

Vite wyświetli adres frontendowej aplikacji, domyślnie `http://localhost:5173`. Express nasłuchuje na porcie `3000`.

## Jak działa pobieranie danych

Załóżmy, że chcemy wyświetlić na frontendzie dane stołu zapisane po stronie backendu. Frontend wysyła w tym celu żądanie HTTP do API. W naszym prototypie zapytania rozpoczynające się od `/api` są przekazywane przez proxy skonfigurowane w `frontend/vite.config.js` do Expressa na porcie `3000`. Express obsługuje już endpointy zwracające listę stołów i dane pojedynczego stołu.

Zapytania tworzy moduł `frontend/src/services/tablesApi.js`. Są w nim dwie funkcje:

- `fetchAvailableTables()` pobiera stoły, które mają przynajmniej jedno wolne miejsce. Wysyła żądanie `GET /api/tables?available=true`.
- `fetchTable(id)` pobiera dane stołu o podanym ID przez `GET /api/tables/:id`.

Obie funkcje korzystają ze wspólnej funkcji `request(path)`. Wywołuje ona `fetch` pod wskazaną ścieżką, prosi o odpowiedź w formacie JSON przez nagłówek `Accept`, sprawdza status odpowiedzi i odczytuje jej treść jako JSON. Jeśli połączenie lub odpowiedź się nie powiedzie, zgłasza błąd, który widok może pokazać użytkownikowi.

Kliknięcie **Lobby** w topbarze zmienia trasę na `/lobby`. Sam topbar tylko nawiguje; pobieranie danych wykonuje `LobbyView.vue`. Po wyświetleniu widoku jego hook `onMounted` uruchamia `loadTables()`. Ta funkcja wywołuje `fetchAvailableTables()`, zapisuje wynik do reaktywnej zmiennej `tables`, a Vue wyświetla elementy tej tablicy w tabeli HTML.

W pokoju działa to podobnie. Trasa `/table/:id` wyświetla `TableView.vue`, który odczytuje ID z adresu i przekazuje je do `fetchTable(id)`. Otrzymane dane trafiają do zmiennej `table` i są prezentowane w tabeli miejsc. Ten widok jest na razie podglądem — nie wysyła żądania dołączenia do gry.

W skrócie:

```text
Widok Vue → funkcja z tablesApi.js → fetch('/api/...') → proxy Vite → Express → JSON
```
