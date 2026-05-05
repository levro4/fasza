# FakeTwitter Angular Projekt - Prompts és Fejlesztési Történet

Ebben a fájlban rögzítve vannak az eddigi kéréseid és a projekt fejlesztésének lépései.

## 1. Kérés: Projekt alapok és struktúra
**User:** szeretnék készíteni egy fake twitter web alkalmazást angulárban, első lépésekben készítsd el nekem az alkalmazás alapját oldalanként, legyen egy központi css amit minden oldalon használsz az egyenletesség érdekében, jól láthatóan rendszerezd a fileokat
**Eredmény:** Létrehoztuk a projekt struktúráját, a központi `styles.css`-t (színekkel, Twitter-szerű elrendezéssel). Bekerült a `SidebarComponent`, valamint a `Home`, `Explore` és `Profile` oldalak, beállítva a routinggal.

## 2. Kérés: Regisztráció, Bejelentkezés, Könyvjelzők és Értesítések
**User:** szuper legyen az oldalsávban regisztrációs felület is és bejelnetkezés is a kinézetre ismét a központi css-t hsználd legyen könyvjelzők oldal is és értesítések is
**Eredmény:** Bekerült a `Notifications` és `Bookmarks` oldal. A sidebar aljára került egy form a regisztrációhoz és bejelentkezéshez.

## 3. Kérés: Külön Auth oldal és Ikonok
**User:** a login és vagy regisztrációs oldal ne a bal menüsávban legyen hnem legyen neki egy küln "fő oldal" és a menüpontok mellett legyenek releváns ikonok
**Eredmény:** Készült egy teljes képernyős `AuthComponent` a bejelentkezéshez. A menüsávba bekerültek az SVG ikonok, az alsó űrlapot pedig lecseréltük egy "Login / Sign up" gombra.

## 4. Kérés: Ikon stílus javítás
**User:** az ikonok közül a harang ikon ne legyen kitöltve mivel a többi sincs
**Eredmény:** A harang ikont kicseréltük egy outline (kitöltetlen) verzióra a többi ikonhoz igazodva.

## 5. Kérés: Profil ikon javítás
**User:** és a profil ikonra is használj egy felismerhetőbb ember "profil" ikont
**Eredmény:** A profil ikon cseréje egy egyértelműbb, ember alakú outline ikonra.

## 6. Kérés: Regisztrációs űrlap részletezése
**User:** szuper, most a /auth oldalon ha a felhasználó a "Create account" gombra kattint akkor a login helyett legyen egy regisztrációs felület. A regisztációhoz szükség legyen a következőkre: - felhasználónév - telefonszám - Születési dátum - email cím - jelszó 2X
**Eredmény:** Az `AuthComponent` kapott egy State-et (login vs regisztráció), és bekerültek a kért beviteli mezők a regisztrációs formba.

## 7. Kérés: Post készítés modál
**User:** /home oldalon a Post gombra kattintva lehessen post-ot készíteni egy felugró "modal" ablakban
**Eredmény:** A `SidebarComponent`-hez hozzáadtunk egy modális ablakot, amely gombnyomásra megnyílik, elsötétíti a hátteret, és lehetővé teszi egy új poszt írását.

## 8. Kérés: Profil oldal kinézet
**User:** /profile oldalon jelenjen meg a felhasználó által beállított banner és a profilkép kör formában, tőle jobbra profil szerkeztése gomb alatta bal oldaolon felhasználónév vastagon kiemelve, alatta szürkébb és vékonyabb betűtípussal a regisztráció ideje, az alatt pedig az adatok arról hogy az adott felhasznló hány embert követ és hogy őt hányan követik, ez alatt a rész alatt pedig jelenjenek meg az adott ember posztjai
**Eredmény:** Felépítettük a profil oldalt (banner, rálógó kör alakú avatar, Edit profile gomb, nevek, regisztráció dátuma naptár ikonnal, Followers/Following statisztikák, és a teszt posztok feedje fülekkel).

## 9. Kérés: Angular hiba javítása
**User:** X [ERROR] NG2008: Could not find stylesheet file './profile.component.css'...
**Eredmény:** A `styleUrls` javítása `styleUrl`-re a Profile komponensben.

## 10. Kérés: Post komponens kiszervezése
**User:** hozzunk létre egy "post" komponenst mivel ezt sokszor fogjuk használni legyen hasonló mint ami a profilon van később erre kicserélheted annyi változás legyen hogy az emojii-k helyett ikonokat hsználj itt is
**Eredmény:** Létrehoztuk a `PostComponent`-et, kicseréltük az emojikat SVG ikonokra hover effektekkel (reply, retweet, like, view), és implementáltuk a profil oldalon.

## 11. Kérés: Explore oldal kialakítása
**User:** /explore oldalon felül legyen egy kereső alatta pedig egy pár javaslat (pl.: Romania Sport · Népszerű...)... ez a rész alatt lehetnek random posztok
**Eredmény:** Elkészült az Explore oldal lekerekített kék keretes keresővel, kiemelt trendekkel (szürke kategória, vastag cím), és alatta random posztokkal (a `PostComponent` felhasználásával).

