# AI Használat Dokumentáció

## Tartalomjegyzék

- [Felhasznált eszközök](#felhasznált-eszközök)
- [Fejlesztési fázisok és AI-használat](#fejlesztési-fázisok-és-ai-használat)
- [Összefoglaló elemzés](#összefoglaló-elemzés)
- [Részletes prompt dokumentáció](#részletes-prompt-dokumentáció)

---

## Felhasznált eszközök

| Eszköz | Mire használtuk |
|---|---|
| **Claude (Anthropic)** | Architektúratervezés, backend kód generálása, hibakeresés, dokumentáció |
| **GitHub Copilot** | Kódkiegészítés szerkesztő közben (Angular komponensek, TypeScript interfaces) |

---

## Fejlesztési fázisok és AI-használat

### 1. fázis – Tervezés és architektúra

Az AI-t elsősorban a technológiai stack kiválasztásában és az adatbázis-séma megtervezésében használtuk. Kérdéseket tettünk fel arról, hogy FastAPI vagy Django REST Framework illik-e jobban az egyszerű CRUD API-hoz, és hogy SQLite elegendő-e fejlesztési célra. Az AI segített az adatmodell kapcsolatainak átgondolásában (pl. hogyan reprezentáljuk a reposzt kapcsolatot önreferenciáló FK-val a `posts` táblán belül).

**AI hozzájárulása:** magas – az architektúrális döntések nagy részét AI-val validáltuk.

### 2. fázis – Backend fejlesztés (FastAPI)

Ez volt az AI-intenzitás szempontjából a legjelentősebb fázis. Az AI segített:

- az SQLAlchemy modellek (`database.py`) első változatának megírásában
- a Pydantic sémák (`schemas.py`) tervezésében, különösen a körkörös referenciák (poszt → eredeti poszt) kezelésénél
- a JWT alapú hitelesítés (`auth.py`) implementálásában: token generálás, `get_current_user` dependency
- a toggle logika megírásában (like, follow, retweet – ha létezik, töröl; ha nem, létrehoz)
- az értesítési rendszer (`notifications` tábla) tervezésében és az endpointok implementálásában
- a feed és explore szétválasztásában: a feed csak a követett + saját + admin posztokat mutatja

**AI hozzájárulása:** magas – a backend logika kb. 60%-át AI segítségével írtuk, majd manuálisan finomhangoltuk.

### 3. fázis – Frontend fejlesztés (Angular)

Az AI-t a service réteg és az interceptor implementálásához, valamint az RxJS minták alkalmazásához használtuk:

- `AuthService` – BehaviorSubject a bejelentkezett felhasználó állapotához
- `PostService` – `feedChanged$` Subject a cross-component feed frissítéshez
- `auth.interceptor.ts` – Bearer token automatikus csatolása, 401 kezelés
- `ToastService` – auto-dismiss toast logika setTimeout-tal
- `ProfileComponent` – tab alapú nézet (posts/replies/likes) reaktív adatbetöltéssel

A GitHub Copilot főként a repetitív Angular kód (template bindings, form validáció) kiegészítésénél volt hasznos.

**AI hozzájárulása:** közepes – az Angular keretrendszer-specifikus kódot AI ajánlotta, de az alkalmazáslogikát (pl. feed szinkronizáció) manuálisan terveztük meg.

### 4. fázis – Hibakeresés

Az AI-t konkrét hibák diagnosztizálásához használtuk. A leghatékonyabb interakciók azok voltak, ahol a teljes hibaüzenetet és a releváns kódrészletet bemásoltuk. Kevésbé hatékony volt, ha csak a tüneteket írtuk le kontextus nélkül.

**AI hozzájárulása:** magas a jól megfogalmazott kérdéseknél, alacsony a vague kérdéseknél.

### 5. fázis – Dokumentáció

A projekt dokumentációját (`docs/` mappa) és ezt az AI-használati dokumentumot Claude segítségével készítettük el, a kódbázis elemzése alapján.

**AI hozzájárulása:** nagyon magas – a dokumentáció nagy részét AI generálta, emberi ellenőrzéssel.

---

## Összefoglaló elemzés

| Fázis | AI-intenzitás | Legfőbb felhasználás |
|---|---|---|
| Tervezés | Magas | Stack kiválasztás, adatmodell validálás |
| Backend | Magas | Kódgenerálás, logikai minták |
| Frontend | Közepes | Service réteg, RxJS minták, Copilot kiegészítés |
| Hibakeresés | Változó | Hibadiagnózis (kontextus-függő) |
| Dokumentáció | Nagyon magas | Teljes dokumentáció generálása |

### Tanulságok

**Ami jól működött:**
- Specifikus, kontextusban gazdag promptok (kódrészlettel + hibaüzenettel együtt)
- Az AI által javasolt megoldás manuális finomhangolása a projekt saját konvencióihoz
- AI mint „második vélemény" architekturális döntéseknél
- Boilerplate kód (CRUD endpointok, Pydantic sémák) generálása

**Ami nem működött jól:**
- Vague, kontextus nélküli kérdések (pl. „miért nem működik a login?")
- Az AI által generált komplex kód kritika nélküli másolása – néha felesleges absztrakciókat vezet be
- Nagyon projekt-specifikus üzleti logika generálása (pl. az explore vs. feed pontos szétválasztása) – ott manuális tervezés volt szükséges
- Hosszú, több célt ötvöző promptok – az AI ilyenkor hajlamos az egyik részt elhanyagolni

---

## Részletes prompt dokumentáció

A jól és nem jól működő promptok részletes listáját lásd:

- [jo-promptok.md](jo-promptok.md) – Hatékony promptok és magyarázatuk
- [nem-mukodo-promptok.md](nem-mukodo-promptok.md) – Problémás promptok és tanulságaik
