# Twitter-klón Webalkalmazás

Egy Twitter/X-ihlette közösségi média webalkalmazás, amelyen a felhasználók posztokat hozhatnak létre, követhetnek más felhasználókat, interakcióba léphetnek tartalmakkal, és valós idejű értesítéseket kapnak.

## Tartalom

- [Előfeltételek](#előfeltételek)
- [Projekt struktúra](#projekt-struktúra)
- [Backend telepítése és futtatása](#backend-telepítése-és-futtatása)
- [Frontend telepítése és futtatása](#frontend-telepítése-és-futtatása)
- [Az alkalmazás elindítása](#az-alkalmazás-elindítása-összefoglalás)
- [Tesztelés](#tesztelés)
- [Hasznos parancsok](#hasznos-parancsok)
- [Hibaelhárítás](#hibaelhárítás)

---

## Előfeltételek

A következő szoftverek szükségesek a projekt futtatásához:

| Szoftver | Minimum verzió | Ellenőrzés |
|---|---|---|
| **Python** | 3.10+ | `python --version` |
| **pip** | legújabb | `pip --version` |
| **Node.js** | 18+ | `node --version` |
| **npm** | 11+ | `npm --version` |

---

## Projekt struktúra

```
fasza/
├── backend/              # FastAPI Python backend
│   ├── main.py           # API endpointok
│   ├── database.py       # SQLAlchemy modellek
│   ├── schemas.py        # Pydantic sémák
│   ├── auth.py           # JWT hitelesítés
│   ├── seed.py           # Adatbázis feltöltő script
│   └── requirements.txt  # Python függőségek
├── frontend/             # Angular SPA
│   ├── src/
│   └── package.json      # Node függőségek
├── docs/                 # Projekt dokumentáció
└── README.md
```

---

## Backend telepítése és futtatása

### 1. Navigálj a backend mappába

```bash
cd backend
```

### 2. Hozz létre virtuális Python környezetet

```bash
python -m venv venv
```

### 3. Aktiváld a virtuális környezetet

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**Linux / macOS:**
```bash
source venv/bin/activate
```

### 4. Telepítsd a függőségeket

```bash
pip install -r requirements.txt
```

### 5. (Opcionális) Töltsd fel az adatbázist mintaadatokkal

A script létrehoz 6 felhasználót (1 admin, 4 normál, 1 felfüggesztett), posztokkal, hozzászólásokkal, like-okkal, követési kapcsolatokkal és értesítésekkel:

```bash
python seed.py
```

Ha az adatbázist törölni és újra feltölteni szeretnéd:

```bash
python seed.py --reset
```

**Demo fiókok:**

| Felhasználónév | Jelszó | Szerepkör | Leírás |
|---|---|---|---|
| `admin` | `admin123` | admin | Platform adminisztrátor |
| `tech_guru` | `password123` | user | Tech blogger (Alex Turner) |
| `coffee_lover` | `password123` | user | Kávé és kód (Maya Chen) |
| `dev_evelina` | `password123` | user | Webfejlesztő (Evelina Kovács) |
| `night_owl` | `password123` | user | Éjszakai gondolkodó (Sam Rivers) |
| `spam_bot` | `password123` | user | **Felfüggesztett** – nem tud belépni |

### 6. Indítsd el a szervert

```bash
uvicorn main:app --reload
```

A backend elérhető lesz: **http://localhost:8000**

Az interaktív API dokumentáció (Swagger UI): **http://localhost:8000/docs**

---

## Frontend telepítése és futtatása

### 1. Navigálj a frontend mappába (új terminálban)

```bash
cd frontend
```

### 2. Telepítsd a Node.js függőségeket

```bash
npm install
```

### 3. Indítsd el a fejlesztői szervert

```bash
npm start
```

Az alkalmazás elérhető lesz: **http://localhost:4200**

> A fejlesztői szerver automatikusan újratölti az alkalmazást, ha módosítod a forrásfájlokat.

---

## Az alkalmazás elindítása (összefoglalás)

Két különálló terminálra van szükség:

**1. terminál – Backend:**
```bash
cd backend
.\venv\Scripts\Activate.ps1   # Windows PowerShell
pip install -r requirements.txt
python seed.py                 # csak első alkalommal
uvicorn main:app --reload
```

**2. terminál – Frontend:**
```bash
cd frontend
npm install                    # csak első alkalommal
npm start
```

Ezután nyisd meg a böngészőben: **http://localhost:4200**

---

## Tesztelés

### Frontend unit tesztek futtatása

```bash
cd frontend
npm test
```

### Backend API tesztelése

A Swagger UI felületen keresztül közvetlenül böngészőből tesztelhető az összes endpoint:

```
http://localhost:8000/docs
```

---

## Hasznos parancsok

### Backend

| Parancs | Leírás |
|---|---|
| `uvicorn main:app --reload` | Szerver indítása (auto-reload) |
| `uvicorn main:app --host 0.0.0.0 --port 8000` | Szerver indítása hálózaton |
| `python seed.py` | Adatbázis feltöltése mintaadatokkal |

### Frontend

| Parancs | Leírás |
|---|---|
| `npm start` | Fejlesztői szerver indítása |
| `npm run build` | Production build elkészítése |
| `npm test` | Unit tesztek futtatása |
| `npm run watch` | Watch módú fejlesztői build |

---

## Hibaelhárítás

**`uvicorn: command not found` / `uvicorn` nem található**
Győződj meg róla, hogy a virtuális környezet aktív (`.\venv\Scripts\Activate.ps1`), majd futtasd újra a `pip install -r requirements.txt` parancsot.

**`ng: command not found`**
Az Angular CLI globálisan nem szükséges — az `npm start` az `ng serve`-t a helyi `node_modules/.bin/ng` útvonalon keresztül hívja. Ellenőrizd, hogy futott-e az `npm install`.

**CORS hiba a böngészőben**
Győződj meg róla, hogy a backend a **8000-es porton** fut, és a frontend a **4200-as porton**. A CORS csak ezeket az eredeteket engedélyezi.

**`Activate.ps1 cannot be loaded` (Windows PowerShell)**
Futtasd egyszer a következő parancsot emelt jogosultságú PowerShell-ben:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
