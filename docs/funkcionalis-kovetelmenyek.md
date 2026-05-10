# Funkcionális követelmények

Az alábbiakban felsoroljuk a projektben megvalósított funkcionális követelményeket, funkcionális területek szerint csoportosítva.

## F1–F7 Felhasználókezelés

| # | Funkció | Megvalósítás |
|---|---|---|
| F1 | Regisztráció | `POST /register` – felhasználónév, e-mail, jelszó megadásával |
| F2 | Bejelentkezés | `POST /login` – JWT token kiadása sikeres hitelesítés esetén |
| F3 | Kijelentkezés | Token törlése localStorage-ból, átirányítás a bejelentkező oldalra |
| F4 | Profil megtekintése | `GET /users/{user_id}` és `GET /users/by-username/{username}` |
| F5 | Profil szerkesztése | `PUT /users/me` – megjelenítési név, profilkép, borítókép, felhasználónév módosítása |
| F6 | Saját fiók törlése | `DELETE /users/me` – felhasználó és összes kapcsolódó adata törlésre kerül |
| F7 | Jelszóvédelem | bcrypt hash-eléssel tárolt jelszavak, 72 karakteres korlát kezelése |

## F8–F11 Követés (Social Graph)

| # | Funkció | Megvalósítás |
|---|---|---|
| F8 | Felhasználó követése / követés visszavonása | `POST /users/{user_id}/follow` – toggle logika |
| F9 | Követők listájának megtekintése | `GET /users/{user_id}/followers` |
| F10 | Követett felhasználók listájának megtekintése | `GET /users/{user_id}/following` |
| F11 | Követési szám megjelenítése | Profiloldalon follower_count és following_count |

## F12–F18 Bejegyzések (Posztok)

| # | Funkció | Megvalósítás |
|---|---|---|
| F12 | Bejegyzés létrehozása | `POST /posts/` – a sidebar modális ablakából |
| F13 | Bejegyzés szerkesztése | `PUT /posts/{post_id}` – csak saját bejegyzés; GUI: hárompontos menü → „Edit post" modális ablak, tartalom előtöltve, mentés csak ha megváltozott |
| F14 | Bejegyzés törlése | `DELETE /posts/{post_id}` – saját bejegyzés vagy admin |
| F15 | Bejegyzés részletes nézete | `GET /posts/{post_id}` – kommentekkel együtt |
| F16 | Személyre szabott feed | `GET /feed` – követett felhasználók + saját + admin posztjai |
| F17 | Felfedező feed | `GET /explore` – nem követett felhasználók nyilvános posztjai |
| F18 | Felhasználó bejegyzéseinek listája | `GET /users/{user_id}/posts` |

## F19–F25 Interakciók

| # | Funkció | Megvalósítás |
|---|---|---|
| F19 | Bejegyzés like-olása / like visszavonása | `POST /posts/{post_id}/like` – toggle, like szám frissítése |
| F20 | Hozzászólás írása | `POST /posts/{post_id}/comments/` |
| F21 | Hozzászólás törlése | `DELETE /comments/{comment_id}` – saját vagy admin; GUI: hárompontos menü a hozzászóláson, megerősítő dialógus után törlés |
| F22 | Hozzászólás like-olása | `POST /comments/{comment_id}/like` – toggle |
| F23 | Reposzt (megosztás) | `POST /posts/{post_id}/retweet` – toggle, eredeti poszt hivatkozással |
| F24 | Saját liked bejegyzések listája | `GET /users/{user_id}/likes` |
| F25 | Saját hozzászólások listája | `GET /users/{user_id}/replies` – kontextussal együtt |

## F26–F29 Értesítések

| # | Funkció | Megvalósítás |
|---|---|---|
| F26 | Értesítések listájának megtekintése | `GET /notifications/` – időrendben csökkenő sorrendben |
| F27 | Olvasatlan értesítések száma | `GET /notifications/unread-count` – sidebaron megjelenítve |
| F28 | Értesítés olvasottnak jelölése | `PUT /notifications/{notification_id}/read` |
| F29 | Értesítés típusok | `new_post` (követett felhasználó posztolt), `repost` (követett felhasználó reposztolt), `follow` (valaki követni kezdett) |

## F30–F34 Adminisztrátori funkciók

| # | Funkció | Megvalósítás |
|---|---|---|
| F30 | Felhasználó felfüggesztése | `PUT /users/{user_id}/suspend` – csak admin szerepkör |
| F31 | Felfüggesztett felhasználók listája | `GET /admin/suspended-users` – csak admin |
| F32 | Felfüggesztés feloldása | Ugyanaz az endpoint (toggle logika) |
| F33 | Admin tartalom-moderáció | Admin bármely bejegyzést és hozzászólást törölhet |
| F34 | Admin posztok mindig láthatók | Az admin felhasználók bejegyzései minden feedben megjelennek |

---

[Vissza a dokumentáció főoldalára](index.md)
