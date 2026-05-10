# Technológiai döntések indoklása

## FastAPI (backend keretrendszer)

A FastAPI egy modern, nagy teljesítményű Python webes keretrendszer, amelyet a következő szempontok alapján választottunk:

- **Automatikus OpenAPI dokumentáció:** a FastAPI Pydantic sémák alapján automatikusan generál interaktív Swagger UI dokumentációt (`/docs` végpont), amely megkönnyíti az API tesztelését fejlesztés közben.
- **Típusbiztonság Pythonban:** a Python type hint-ek és Pydantic validáció révén a hibák korán, már a kérés beérkezésekor kiszűrhetők, nem pedig futásidőben.
- **Aszinkron támogatás:** beépített `async/await` támogatás, amely hatékony I/O-kezelést tesz lehetővé.
- **Alacsony boilerplate:** az endpointok definíciója tömör és olvasható, szemben pl. a Django REST Framework részletesebb konfigurációjával.
- **Aktív fejlesztői közösség és dokumentáció:** a FastAPI kiterjedt dokumentációval rendelkezik, ami gyors tanulást és hibaelhárítást tesz lehetővé.

## SQLAlchemy (ORM)

- **Absztrakciós réteg:** az SQLAlchemy lehetővé teszi, hogy az adatbázis-műveleteket Python objektumokon keresztül végezzük, nem nyers SQL-lel, csökkentve az SQL injection kockázatát és a karbantartási terhet.
- **Sémaváltás rugalmassága:** ha a fejlesztés során az adatbázismotort SQLite-ról (fejlesztés) PostgreSQL-re vagy MySQL-re (éles) kell váltani, az ORM réteg ezt minimális kódmódosítással teszi lehetővé.
- **Modellvezérelt fejlesztés:** a Python osztályok közvetlenül leképeződnek az adatbázis tábláira, ami egységes adatmodellt biztosít az egész backenddel.

## SQLite (adatbázis)

- **Zéró konfiguráció:** SQLite nem igényel külön szerverproceszt vagy telepítési lépéseket; az adatbázis egyetlen fájlban tárolódik.
- **Fejlesztési és oktatási kontextus:** az alkalmazás oktatási/demonstrációs célú projekt, ahol a SQLite egyszerűsége előnyt jelent.
- **Könnyű migráció:** az SQLAlchemy ORM révén, ha az alkalmazást éles környezetbe kellene vinni, az adatbázismotor cserélhető más, SQLAlchemy által támogatott megoldásra.

## JWT (JSON Web Token) autentikáció

- **Állapotmentesség (statelessness):** a JWT token maga hordozza a felhasználó azonosítóját, így a szervernek nem kell munkamenet-adatbázist fenntartani.
- **Platformfüggetlenség:** a token HTTP fejlécben (Authorization: Bearer) utazik, bármilyen klienssel (SPA, mobilalkalmazás) kompatibilis.
- **7 napos lejárat:** a hosszabb érvényességi idő javítja a felhasználói élményt (nem kell naponta újra bejelentkezni), miközben a lejárat garantálja, hogy ellopott tokenek korlátozott ideig érvényesek.

## bcrypt (jelszó hash-elés)

- **Iparági standard:** a bcrypt adaptív hash algoritmus, amely szándékosan lassú, ezzel megnehezítve a brute-force és szivárvány-tábla alapú támadásokat.
- **Sókkal való kombináció:** minden jelszóhoz véletlenszerű sót generál, így az azonos jelszavak hash-értékei is különbözők lesznek.

## Angular (frontend keretrendszer)

- **Erősen típusos fejlesztés:** az Angular natívan TypeScript-alapú, ami a frontend kódban is típusbiztonságot és jobb IDE-támogatást biztosít.
- **Komponensalapú architektúra:** az Angular standalone komponensei lehetővé teszik az újrahasználható, jól izolált UI elemek készítését (pl. `PostComponent`, `ToastComponent`).
- **Beépített DI és Services:** Angular beépített függőség-injekciós (DI) rendszere tiszta szétválasztást biztosít az üzleti logika (service) és a megjelenítési réteg (component) között.
- **Reaktív adatfolyamok (RxJS):** az `Observable` és `BehaviorSubject` minták lehetővé teszik a komponensek közti valós idejű adatszinkronizációt (pl. értesítési számláló, feed frissítés).
- **Kliensoldali routing:** az Angular Router SPA-n belüli navigációt biztosít oldal-újratöltés nélkül, javítva a felhasználói élményt.

## Önálló (standalone) Angular komponensek

Az Angular 14+ által bevezetett standalone komponensek használata megszünteti a szükségtelen `NgModule` deklarációkat, csökkenti a boilerplate kódot, és javítja a tree-shaking hatékonyságát.

---

[Vissza a dokumentáció főoldalára](index.md)
