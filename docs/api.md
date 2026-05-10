# API dokumentáció

A backend REST API a **http://localhost:8000** címen érhető el. Az interaktív Swagger UI dokumentáció a **http://localhost:8000/docs** oldalon található.

Az `Auth` oszlopban: **Igen** = érvényes JWT Bearer token szükséges, **Opcionális** = tokennel gazdagabb választ ad, **–** = publikusan elérhető.

---

## Hitelesítési endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| POST | `/register` | Új fiók regisztrálása | – |
| POST | `/login` | Bejelentkezés, JWT token visszaadása | – |

---

## Felhasználói endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| GET | `/users/me` | Saját profil lekérése | Igen |
| PUT | `/users/me` | Profil szerkesztése | Igen |
| DELETE | `/users/me` | Fiók törlése | Igen |
| GET | `/users/{user_id}` | Felhasználó adatai ID alapján | Opcionális |
| GET | `/users/by-username/{username}` | Felhasználó adatai felhasználónév alapján | Opcionális |
| GET | `/users/` | Összes felhasználó listája (lapozással) | – |
| POST | `/users/{user_id}/follow` | Követés / követés visszavonása | Igen |
| GET | `/users/{user_id}/followers` | Követők listája | – |
| GET | `/users/{user_id}/following` | Követett felhasználók listája | – |
| GET | `/users/{user_id}/posts` | Felhasználó bejegyzései | Opcionális |
| GET | `/users/{user_id}/likes` | Felhasználó által kedvelt bejegyzések | Opcionális |
| GET | `/users/{user_id}/replies` | Felhasználó hozzászólásai kontextussal | Opcionális |
| PUT | `/users/{user_id}/suspend` | Felfüggesztés be/ki kapcsolása | Igen (admin) |

---

## Bejegyzés endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| POST | `/posts/` | Új bejegyzés létrehozása | Igen |
| GET | `/posts/` | Összes bejegyzés listája (lapozással) | Opcionális |
| GET | `/posts/{post_id}` | Bejegyzés részletei | Opcionális |
| PUT | `/posts/{post_id}` | Bejegyzés szerkesztése | Igen (saját) |
| DELETE | `/posts/{post_id}` | Bejegyzés törlése | Igen (saját / admin) |
| POST | `/posts/{post_id}/like` | Like / like visszavonása | Igen |
| POST | `/posts/{post_id}/retweet` | Reposzt / reposzt visszavonása | Igen |
| GET | `/feed` | Személyre szabott feed | Igen |
| GET | `/explore` | Felfedező feed | Opcionális |

---

## Hozzászólás endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| POST | `/posts/{post_id}/comments/` | Hozzászólás létrehozása | Igen |
| GET | `/posts/{post_id}/comments/` | Bejegyzés hozzászólásainak listája | Opcionális |
| DELETE | `/comments/{comment_id}` | Hozzászólás törlése | Igen (saját / admin) |
| POST | `/comments/{comment_id}/like` | Hozzászólás like-olása / visszavonása | Igen |

---

## Adminisztrátori endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| GET | `/admin/suspended-users` | Felfüggesztett felhasználók listája | Igen (admin) |

---

## Értesítési endpointok

| Metódus | Útvonal | Leírás | Auth |
|---|---|---|---|
| GET | `/notifications/` | Értesítések listája | Igen |
| GET | `/notifications/unread-count` | Olvasatlan értesítések száma | Igen |
| PUT | `/notifications/{notification_id}/read` | Értesítés olvasottnak jelölése | Igen |

---

[Vissza a dokumentáció főoldalára](index.md)