## 12. Kérés: Angular hiba javítása
**User:** X [ERROR] NG2008: Could not find stylesheet file './explore.component.css'...
**Eredmény:** A `styleUrl` javítása `styleUrls`-re az Explore komponensben (verzió/CLI hiba miatt).

## 13. Kérés: Könyvjelzők és poszt részletek
**User:** módosítsuk a post komponenst, lehessen bookmarkolni az adott post-ot. 1x kattintva a poszta töltse ki a középső részt, felül legyen egy visszayíl hogy be lehessen zárni ezt a nézetet, a poszt alatt jelenjenek meg az adott poszthoz tartozó kommentek, és a kommentre kommentelés egyértelműen látszódjon pl a halvány vonallal mint az eredeti twitter oldalon is
**Eredmény:** Könyvjelző ikon funkció hozzáadása a posztokhoz. Létrehoztuk a `PostDetailComponent`-et, amely kattintásra megjelenik egy visszanyíllal, halvány "thread line"-al köti össze a fő posztot a kommentekkel.

## 14. Kérés: Dinamikus Post betöltés
**User:** a posztra kattintva a kattintott poszt jelenjen meg ne egy random mokkolt poszt
**Eredmény:** Létrehoztuk a `PostService`-t központi mock adattárolónak. A posztok és részletek most már ID alapján, dinamikusan töltődnek be az URL paraméterek alapján.

## 15. Kérés: Hashtagek kigyűjtése és kiemelése
**User:** post készítésekor lehessen #-eket megadni ilyenkor ezt mentse a post egy külön részbe készítsd elő az adatbázisnak és gyűjtsd ki a postban használt #-eket hogy később adatbázisból a lekérdezés hatására megjelenjenek a releváns posztok, szöveg résznél ha az ember #valami..-t ír akkor az jelenjen meg feltűnőbben pl kéken
**Eredmény:** A post küldésekor reguláris kifejezéssel kigyűjtjük a hashtageket egy listába. A `PostComponent` megkapta a `formattedContent` propertyt, amely kicseréli a hashtageket kék span elemekre.

## 16. Kérés: Bookmarks oldal
**User:** /bookmarks oldalon jelenjenek meg a bookmarkolt posztok
**Eredmény:** Kialakítottuk a Bookmarks oldalt, amely a `PostService`-ből csak a mentett posztokat szűri ki és jeleníti meg, üres állapottal kiegészítve.

## 17. Kérés: Angular hiba javítása
**User:** X [ERROR] NG2008: Could not find stylesheet file './bookmarks.component.css'...
**Eredmény:** A `styleUrls` javítása `styleUrl`-re a Bookmarks komponensben.

## 18. Kérés: Interakciók és Reposts fül
**User:** A profil oldalon a Highlights helyett legyen a fül repostok ahol a repostokat listázza az oldal, lehessen egy postot likeolni és mellette kicsiben halványan számolja a likeokat, a kommentek számát is hasonlóan jelezze
**Eredmény:** "Highlights" átnevezése "Reposts"-ra. A Like, Repost és Reply ikonok megkapták a funkciót a számlálásra és a vizuális állapotjelzésre (pl. teli rózsaszín szív).

## 19. Kérés: Animált navigáció a profil oldalon
**User:** a profil fülön lehessen váltogatni a tabok között (Posts Replies Reposts Media Likes) a kék aláhúzás animációval mozogjon amikor a felhasználó rákattint és jelenjen meg a releváns oldal
**Eredmény:** TS logika bevezetése a fülek kezelésére, és CSS animált kék vonal (Indicator) készítése, amely transzformációval követi az aktív fület.

## 20. Kérés: Edit Profile Modal
**User:** legyen a tab oldalak alatt kék aláhúzás animációval amikor kattint rá a felhasználó, az edit profile gombra kattintva modál ablakban lehessen módosítani profilképet vagy bannert
**Eredmény:** Tab indikátor javítása. Létrehoztuk az Edit Profile modált, ahol kamerás hover effekttel látszik a banner és az avatar, valamint módosíthatóak az URL-ek és a megjelenített név `[(ngModel)]` segítségével.

## 21. Kérés: Kommentelés és Views funkció
**User:** a profil szerkeztő modálban a save gomb a jobb oldalra legyen rendezve. a post komponensnél lehessen kommentetírni a komment ikonra kattintva, repostokat is hasonlóan számolja mint a likeokat, megtekintésnek számít ha az ember rá kattint a postra
**Eredmény:** Modálban a Save gomb jobbra lett igazítva. A `PostComponent` kapott egy új, beépített Reply modált. A Repost kapott számlálót, és a Views (megtekintések) száma nő, ha rákattintunk egy posztra a részletek megtekintéséhez.

## 22. Kérés: Promptok kimentése
**User:** a root mappába készíts egy prompts mappát és egy md-fileba metsd ki az eddigi beszélgetésünket
**Eredmény:** Létrejött ez a fájl (`prompts/conversation.md`).
