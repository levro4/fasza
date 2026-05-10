# Jól Működő Promptok

Az alábbi promptok hatékonynak bizonyultak a fejlesztés során. Minden példánál feltüntetjük, **miért** volt hatékony, és mit kaptunk eredményül.

---

## 1. SQLAlchemy modellek generálása

**Prompt:**
```
I'm building a Twitter clone with FastAPI and SQLAlchemy (SQLite).
I need the following database tables:
- users (id, username unique, email unique, password_hash, role: 'user'/'admin', is_suspended bool, displayName, profileImage, bannerImage)
- posts (id, content, created_at, owner_id FK to users, original_post_id FK to posts self-reference for reposts, nullable)
- comments (id, content, created_at, post_id FK, user_id FK)
- likes (id, user_id FK, post_id FK)
- comment_likes (id, user_id FK, comment_id FK)
- followers (id, follower_id FK, followed_id FK)
- notifications (id, user_id FK recipient, actor_id FK who triggered, post_id FK nullable, type: 'new_post'/'repost'/'follow', is_read bool, created_at)

Please generate the SQLAlchemy models with proper relationships. Use declarative_base().
```

**Miért működött jól:**
Teljesen pontos, felsorolásszerű specifikáció minden táblához és mezőhöz. Az AI-nak nem kellett találgatnia – csak implementálnia. A self-referenciális FK-t (reposzt) külön kiemelve adtuk meg.

**Eredmény:** Közel kész `database.py`, minimális manuális módosítással (session management finomhangolása).

---

## 2. JWT toggle-alapú like endpoint

**Prompt:**
```
I have a FastAPI endpoint for liking posts. The current behavior should be a toggle:
- If the user already liked the post → remove the like
- If the user hasn't liked the post → add the like

I use SQLAlchemy. The Like model has user_id and post_id fields.
After the toggle, return: { "is_liked": bool, "like_count": int }

Here is my current models:
[database.py models pasted here]

Write the endpoint POST /posts/{post_id}/like
```

**Miért működött jól:**
Megadtuk a pontos elvárt viselkedést (toggle logika), a visszatérési értéket, és a meglévő modellt kontextusként. Az AI nem kellett hogy kitalálja a struktúrát.

**Eredmény:** Működő toggle endpoint, amelyet szinte változtatás nélkül használtunk. Ugyanezt a mintát alkalmaztuk a follow és retweet endpointoknál is.

---

## 3. Angular HTTP Interceptor JWT-vel

**Prompt:**
```
Write an Angular HTTP interceptor that:
1. Reads the access_token from localStorage
2. If it exists, adds the header: Authorization: Bearer <token>
3. If the response is 401 Unauthorized, removes the token from localStorage and redirects to /auth

Use the functional interceptor style (Angular 15+), not the class-based one.
```

**Miért működött jól:**
Megadtuk az Angular verzióspecifikus implementációs stílust (functional interceptor), a pontos localStorage kulcsot, és a 401-es kezelés elvárt viselkedését. Ezáltal az AI nem az elavult class-based interceptor mintát generálta.

**Eredmény:** Az `auth.interceptor.ts` fájl közel végleges formában jött létre.

---

## 4. Pydantic séma körkörös referenciával

**Prompt:**
```
I have a FastAPI app. My Post model has an optional self-reference: original_post_id -> posts.id (for reposts).

I need a Pydantic response schema PostResponse that includes:
- All post fields
- owner: UserResponse (nested)
- original_post: Optional[PostResponse] (recursive, for reposts)
- like_count, repost_count, is_liked, is_reposted (computed fields, not in DB)

How do I handle the recursive self-reference in Pydantic v2 without hitting recursion errors?
```

**Miért működött jól:**
A problémát pontosan körülírtuk (rekurzív referencia Pydantic v2-ben), és megadtuk a teljes elvárt struktúrát. Az AI a `model_rebuild()` megoldást javasolta, ami a helyes megközelítés Pydantic v2-ben.

**Eredmény:** Működő `PostResponse` séma rekurzív `original_post` mezővel.

---

## 5. Feed logika implementálása

**Prompt:**
```
I need a GET /feed endpoint in FastAPI. The feed should return posts where:
1. The post owner is someone the current user follows
2. OR the post owner is the current user
3. OR the post owner has role == 'admin'
4. Exclude posts by suspended users (is_suspended == True)
5. Order by created_at DESC

I have these SQLAlchemy models: [models pasted]
I have the current_user dependency that returns the logged-in user.

Write the SQLAlchemy query for this.
```

**Miért működött jól:**
A feltételeket sorszámmal, pontosan felsoroltuk. Az AI egy összetett `OR` feltételes SQLAlchemy lekérdezést generált, amely az összes feltételt kielégítette.

**Eredmény:** A feed endpoint SQLAlchemy lekérdezése első próbálkozásra helyes volt.

---

## 6. Angular BehaviorSubject a bejelentkezett felhasználóhoz

**Prompt:**
```
I need an Angular AuthService that:
- Stores the current logged-in user as a BehaviorSubject<User | null>
- On service initialization, if localStorage has an 'access_token', calls GET /users/me and populates the BehaviorSubject
- Exposes: currentUser$ observable, getLoggedInUser() that throws if no user, getOptionalUser() that returns null if not logged in
- Has refreshCurrentUser() that re-fetches from API and updates the subject
- Has updateUser(partial) that patches the local subject without API call (for optimistic updates)

The API base URL comes from environment.apiUrl.
```

**Miért működött jól:**
Az összes metódust és azok pontos viselkedését előre definiáltuk. Az AI nem kellett hogy döntést hozzon az interfészről – csak implementálta.

**Eredmény:** Az `auth.service.ts` szinte teljes egészében felhasználható kódot adott.

---

## 7. Hibaelhárítás – CORS hiba

**Prompt:**
```
I get this error in the browser console when my Angular app (localhost:4200) calls my FastAPI backend (localhost:8000):

Access to XMLHttpRequest at 'http://localhost:8000/login' from origin 'http://localhost:4200'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.

My FastAPI main.py currently has no CORS middleware. How do I add it to allow requests from localhost:4200?
```

**Miért működött jól:**
Bemásoltuk a pontos hibaüzenetet és megadtuk a kontextust (két szerver portszáma). Az AI azonnal a `CORSMiddleware` konfigurációt adta, pontosan a szükséges beállításokkal.

**Eredmény:** Azonnal működő CORS konfiguráció.

---

## 8. Dokumentáció generálása kódelemzés alapján

**Prompt:**
```
Please create a documentation for the project based on this specification.
A dokumentációnak tartalmaznia kell a választott technológia stack-et, kifejteni és
indokolni, hogy miért azokat a megoldásokat választotta. A dokumentáció térjen ki
arra, hogy milyen megvalósított funkcionális és nem-funkcionális követelményeknek
felel meg a projekt. A dokumentációt a repository-ban egy docs mappába kell tenni
```

*(Ez a projekt dokumentációjának elkészítéséhez használt prompt volt – Claude-dal, a teljes kódbázis elemzése után.)*

**Miért működött jól:**
Az AI előzetesen feltérképezte a teljes kódbázist (minden fájlt, endpointot, komponenst), így konkrét, valós adatokon alapuló dokumentációt tudott generálni általánosságok helyett.

**Eredmény:** A `docs/` mappa teljes tartalma.
