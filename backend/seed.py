import sys
import datetime
import database
import auth
from database import (
    SessionLocal, Base, engine,
    User, Post, Comment, Like, CommentLike, Follower, Notification,
)


def seed_db(reset: bool = False):
    if reset:
        print("Dropping and recreating all tables...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    if db.query(User).count() > 0:
        print("Database already seeded. Run with --reset to wipe and re-seed.")
        db.close()
        return

    print("Seeding database with demo data...")

    now = datetime.datetime.now

    # ── Users ────────────────────────────────────────────────────────────────

    admin = User(
        username="admin",
        email="admin@faketwitter.com",
        password_hash=auth.get_password_hash("admin123"),
        role="admin",
        displayName="Platform Admin",
        profileImage="https://i.pravatar.cc/150?u=admin",
        bannerImage="https://picsum.photos/seed/adminbanner/800/200",
        is_suspended=False,
    )
    tech_guru = User(
        username="tech_guru",
        email="alex@techblog.io",
        password_hash=auth.get_password_hash("password123"),
        role="user",
        displayName="Alex Turner",
        profileImage="https://i.pravatar.cc/150?u=tech_guru",
        bannerImage="https://picsum.photos/seed/techguru/800/200",
        is_suspended=False,
    )
    coffee_lover = User(
        username="coffee_lover",
        email="maya@coffeecode.dev",
        password_hash=auth.get_password_hash("password123"),
        role="user",
        displayName="Maya Chen",
        profileImage="https://i.pravatar.cc/150?u=coffee_lover",
        bannerImage="https://picsum.photos/seed/maya/800/200",
        is_suspended=False,
    )
    dev_evelina = User(
        username="dev_evelina",
        email="evelina@webdev.hu",
        password_hash=auth.get_password_hash("password123"),
        role="user",
        displayName="Evelina Kovács",
        profileImage="https://i.pravatar.cc/150?u=dev_evelina",
        bannerImage="https://picsum.photos/seed/evelina/800/200",
        is_suspended=False,
    )
    night_owl = User(
        username="night_owl",
        email="sam@nightcode.net",
        password_hash=auth.get_password_hash("password123"),
        role="user",
        displayName="Sam Rivers",
        profileImage="https://i.pravatar.cc/150?u=night_owl",
        bannerImage="https://picsum.photos/seed/nightowl/800/200",
        is_suspended=False,
    )
    spam_bot = User(
        username="spam_bot",
        email="spam@badactor.com",
        password_hash=auth.get_password_hash("password123"),
        role="user",
        displayName="Spam Bot",
        profileImage="https://i.pravatar.cc/150?u=spam_bot",
        is_suspended=True,
    )

    db.add_all([admin, tech_guru, coffee_lover, dev_evelina, night_owl, spam_bot])
    db.commit()
    for u in [admin, tech_guru, coffee_lover, dev_evelina, night_owl, spam_bot]:
        db.refresh(u)

    # ── Posts ─────────────────────────────────────────────────────────────────

    p_admin1 = Post(
        content="Welcome to Fake Twitter! 🐦 Create your profile, follow interesting people, and start sharing your thoughts with the world. #Welcome",
        owner_id=admin.id,
        created_at=now() - datetime.timedelta(days=7),
    )
    p_admin2 = Post(
        content="Platform update: notifications are now live! You will be alerted when someone follows you, posts new content, or reposts your tweets. #Update #NewFeature",
        owner_id=admin.id,
        created_at=now() - datetime.timedelta(days=3),
    )

    p_tech1 = Post(
        content="Just published a deep-dive on #FastAPI and async Python. If you are building REST APIs in 2024, this is the framework to know. Automatic docs, type safety, blazing fast. 🚀 #Python #webdev #backend",
        owner_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=6),
    )
    p_tech2 = Post(
        content="Hot take: #TypeScript is just what JavaScript always needed. No more mysterious runtime type errors catching you off-guard in production 😅 #JavaScript #frontend #webdev",
        owner_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=5),
    )
    p_tech3 = Post(
        content="10 years in tech and I still Google 'how to center a div' occasionally. You are absolutely not alone out there. #webdev #frontend #relatable",
        owner_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=2),
    )

    p_coffee1 = Post(
        content="Morning ritual: double espresso, open laptop, stare at blank screen for 10 minutes. Productive day incoming ☕ #coffee #devlife",
        owner_id=coffee_lover.id,
        created_at=now() - datetime.timedelta(days=6, hours=2),
    )
    p_coffee2 = Post(
        content="The best debugging tool? A fresh cup of coffee and stepping away from the screen for 15 minutes. Works every single time. #coffeeAndCode #debugging",
        owner_id=coffee_lover.id,
        created_at=now() - datetime.timedelta(days=4),
    )
    p_coffee3 = Post(
        content="Spent 3 hours tracking down a production bug. Turned out to be a missing closing bracket on line 247. Three hours. Coffee definitely helped. #programming #debugging #devhumor",
        owner_id=coffee_lover.id,
        created_at=now() - datetime.timedelta(days=1, hours=5),
    )

    p_evelina1 = Post(
        content="Angular standalone components have completely changed how I structure my apps. The boilerplate reduction is massive – no more NgModule for every little thing. Highly recommend making the switch! #Angular #frontend #TypeScript",
        owner_id=dev_evelina.id,
        created_at=now() - datetime.timedelta(days=5, hours=3),
    )
    p_evelina2 = Post(
        content="Finally got my FastAPI + Angular project running end-to-end. JWT auth, reactive personalized feeds, real-time notifications – the full package! Very happy with this stack 🎉 #webdev #FastAPI #Angular",
        owner_id=dev_evelina.id,
        created_at=now() - datetime.timedelta(days=3, hours=1),
    )
    p_evelina3 = Post(
        content="Friendly reminder: REST APIs are not just GET and POST. Use PUT for full updates, PATCH for partial updates, and DELETE for removal. Your API consumers will genuinely thank you. 🙏 #REST #API #backend",
        owner_id=dev_evelina.id,
        created_at=now() - datetime.timedelta(hours=18),
    )

    p_night1 = Post(
        content="2am thought: every bug you fix makes the code a little better. Every feature you ship makes the product a little more loved. Keep going. 🌙 #developer #motivation",
        owner_id=night_owl.id,
        created_at=now() - datetime.timedelta(days=4, hours=10),
    )
    p_night2 = Post(
        content="There is something almost poetic about debugging at night. Just you, the terminal, and the soft glow of the monitor. Pure, undistracted focus. #developer #nightlife #deepthoughts",
        owner_id=night_owl.id,
        created_at=now() - datetime.timedelta(days=1, hours=2),
    )

    p_spam1 = Post(
        content="BUY FOLLOWERS NOW!! CLICK HERE >>> totally-not-a-scam.biz #spam #free #money",
        owner_id=spam_bot.id,
        created_at=now() - datetime.timedelta(days=5),
    )

    all_posts = [
        p_admin1, p_admin2,
        p_tech1, p_tech2, p_tech3,
        p_coffee1, p_coffee2, p_coffee3,
        p_evelina1, p_evelina2, p_evelina3,
        p_night1, p_night2,
        p_spam1,
    ]
    db.add_all(all_posts)
    db.commit()
    for p in all_posts:
        db.refresh(p)

    # ── Reposts ───────────────────────────────────────────────────────────────

    rt_evelina_tech1 = Post(
        content=f"RT @{tech_guru.username}: {p_tech1.content[:80]}...",
        owner_id=dev_evelina.id,
        original_post_id=p_tech1.id,
        created_at=now() - datetime.timedelta(days=5, hours=1),
    )
    rt_coffee_evelina1 = Post(
        content=f"RT @{dev_evelina.username}: {p_evelina1.content[:80]}...",
        owner_id=coffee_lover.id,
        original_post_id=p_evelina1.id,
        created_at=now() - datetime.timedelta(days=4, hours=6),
    )
    rt_night_tech3 = Post(
        content=f"RT @{tech_guru.username}: {p_tech3.content[:80]}...",
        owner_id=night_owl.id,
        original_post_id=p_tech3.id,
        created_at=now() - datetime.timedelta(days=1, hours=22),
    )

    reposts = [rt_evelina_tech1, rt_coffee_evelina1, rt_night_tech3]
    db.add_all(reposts)
    db.commit()
    for r in reposts:
        db.refresh(r)

    # ── Comments ──────────────────────────────────────────────────────────────

    c1 = Comment(
        content="That 10-minute stare at the blank screen is practically mandatory in the morning 😄",
        post_id=p_coffee1.id, user_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=6, hours=1),
    )
    c2 = Comment(
        content="100% agree on TypeScript! We migrated our whole codebase last year and never looked back 🙌",
        post_id=p_tech2.id, user_id=dev_evelina.id,
        created_at=now() - datetime.timedelta(days=4, hours=22),
    )
    c3 = Comment(
        content="Great stack choice! I am learning Angular right now – any resource recommendations?",
        post_id=p_evelina2.id, user_id=coffee_lover.id,
        created_at=now() - datetime.timedelta(days=2, hours=23),
    )
    c4 = Comment(
        content="The official Angular docs have gotten really good lately! Fireship on YouTube is also excellent for quick deep-dives. Good luck! 🙂",
        post_id=p_evelina2.id, user_id=dev_evelina.id,
        created_at=now() - datetime.timedelta(days=2, hours=20),
    )
    c5 = Comment(
        content="Preach! Seeing POST used for absolutely everything in an API is genuinely painful 😅",
        post_id=p_evelina3.id, user_id=night_owl.id,
        created_at=now() - datetime.timedelta(hours=17),
    )
    c6 = Comment(
        content="My personal record is 4 hours chasing a bug that turned out to be a missing comma in a JSON config. I feel your pain 😭",
        post_id=p_coffee3.id, user_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=1, hours=4),
    )
    c7 = Comment(
        content="Beautiful words ❤️ Keep building, everyone – you are doing great!",
        post_id=p_night1.id, user_id=admin.id,
        created_at=now() - datetime.timedelta(days=4, hours=8),
    )
    c8 = Comment(
        content="This is exactly why I love this community 🙏",
        post_id=p_night1.id, user_id=coffee_lover.id,
        created_at=now() - datetime.timedelta(days=4, hours=7),
    )
    c9 = Comment(
        content="Totally agree about async – the performance difference on I/O-heavy endpoints is night and day.",
        post_id=p_tech1.id, user_id=night_owl.id,
        created_at=now() - datetime.timedelta(days=5, hours=20),
    )
    c10 = Comment(
        content="Welcome! Excited to be part of this platform 🎉",
        post_id=p_admin1.id, user_id=tech_guru.id,
        created_at=now() - datetime.timedelta(days=6, hours=23),
    )

    comments = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10]
    db.add_all(comments)
    db.commit()
    for c in comments:
        db.refresh(c)

    # ── Post Likes ────────────────────────────────────────────────────────────

    post_likes = [
        Like(user_id=coffee_lover.id, post_id=p_tech1.id),
        Like(user_id=dev_evelina.id,  post_id=p_tech1.id),
        Like(user_id=night_owl.id,    post_id=p_tech1.id),
        Like(user_id=night_owl.id,    post_id=p_tech2.id),
        Like(user_id=coffee_lover.id, post_id=p_tech2.id),
        Like(user_id=dev_evelina.id,  post_id=p_tech2.id),
        Like(user_id=tech_guru.id,    post_id=p_tech3.id),
        Like(user_id=dev_evelina.id,  post_id=p_tech3.id),
        Like(user_id=coffee_lover.id, post_id=p_tech3.id),
        Like(user_id=tech_guru.id,    post_id=p_coffee1.id),
        Like(user_id=night_owl.id,    post_id=p_coffee1.id),
        Like(user_id=dev_evelina.id,  post_id=p_coffee1.id),
        Like(user_id=admin.id,        post_id=p_coffee2.id),
        Like(user_id=tech_guru.id,    post_id=p_coffee2.id),
        Like(user_id=tech_guru.id,    post_id=p_coffee3.id),
        Like(user_id=night_owl.id,    post_id=p_coffee3.id),
        Like(user_id=coffee_lover.id, post_id=p_evelina1.id),
        Like(user_id=night_owl.id,    post_id=p_evelina1.id),
        Like(user_id=tech_guru.id,    post_id=p_evelina1.id),
        Like(user_id=admin.id,        post_id=p_evelina2.id),
        Like(user_id=tech_guru.id,    post_id=p_evelina2.id),
        Like(user_id=coffee_lover.id, post_id=p_evelina2.id),
        Like(user_id=night_owl.id,    post_id=p_evelina2.id),
        Like(user_id=tech_guru.id,    post_id=p_evelina3.id),
        Like(user_id=night_owl.id,    post_id=p_evelina3.id),
        Like(user_id=coffee_lover.id, post_id=p_night1.id),
        Like(user_id=dev_evelina.id,  post_id=p_night1.id),
        Like(user_id=admin.id,        post_id=p_night1.id),
        Like(user_id=tech_guru.id,    post_id=p_night1.id),
        Like(user_id=dev_evelina.id,  post_id=p_night2.id),
        Like(user_id=coffee_lover.id, post_id=p_night2.id),
        Like(user_id=tech_guru.id,    post_id=p_admin1.id),
        Like(user_id=coffee_lover.id, post_id=p_admin1.id),
        Like(user_id=coffee_lover.id, post_id=p_admin2.id),
        Like(user_id=dev_evelina.id,  post_id=p_admin2.id),
        Like(user_id=tech_guru.id,    post_id=p_admin2.id),
    ]
    db.add_all(post_likes)
    db.commit()

    # ── Comment Likes ─────────────────────────────────────────────────────────

    comment_likes = [
        CommentLike(user_id=dev_evelina.id,  comment_id=c1.id),
        CommentLike(user_id=coffee_lover.id, comment_id=c1.id),
        CommentLike(user_id=night_owl.id,    comment_id=c2.id),
        CommentLike(user_id=coffee_lover.id, comment_id=c4.id),
        CommentLike(user_id=night_owl.id,    comment_id=c4.id),
        CommentLike(user_id=tech_guru.id,    comment_id=c5.id),
        CommentLike(user_id=dev_evelina.id,  comment_id=c5.id),
        CommentLike(user_id=coffee_lover.id, comment_id=c7.id),
        CommentLike(user_id=dev_evelina.id,  comment_id=c7.id),
        CommentLike(user_id=night_owl.id,    comment_id=c7.id),
        CommentLike(user_id=tech_guru.id,    comment_id=c9.id),
        CommentLike(user_id=dev_evelina.id,  comment_id=c10.id),
    ]
    db.add_all(comment_likes)
    db.commit()

    # ── Followers ─────────────────────────────────────────────────────────────
    #
    # tech_guru    ← coffee_lover, dev_evelina, night_owl
    # coffee_lover ← tech_guru, dev_evelina, night_owl
    # dev_evelina  ← tech_guru, coffee_lover, night_owl
    # night_owl    ← dev_evelina, tech_guru
    # admin        ← (everyone follows admin implicitly via feed; explicit follows below)

    follows = [
        Follower(follower_id=coffee_lover.id, followed_id=tech_guru.id),
        Follower(follower_id=dev_evelina.id,  followed_id=tech_guru.id),
        Follower(follower_id=night_owl.id,    followed_id=tech_guru.id),
        Follower(follower_id=tech_guru.id,    followed_id=coffee_lover.id),
        Follower(follower_id=dev_evelina.id,  followed_id=coffee_lover.id),
        Follower(follower_id=night_owl.id,    followed_id=coffee_lover.id),
        Follower(follower_id=tech_guru.id,    followed_id=dev_evelina.id),
        Follower(follower_id=coffee_lover.id, followed_id=dev_evelina.id),
        Follower(follower_id=night_owl.id,    followed_id=dev_evelina.id),
        Follower(follower_id=dev_evelina.id,  followed_id=night_owl.id),
        Follower(follower_id=tech_guru.id,    followed_id=night_owl.id),
    ]
    db.add_all(follows)
    db.commit()

    # ── Notifications ─────────────────────────────────────────────────────────

    notifications = [
        # Follow notifications
        Notification(user_id=tech_guru.id,    actor_id=coffee_lover.id, type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=6)),
        Notification(user_id=tech_guru.id,    actor_id=dev_evelina.id,  type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=5)),
        Notification(user_id=tech_guru.id,    actor_id=night_owl.id,    type="follow", is_read=False, created_at=now() - datetime.timedelta(days=2)),
        Notification(user_id=coffee_lover.id, actor_id=tech_guru.id,    type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=6)),
        Notification(user_id=coffee_lover.id, actor_id=dev_evelina.id,  type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=5)),
        Notification(user_id=coffee_lover.id, actor_id=night_owl.id,    type="follow", is_read=False, created_at=now() - datetime.timedelta(days=1)),
        Notification(user_id=dev_evelina.id,  actor_id=tech_guru.id,    type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=5)),
        Notification(user_id=dev_evelina.id,  actor_id=coffee_lover.id, type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=4)),
        Notification(user_id=dev_evelina.id,  actor_id=night_owl.id,    type="follow", is_read=False, created_at=now() - datetime.timedelta(days=1)),
        Notification(user_id=night_owl.id,    actor_id=dev_evelina.id,  type="follow", is_read=True,  created_at=now() - datetime.timedelta(days=4)),
        Notification(user_id=night_owl.id,    actor_id=tech_guru.id,    type="follow", is_read=False, created_at=now() - datetime.timedelta(days=2)),
        # New post notifications
        Notification(user_id=coffee_lover.id, actor_id=tech_guru.id,    post_id=p_tech1.id,    type="new_post", is_read=True,  created_at=p_tech1.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=tech_guru.id,    post_id=p_tech1.id,    type="new_post", is_read=True,  created_at=p_tech1.created_at),
        Notification(user_id=night_owl.id,    actor_id=tech_guru.id,    post_id=p_tech1.id,    type="new_post", is_read=True,  created_at=p_tech1.created_at),
        Notification(user_id=coffee_lover.id, actor_id=tech_guru.id,    post_id=p_tech2.id,    type="new_post", is_read=True,  created_at=p_tech2.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=tech_guru.id,    post_id=p_tech2.id,    type="new_post", is_read=True,  created_at=p_tech2.created_at),
        Notification(user_id=coffee_lover.id, actor_id=tech_guru.id,    post_id=p_tech3.id,    type="new_post", is_read=False, created_at=p_tech3.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=tech_guru.id,    post_id=p_tech3.id,    type="new_post", is_read=False, created_at=p_tech3.created_at),
        Notification(user_id=night_owl.id,    actor_id=tech_guru.id,    post_id=p_tech3.id,    type="new_post", is_read=False, created_at=p_tech3.created_at),
        Notification(user_id=tech_guru.id,    actor_id=dev_evelina.id,  post_id=p_evelina1.id, type="new_post", is_read=True,  created_at=p_evelina1.created_at),
        Notification(user_id=coffee_lover.id, actor_id=dev_evelina.id,  post_id=p_evelina1.id, type="new_post", is_read=True,  created_at=p_evelina1.created_at),
        Notification(user_id=night_owl.id,    actor_id=dev_evelina.id,  post_id=p_evelina1.id, type="new_post", is_read=True,  created_at=p_evelina1.created_at),
        Notification(user_id=tech_guru.id,    actor_id=dev_evelina.id,  post_id=p_evelina2.id, type="new_post", is_read=True,  created_at=p_evelina2.created_at),
        Notification(user_id=coffee_lover.id, actor_id=dev_evelina.id,  post_id=p_evelina2.id, type="new_post", is_read=False, created_at=p_evelina2.created_at),
        Notification(user_id=night_owl.id,    actor_id=dev_evelina.id,  post_id=p_evelina2.id, type="new_post", is_read=False, created_at=p_evelina2.created_at),
        Notification(user_id=tech_guru.id,    actor_id=dev_evelina.id,  post_id=p_evelina3.id, type="new_post", is_read=False, created_at=p_evelina3.created_at),
        Notification(user_id=night_owl.id,    actor_id=coffee_lover.id, post_id=p_coffee1.id,  type="new_post", is_read=True,  created_at=p_coffee1.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=night_owl.id,    post_id=p_night1.id,   type="new_post", is_read=True,  created_at=p_night1.created_at),
        Notification(user_id=tech_guru.id,    actor_id=night_owl.id,    post_id=p_night1.id,   type="new_post", is_read=True,  created_at=p_night1.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=night_owl.id,    post_id=p_night2.id,   type="new_post", is_read=False, created_at=p_night2.created_at),
        Notification(user_id=tech_guru.id,    actor_id=night_owl.id,    post_id=p_night2.id,   type="new_post", is_read=False, created_at=p_night2.created_at),
        # Repost notifications
        Notification(user_id=tech_guru.id,    actor_id=dev_evelina.id,  post_id=p_tech1.id,    type="repost", is_read=True,  created_at=rt_evelina_tech1.created_at),
        Notification(user_id=dev_evelina.id,  actor_id=coffee_lover.id, post_id=p_evelina1.id, type="repost", is_read=False, created_at=rt_coffee_evelina1.created_at),
        Notification(user_id=tech_guru.id,    actor_id=night_owl.id,    post_id=p_tech3.id,    type="repost", is_read=False, created_at=rt_night_tech3.created_at),
    ]
    db.add_all(notifications)
    db.commit()
    db.close()

    print("Seeding complete!")
    print(f"  Users      : 6  (1 admin, 4 regular, 1 suspended)")
    print(f"  Posts      : {len(all_posts)} original + {len(reposts)} reposts")
    print(f"  Comments   : {len(comments)}")
    print(f"  Post likes : {len(post_likes)}")
    print(f"  Cmnt likes : {len(comment_likes)}")
    print(f"  Follows    : {len(follows)}")
    print(f"  Notifs     : {len(notifications)}")
    print()
    print("Demo accounts (password: password123):")
    print("  admin        / admin123   [admin]")
    print("  tech_guru    / password123")
    print("  coffee_lover / password123")
    print("  dev_evelina  / password123")
    print("  night_owl    / password123")
    print("  spam_bot     / password123  [suspended]")


if __name__ == "__main__":
    database.Base.metadata.create_all(bind=engine)
    reset = "--reset" in sys.argv
    seed_db(reset=reset)
