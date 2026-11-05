# Tymczasowy adapter stołów

`tablesApi.js` zawiera tymczasowy mechanizm komunikacji z API stołów dla
trybu gościa i lokalnych testów lobby. Nick jest przechowywany w
`sessionStorage`, a operacje stołu przekazują go w żądaniu jako dane wejściowe.
Nie jest to mechanizm uwierzytelniania ani autoryzacji i nie może być traktowany
jako zabezpieczenie publicznego lobby.

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
