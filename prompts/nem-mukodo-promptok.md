# Nem Jól Működő Promptok

Az alábbi promptok valamilyen okból nem hozták a várt eredményt. Minden példánál feltüntetjük a problémát, a tanulságot, és egy javított verziót.

---

## 1. Túl vague kérdés hibaelhárításhoz

**Eredeti prompt:**
```
Why doesn't my login work?
```

**Mi lett az eredmény:**
Az AI általános lehetséges okokat sorolt fel (rossz jelszó, helytelen endpoint URL, CORS, token formátum stb.) – egyik sem volt konkrétan alkalmazható, mert nem adtunk kontextust.

**A probléma:**
Kontextus nélkül az AI csak találgathat. Nem tudja, mi a hibaüzenet, milyen kódot futtatunk, vagy hol tart a folyamat.

**Tanulság:** Mindig csatolni kell a hibaüzenetet, a releváns kódrészletet, és leírni mi az elvárt vs. tényleges viselkedés.

**Javított prompt:**
```
My FastAPI POST /login endpoint returns 422 Unprocessable Entity when I send:
{ "username": "alice", "password": "alice123" }

Here is my endpoint definition: [kód beillesztve]
Here is my LoginRequest Pydantic schema: [séma beillesztve]

What am I doing wrong?
```

---

## 2. Több célt ötvöző prompt

**Eredeti prompt:**
```
Create the full Angular frontend for my Twitter clone with routing, auth, posts, profile page,
notifications, and admin panel. Use Angular 21 standalone components.
```

**Mi lett az eredmény:**
Az AI egy generikus, sablonszerű Twitter clone vázat generált, amely nem igazodott a meglévő backend API struktúrájához. A komponensek nevei, a service metódusok és az endpointok nem egyeztek a projektünkkel.

**A probléma:**
A prompt túl tág volt – az AI nem ismerte a backend API struktúráját, a meglévő modellek nevét, az endpointokat. Az eredmény jelentős átírást igényelt.

**Tanulság:** Nagy feladatokat kisebb, egymást követő promptokra kell bontani. Mindig adjuk meg a meglévő kód kontextusát.

**Javított megközelítés:**
```
I already have a FastAPI backend with these endpoints: [endpointok listája].
My TypeScript User interface is: [interface beillesztve].

Write only the Angular AuthService that wraps the /login and /register endpoints.
Use HttpClient and return Observables. Store the JWT token in localStorage under key 'access_token'.
```

---

## 3. Felesleges absztrakció kérés nélkül

**Eredeti prompt:**
```
Write a FastAPI endpoint to create a post.
```

**Mi lett az eredmény:**
Az AI egy repository pattern réteget vezetett be (`PostRepository` osztály), dependency injection-nel, ami egy egyszerű CRUD műveletre teljesen felesleges bonyolítás volt. A projekt többi endpointja nem használt ilyen mintát.

**A probléma:**
Az AI hajlamos „best practice"-nek tekintett mintákat alkalmazni, még akkor is, ha a projekt kontextusában azok nem illenek.

**Tanulság:** Ha az AI felesleges absztrakciókat vezet be, pontosítani kell: „Keep it simple, no repository pattern, write the logic directly in the route function, consistent with the existing endpoints."

**Javított prompt:**
```
Write a FastAPI POST /posts/ endpoint. Keep the logic directly in the route function (no extra classes or repository pattern). Follow the same style as this existing endpoint: [meglévő endpoint beillesztve].
```

---

## 4. Verziófüggő szintaxis figyelmen kívül hagyása

**Eredeti prompt:**
```
How do I add an HTTP interceptor in Angular to attach a Bearer token?
```

**Mi lett az eredmény:**
Az AI a class-alapú `HttpInterceptor` interface-t mutatta be (`implements HttpInterceptor`), amely az Angular régebbi verzióiban használatos. Az Angular 15+ óta a funkcionális interceptor a preferált megközelítés, és a projekt is ezt használja.

**A probléma:**
Az AI az edzési adataiban szereplő leggyakoribb megoldást adta, nem a projektünkre vonatkozó verzióspecifikus megoldást.

**Tanulság:** Mindig meg kell adni az Angular (vagy más framework) verziót, és expliciten kérni a verzióhoz illő szintaxist.

**Javított prompt:**
```
Write an HTTP interceptor in Angular 21 using the functional interceptor style
(not the class-based HttpInterceptor). The interceptor should attach a Bearer token from localStorage.
```

---

## 5. Optimista frissítés hibás implementációja

**Eredeti prompt:**
```
When the user likes a post, update the like count immediately without waiting for the API response.
```

**Mi lett az eredmény:**
Az AI javasolta, hogy mutáljuk közvetlenül a `post` objektumot a komponensben (`post.like_count++`), de nem kezelte a hibás API-hívás esetét (rollback). Ha az API hívás sikertelen volt, a UI inkonzisztens állapotban maradt.

**A probléma:**
Az optimista frissítésnek rollback logikát is tartalmaznia kell. Az AI a „boldog utat" implementálta, a hibakezelést kihagyta.

**Tanulság:** Ha optimista UI frissítést kérünk, expliciten kell kérni a hibakezelést és a rollback-et is.

**Javított prompt:**
```
Implement optimistic like toggle in Angular:
1. Immediately update post.like_count and post.isLiked in the UI (before API call)
2. Call the API
3. If the API call fails (catchError), revert post.like_count and post.isLiked to their original values
4. Show an error toast on failure

Here is the likePost() service method signature: [kód beillesztve]
```

---

## 6. Adatbázis seed script egyszeri futtatás nélkül

**Eredeti prompt:**
```
Write a seed script for my Twitter clone database that creates test users and posts.
```

**Mi lett az eredmény:**
A generált `seed.py` minden futtatáskor újra létrehozta a felhasználókat és posztokat, duplikátumokat eredményezve. Nem ellenőrizte, hogy az adatok már léteznek-e.

**A probléma:**
Az AI nem gondolt arra, hogy a seed scriptet többször is futtathatják, és nem épített be idempotens logikát.

**Tanulság:** Expliciten kérni kell, hogy a script idempotens legyen (ellenőrizze, hogy az adat már létezik-e).

**Javított prompt:**
```
Write an idempotent seed script for my FastAPI + SQLAlchemy app.
Before inserting each user or post, check if it already exists (by username or content).
Only insert if it doesn't exist yet, so the script is safe to run multiple times.
```
