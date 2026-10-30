# Moduły OpenAPI i Swagger
 
Dokumentację API trzymamy w modułach. Każdy moduł opisuje jedną fragment aplikacji, a `index.js` zbiera je wszystkie w jeden dokument, który potem widać w Swagger UI.
 
Swagger to u nas tylko podgląd i miejsce do wywoływania requestów, więc **nie dodajemy** endpointów klikając w jego interfejsie.
 
## Gdzie coś dopisać?
 
| Co zmieniasz | Gdzie |
| --- | --- |
| Wspólny model danych albo schemat błędu | `components.js` |
| Endpointy auth | `auth.openapi.js` |
| Endpointy stołów i lobby | `tables.openapi.js` |
| Zupełnie nowy obszar | nowy plik, np. `users.openapi.js` |
 
Jeśli zrobiłeś nowy plik, pamiętaj, żeby podpiąć go w `index.js`:
 
```js
import { usersPaths } from "./users.openapi.js";
 
// ...
paths: {
    ...authPaths,
    ...tablesPaths,
    ...usersPaths,
},
```
 
## Zasada numer jeden
 
Dokumentacja ma opisywać to, co endpoint **naprawdę** robi. Zanim cokolwiek napiszesz, zerknij do routingu i kontrolera i sprawdź:
 
- jaka jest metoda HTTP,
- jaka jest ścieżka,
- jakie są parametry,
- jakie body przyjmuje endpoint,
- jakie kody odpowiedzi zwraca.
Jeśli czegoś jeszcze nie ma w kodzie, nie wpisujemy tego do kontraktu.
 
## Co powinno być w opisie endpointu
 
1. **Ścieżka** – dokładnie taka jak w API, razem z prefiksem `/api/v1`.
2. **Metoda HTTP** – `get`, `post`, `patch`, `put` albo `delete`.
3. **`tags`** – obszar funkcjonalny, np. `Auth` albo `Tables`.
4. **`summary`** – krótka nazwa czynności, najlepiej po polsku.
5. **`description`** – tylko jeśli endpoint wymaga dodatkowego wyjaśnienia. Jak wszystko jest jasne z `summary`, odpuść.
6. **Parametry** – wszystkie z `path`, `query` i `header`.
7. **`requestBody`** – jeśli endpoint przyjmuje JSON albo inne dane wejściowe.
8. **`responses`** – każdy istotny kod odpowiedzi z opisem i schematem JSON (jeśli odpowiedź ma ustalony format).
### Przykład
 
```js
export const usersPaths = {
    "/api/v1/users/{id}": {
        get: {
            tags: ["Users"],
            summary: "Pobierz użytkownika",
            description: "Zwraca publiczne dane użytkownika o podanym identyfikatorze.",
            parameters: [
                {
                    in: "path",
                    name: "id",
                    required: true,
                    schema: { type: "integer", minimum: 1 },
                    description: "Identyfikator użytkownika",
                },
            ],
            responses: {
                200: {
                    description: "Dane użytkownika",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/User" },
                        },
                    },
                },
                404: {
                    description: "Nie znaleziono użytkownika",
                    content: {
                        "application/json": {
                            schema: { $ref: "#/components/schemas/ErrorResponse" },
                        },
                    },
                },
            },
        },
    },
};
```
 
## Schematy danych
 
Jeśli ten sam kształt requestu albo odpowiedzi wraca w kilku miejscach, zdefiniuj go raz w `components.js` i podlinkuj przez `$ref`:
 
```js
schema: { $ref: "#/components/schemas/User" }
```
 
Dobry wspólny schemat zawiera:
 
- typ obiektu,
- listę wymaganych właściwości,
- typ każdej właściwości,
- ograniczenia, np. `minimum`, `maximum`, `minLength`,
- formaty, np. `email` albo `date-time`,
- przykładowe wartości, jeśli ułatwiają zrozumienie danych.
Nie kopiuj dużych schematów na zapas. Jeśli coś różni się tylko w jednym miejscu, użyj `allOf` albo zrób osobny, jasno nazwany schemat.
 
## Kilka dobrych nawyków
 
- Opisy pisz po polsku, ale nazwy ścieżek, właściwości JSON, parametrów i schematów zostaw tak, jak są w kodzie.
- Ścieżki zawsze z pełnym prefiksem `/api/v1`.
- Dokumentuj tylko statusy, które naprawdę zwraca kontroler.
- Dla błędów w formacie `{ error }` używaj wspólnego `ErrorResponse`.
- W przykładach nie wrzucaj sekretów, prawdziwych haseł ani danych osobowych.
- Planowanych endpointów bez implementacji do kontraktu nie dodajemy.
