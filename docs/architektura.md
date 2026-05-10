# Rendszerarchitektúra

Az alkalmazás klasszikus háromrétegű kliens-szerver architektúrában épül fel.

```
┌─────────────────────────────────────────────────────────┐
│                    Böngésző (Kliens)                    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Angular SPA (port 4200)             │   │
│  │                                                  │   │
│  │  Pages:          Components:    Services:        │   │
│  │  - HomeComponent  - PostComponent  - AuthService │   │
│  │  - ProfileComponent- ToastComponent- PostService │   │
│  │  - ExploreComponent- SidebarComp. - UserService  │   │
│  │  - NotificationsC. - ConfirmDialog - NotifService│   │
│  │  - AuthComponent                                 │   │
│  │  - PostDetailComp.  Auth Interceptor (JWT)       │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────┘
                      │ HTTP REST API (JSON)
                      │ Authorization: Bearer <JWT>
┌─────────────────────▼───────────────────────────────────┐
│              FastAPI Backend (port 8000)                │
│                                                         │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────┐  │
│  │ main.py  │  │ schemas.py │  │     auth.py        │  │
│  │ (Routes) │→ │ (Pydantic) │  │ (JWT + bcrypt)     │  │
│  └──────────┘  └────────────┘  └────────────────────┘  │
│        │                                                │
│  ┌─────▼──────┐                                         │
│  │database.py │                                         │
│  │(SQLAlchemy)│                                         │
│  └─────┬──────┘                                         │
└────────┼────────────────────────────────────────────────┘
         │ SQL
┌────────▼────────────────────────────────────────────────┐
│              SQLite (twitter_clone.db)                  │
│                                                         │
│  users │ posts │ comments │ likes │ comment_likes │      │
│  followers │ notifications                              │
└─────────────────────────────────────────────────────────┘
```

## Rétegek leírása

**Prezentációs réteg (Angular SPA)**
A böngészőben futó Single Page Application felel a felhasználói felületért. Az Angular Router kezeli a kliensoldali navigációt, az RxJS Observable-ök a komponensek közti adatáramlást, a HTTP Interceptor pedig automatikusan csatolja a JWT tokent minden API-kéréshez.

**Alkalmazáslogikai réteg (FastAPI Backend)**
A backend REST API-n keresztül fogadja a kéréseket. A Pydantic sémák validálják a bemeneti adatokat, az `auth.py` kezeli a hitelesítést és jogosultságellenőrzést, a `main.py` tartalmazza az üzleti logikát és az endpointokat.

**Adatréteg (SQLAlchemy + SQLite)**
Az SQLAlchemy ORM absztrahálja az adatbázis-műveleteket. A `database.py` definiálja a modelleket és a session-kezelést. Az adatok SQLite fájlban tárolódnak fejlesztési környezetben.

---

[Vissza a dokumentáció főoldalára](index.md)
