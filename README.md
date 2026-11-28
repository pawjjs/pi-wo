# Pi Wo Whiteboard

Wspólna tablica do rysowania w czasie rzeczywistym.

## Zespół Pi Wo

* Michał Pączkowski
* Michał Małecki
* Miłosz Szymczuk
* Maciej Cyuńczyk
* Miłosz Pawlaczyk

## Funkcjonalności

- **Konta użytkowników:** rejestracja, logowanie i wylogowanie.
- **Lista tablic:** tworzenie nowych tablic, wyszukiwanie, sortowanie i dołączanie po ID lub linku.
- **Rysowanie:** ołówek, linia, prostokąt i okrąg, z wyborem koloru i grubości, gumka i cofanie zmian.
- **Czas rzeczywisty:** inni widzą rysowany kształt na żywo.
- **Czat:** osobny dla każdej tablicy, z historią wiadomości.
- **Role:** właściciel, edytor i tylko podgląd.
- **Trwałość:** rysunki i wiadomości są zapisywane w bazie i zostają po restarcie serwera.

## Technologie

| Warstwa | Technologia |
|---|---|
| Backend | Node.js, Express |
| Baza danych | SQLite (better-sqlite3) |
| Frontend | Vue 3 |
| Czas rzeczywisty | WebSocket |
| Uwierzytelnianie | bcrypt, JWT |

## Architektura

Aplikacja komunikuje się z serwerem na dwa sposoby:

- **REST (HTTP)** obsługuje operacje: logowania, listy tablic i historii czatu.
- **WebSocket** obsługuje zdarzenia, które serwer od razu rozsyła do innych osób na tablicy: rysowanie, czat i obecność.

| Warstwa | Zadanie |
|---|---|
| `routes/`, `sockets/` | wybierają funkcję do obsługi żądania lub wiadomości |
| `controllers/`, `sockets/handlers/` | odczytują dane, wołają serwis i odsyłają wynik |
| `services/` | logika biznesowa, walidacja i uprawnienia (wspólne dla REST i WebSocket) |
| `repositories/` | tylko zapytania SQL |

## Baza danych

**Użytkownicy (`users`)**
Konta osób korzystających z aplikacji: nazwa, e-mail i hasło (zapisywane tylko jako hash).

**Tablice (`boards`)**
Pokoje do rysowania: nazwa, właściciel, data utworzenia i ostatniej zmiany.

**Członkowie tablic (`board_members`)**
Kto należy do której tablicy i z jaką rolą: `owner` (właściciel), `editor` (może rysować) albo `viewer` (tylko podgląd).
Łączy użytkowników z tablicami w relacji wiele do wielu.

**Elementy (`elements`)**
Kształty narysowane na tablicy: typ (`freedraw`, `line`, `rectangle`, `ellipse`), autor i numer wersji.
Współrzędne, kolor i grubość są zapisane w polu `data` jako JSON.

**Wiadomości (`messages`)**
Czat tablicy: treść, autor, tablica i czas wysłania.

Relacje:

- użytkownik może należeć do wielu tablic, a tablica może mieć wielu członków;
- tablica zawiera wiele elementów i wiele wiadomości;

## Struktura repozytorium

```
pi-wo/
├─ backend/
│  └─ src/
│     ├─ server.js        start serwera (HTTP + WebSocket)
│     ├─ app.js           konfiguracja Express
│     ├─ routes/
│     ├─ controllers/
│     ├─ services/
│     └─ repositories/
└─ frontend/
   └─ src/
      ├─ main.js
      ├─ App.vue
      ├─ router/
      └─ views/
```
