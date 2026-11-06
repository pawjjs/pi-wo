# Tymczasowy adapter stołów

`tablesApi.js` zawiera tymczasowy mechanizm komunikacji z API stołów dla
trybu gościa i lokalnych testów lobby. Nick jest przechowywany w
`sessionStorage`, a operacje stołu przekazują go w żądaniu jako dane wejściowe.
Nie jest to mechanizm uwierzytelniania ani autoryzacji i nie może być traktowany
jako zabezpieczenie publicznego lobby.

## Jak działa przepływ

Frontend i backend uruchamiamy osobno. Vite działa domyślnie pod
`http://localhost:5173`, a Express pod `http://localhost:3000`.
Gdy widok Vue wysyła żądanie zaczynające się od `/api`, Vite przekazuje je
przez proxy do Expressa:

```text
Widok Vue
  -> funkcja z tablesApi.js
  -> fetch('/api/...')
  -> proxy Vite
  -> Express
  -> odpowiedź JSON
```

### Lobby

Po wejściu na `/lobby` użytkownik podaje tymczasowy nick. Nick trafia do
`sessionStorage`, dzięki czemu pozostaje dostępny po przejściu między lobby
a poczekalnią w tej samej karcie przeglądarki.

Lobby pobiera pełną listę przez `GET /api/v1/tables` i odświeża ją co 3 sekundy.
Można:

1. utworzyć stół przez `POST /api/v1/tables`;
2. dołączyć do stołu w stanie `waiting` przez `POST /api/v1/tables/:id/join`;
3. otworzyć podgląd pełnego, odliczanego albo trwającego stołu;
4. wrócić do stołu, przy którym zapisany nick już zajmuje miejsce.

Przycisk **Dołącz** najpierw wykonuje żądanie do backendu, a dopiero po
otrzymaniu odpowiedzi otwiera poczekalnię. **Podgląd** jest oddzielną akcją
i nie zajmuje miejsca przy stole.

### Poczekalnia

Trasa `/table/:id` korzysta z tego samego widoku dla gracza i obserwatora.
W stanie `waiting` widok odświeża dane co 2 sekundy. W stanie `countdown`
odświeżanie odbywa się co sekundę, aby pokazać aktualny licznik. Po przejściu
stołu do `closed` albo `playing` polling zostaje zatrzymany.

W poczekalni widać sześć miejsc, nicki graczy, hosta, własne miejsce
i gotowość. Gracz może:

- ustawić albo cofnąć gotowość;
- opuścić stół;
- rozpocząć odliczanie jako host, jeśli spełniony jest próg gotowości;
- wyrzucić innego gracza jako host.

Obserwator widzi stan stołu i może dołączyć tylko wtedy, gdy stół nadal ma
status `waiting`. Serwer pozostaje źródłem prawdy dla statusu, odliczania,
uprawnień hosta i dostępności miejsc. `serverTime` oraz `countdownEndsAt`
służą frontendowi wyłącznie do prezentacji licznika.

### Placeholder gry

Po statusie `playing` ten sam widok zatrzymuje polling poczekalni i pokazuje
placeholder sesji: identyfikator `gameSession`, czas rozpoczęcia oraz snapshot
graczy. Karty, rozdanie i akcje pokerowe nie są jeszcze podłączone.

## API i testy

Backend obsługuje:

- `GET /api/v1/tables` oraz `GET /api/v1/tables/:id`;
- `POST /api/v1/tables` i `POST /api/v1/tables/:id/join`;
- `PATCH /api/v1/tables/:id/ready`;
- `POST /api/v1/tables/:id/kick`;
- `POST /api/v1/tables/:id/leave`;
- `POST /api/v1/tables/:id/start`.

Dokumentacja API jest dostępna pod
`http://localhost:3000/api-docs`, a JSON pod
`http://localhost:3000/api-docs.json`.

Stan stołów i countdownu jest przechowywany w pamięci. Restart backendu
przywraca dane demonstracyjne i usuwa bieżące sesje. Testy uruchamiamy
w katalogu projektu:

```sh
npm test
```

## Właściciel migracji

Za zastąpienie tego mechanizmu docelową integracją odpowiada **Michał Małecki**,
gdy spełnione zostaną wszystkie poniższe warunki:

- [ ] System logowania działa w środowisku docelowym.
- [ ] Backend wydaje sesję lub token po poprawnym logowaniu.
- [ ] Frontend ma działający `authStore` albo równoważne źródło aktualnej sesji.
- [ ] Backend ma middleware `authenticateJWT` lub równoważną walidację sesji.
- [ ] `req.user` zawiera stabilny identyfikator użytkownika.
- [ ] Profil użytkownika ma ustalony nick wyświetlany przy stole.
- [ ] Endpointy stołów akceptują i sprawdzają tożsamość z sesji zamiast
  `nickname` przesyłanego przez klienta.
- [ ] Uprawnienia hosta i blokada po kicku działają na `userId`/`playerId`,
  a nie na samym nicku.
- [ ] Istnieją testy obejmujące wygasłą sesję, brak sesji, próbę podszycia się
  pod hosta oraz próbę ponownego wejścia po kicku.

## Zakres migracji

Po spełnieniu checklisty należy:

1. dodać nagłówek `Authorization` lub mechanizm sesyjny do wspólnego
   `request()` w `tablesApi.js`;
2. usunąć przekazywanie nicku jako źródła tożsamości w operacjach stołu;
3. pobierać nick z profilu zalogowanego użytkownika;
4. usunąć tymczasowe helpery `getStoredNickname()` i `setStoredNickname()`,
   gdy widoki przestaną ich używać;
5. zaktualizować kontrakt OpenAPI, dokumentację i testy backendu;
6. wykonać test regresji całego przepływu `Lobby -> Poczekalnia -> stół`.

Do czasu spełnienia checklisty obecny mechanizm pozostaje ograniczony do
localhosta, prywatnych testów i środowisk deweloperskich.
