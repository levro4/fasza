# Nem-funkcionális követelmények

## NF1–NF7 Biztonság

| # | Követelmény | Megvalósítás |
|---|---|---|
| NF1 | Hitelesítés | JWT alapú token-hitelesítés, 7 napos lejárattal |
| NF2 | Jelszóvédelem | bcrypt hash-elés sóval, brute-force elleni védelem |
| NF3 | Jogosultságkezelés | Minden módosító endpoint ellenőrzi, hogy a kérést saját felhasználó vagy admin küldi-e |
| NF4 | CORS korlátozás | Csak a frontend eredetéről (`http://localhost:4200`) érkező kérések engedélyezettek |
| NF5 | XSS-védelem | Angular beépített HTML sanitizáció – a komponens template-ek nem értelmeznek nyers HTML-t |
| NF6 | SQL injection megelőzése | SQLAlchemy ORM paraméteres lekérdezései megakadályozzák az SQL injekciót |
| NF7 | Felfüggesztett felhasználók kizárása | Felfüggesztett fiókkal nem lehet bejelentkezni; posztjaik nem jelennek meg a feedben |

## NF8–NF11 Teljesítmény

| # | Követelmény | Megvalósítás |
|---|---|---|
| NF8 | Lapozás (pagination) | A `/posts/` és `/users/` endpointok `skip`/`limit` paramétereket támogatnak |
| NF9 | Aszinkron szerver | FastAPI + Uvicorn ASGI szerver párhuzamos kérések hatékony kiszolgálásához |
| NF10 | Reaktív UI | RxJS Observable-ök és BehaviorSubject-ek minimalizálják a felesleges újratöltéseket |
| NF11 | Feed cache invalidáció | `PostService.feedChanged$` Observable keresztkomponens frissítést küld, nem pooling alapú |

## NF12–NF17 Használhatóság (UX)

| # | Követelmény | Megvalósítás |
|---|---|---|
| NF12 | SPA navigáció | Angular Router – oldalbetöltés nélküli navigáció |
| NF13 | Toast értesítések | `ToastService` – sikeres/hibás műveletek visszajelzése 3,5 másodperces auto-dismiss időzítéssel |
| NF14 | Megerősítő dialógus | `ConfirmDialogService` – romboló műveletek (törlés, felfüggesztés) előtt visszaigazolást kér |
| NF15 | Valós idejű értesítési szám | Az olvasatlan értesítések száma 30 másodpercenként automatikusan frissül |
| NF16 | Responsive layout | A sidebar és tartalom elrendezése alkalmazkodik a képernyőmérethez |
| NF17 | Mention és hashtag formázás | A `@felhasználónév` és `#hashtag` szövegek kattintható linkekként jelennek meg |

## NF18–NF22 Karbantarthatóság

| # | Követelmény | Megvalósítás |
|---|---|---|
| NF18 | Rétegelt architektúra | Backend: route → schema validation → üzleti logika → ORM; Frontend: component → service → HTTP |
| NF19 | Típusbiztonság | TypeScript a frontenden, Pydantic a backenden – futásidejű hibák csökkenése |
| NF20 | Újrahasználható komponensek | `PostComponent`, `ToastComponent`, `ConfirmDialogComponent` – egységes megjelenés az egész alkalmazásban |
| NF21 | Kódformázás | Prettier konfiguráció a frontend kód egységes stílusához |
| NF22 | Dependency injection | Angular DI container – a service-ek könnyedén felválthatók tesztelés során |

## NF23–NF26 Fejleszthetőség

| # | Követelmény | Megvalósítás |
|---|---|---|
| NF23 | Automatikus API dokumentáció | FastAPI `/docs` Swagger UI endpointja |
| NF24 | Adatbázis-motor cserélhetősége | SQLAlchemy ORM absztrakciós rétege lehetővé teszi a SQLite → PostgreSQL migrációt minimális változtatással |
| NF25 | Környezeti konfigurálhatóság | `.env` fájl a titkos kulcsokhoz; Angular `environments/` mappa dev/prod konfiguráció szétválasztáshoz |
| NF26 | Tesztelési infrastruktúra | Vitest tesztelési keretrendszer konfigurálva a frontendhez |

---

[Vissza a dokumentáció főoldalára](index.md)
