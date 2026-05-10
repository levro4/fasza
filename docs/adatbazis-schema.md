# Adatbázis-séma

Az adatbázis 7 táblából áll, amelyek az SQLAlchemy ORM modelljein keresztül kerülnek létrehozásra az alkalmazás első indításakor.

## Táblák és kapcsolataik

```
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password_hash
├── role ('user' | 'admin')
├── is_suspended
├── displayName
├── profileImage
└── bannerImage

posts
├── id (PK)
├── content
├── created_at
├── owner_id (FK → users.id)
└── original_post_id (FK → posts.id, NULL = nem reposzt)

comments
├── id (PK)
├── content
├── created_at
├── post_id (FK → posts.id)
└── user_id (FK → users.id)

likes
├── id (PK)
├── user_id (FK → users.id)
└── post_id (FK → posts.id)

comment_likes
├── id (PK)
├── user_id (FK → users.id)
└── comment_id (FK → comments.id)

followers
├── id (PK)
├── follower_id (FK → users.id)
└── followed_id (FK → users.id)

notifications
├── id (PK)
├── user_id (FK → users.id)     -- értesítés címzettje
├── actor_id (FK → users.id)    -- ki váltotta ki
├── post_id (FK → posts.id, NULL = follow értesítésnél)
├── type ('new_post' | 'repost' | 'follow')
├── is_read
└── created_at
```

## Táblák leírása

| Tábla | Leírás |
|---|---|
| **users** | Felhasználói fiókok; tartalmazza a szerepkört (`user`/`admin`) és a felfüggesztés állapotát |
| **posts** | Bejegyzések; az `original_post_id` mező jelzi, ha a poszt egy reposzt |
| **comments** | Hozzászólások bejegyzésekhez |
| **likes** | Bejegyzés like-ok kapcsolótáblája |
| **comment_likes** | Hozzászólás like-ok kapcsolótáblája |
| **followers** | Követési kapcsolatok; `follower_id` követi `followed_id`-t |
| **notifications** | Tevékenységi értesítések; `actor_id` váltotta ki az eseményt `user_id` számára |

---

[Vissza a dokumentáció főoldalára](index.md)
