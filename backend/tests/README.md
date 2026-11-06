# Testy backendu

Testy lobby wykonują żądania HTTP do tymczasowego serwera Express. Nie
korzystają z bazy danych ani z dodatkowego frameworka.

## Uruchamianie

Z katalogu głównego `pi-wo`:

```sh
npm test
```

Polecenie w [`package.json`](../../package.json#L11) uruchamia wszystkie pliki
`backend/tests/*.test.js`.

## Aktualne testy

Obecne scenariusze znajdują się w
[`tables.test.js`](./tables.test.js):

| Test | Sprawdza |
|---|---|
| [OpenAPI](./tables.test.js#L67) | Schematy `Seat` i `GameSession`, brak `players` oraz siedem tras stołów. |
| [Utworzenie stołu](./tables.test.js#L78) | Host na miejscu 0, `hostPlayerId`, sześć miejsc i początkową gotowość. |
| [Walidacja i pełny stół](./tables.test.js#L86) | `400` dla złego ID, `409` dla duplikatu nicku i braku miejsca. |
| [All-ready](./tables.test.js#L102) | Countdown, `serverTime`, deadline, przejście do `playing` i snapshot graczy. |
| [Majority-ready](./tables.test.js#L119) | Start większości oraz zachowanie niegotowego gracza w snapshotcie. |
| [Start po deadline](./tables.test.js#L133) | `409` przed deadline oraz idempotentny start po deadline. |
| [Cofnięcie gotowości](./tables.test.js#L160) | Anulowanie countdownu i powrót do `waiting`. |
| [Kick](./tables.test.js#L170) | `403` dla nie-hosta, kick hosta i blokadę ponownego wejścia. |
| [Leave](./tables.test.js#L191) | Zwolnienie miejsca przez gracza, zamknięcie przez hosta i blokadę join. |

## Konwencja

Każdy test:

1. opisuje jedno zachowanie w nazwie, bez nazwy implementacji;
2. przygotowuje własne dane i nie zależy od kolejności innych testów;
3. sprawdza zarówno status HTTP, jak i istotne pola odpowiedzi;
4. obejmuje przypadek poprawny albo konkretny błąd — nie miesza niezwiązanych
   scenariuszy;
5. używa istniejących helperów HTTP, jeśli wykonuje ten sam rodzaj żądania.

Po zmianie testu należy zaktualizować jego krótki opis i link w tej tabeli.
Opis powinien mówić, jaki kontrakt lub zachowanie jest chronione, a nie
powtarzać implementacji testu.

## Izolacja

[`before`](./tables.test.js#L50) uruchamia serwer, [`beforeEach`](./tables.test.js#L56)
resetuje dane i skraca countdown, a [`after`](./tables.test.js#L62) zamyka
timery i serwer. Dzięki temu testy nie powinny zależeć od kolejności wykonania.

Testy używają nicków gościa, ponieważ logowanie i walidacja sesji nie są jeszcze
podłączone. Tymczasowy mechanizm opisano w
[`frontend/src/services/README.md`](../../frontend/src/services/README.md).
