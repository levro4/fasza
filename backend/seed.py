import database
import auth
from database import SessionLocal, User, Post, Comment, Like, Follower

def seed_db():
    db = SessionLocal()

    # Check if we already have data
    if db.query(User).count() > 0:
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Seeding database with demo data...")

    # Create admin user
    admin = User(
        username="admin", 
        email="admin@faketwitter.com", 
        password_hash=auth.get_password_hash("admin123"), 
        role="admin",
        displayName="Admin User",
        is_suspended=False
    )
    
    # Create regular users
    user1 = User(
        username="johndoe", 
        email="john@example.com", 
        password_hash=auth.get_password_hash("password123"), 
        role="user",
        displayName="John Doe",
        profileImage="https://i.pinimg.com/736x/4e/43/47/4e4347489e411396189a611b05645ae2.jpg",
        bannerImage="https://i1-c.pinimg.com/webp85/1200x/41/6f/4e/416f4e6077fe57cb51a12171b7c4c22a.webp",
        is_suspended=False
    )
    user2 = User(
        username="janedoe", 
        email="jane@example.com", 
        password_hash=auth.get_password_hash("password123"), 
        role="user",
        displayName="Jane Doe",
        is_suspended=False
    )

    db.add(admin)
    db.add(user1)
    db.add(user2)
    db.commit()
    db.refresh(admin)
    db.refresh(user1)
    db.refresh(user2)

    # Create Posts
    post1 = Post(content="Hello world! This is my first tweet on Fake Twitter.", owner_id=user1.id, original_post_id=None)
    post2 = Post(content="FastAPI is amazing for building backends quickly.", owner_id=user2.id, original_post_id=None)
    post3 = Post(content="Admin message: Please follow the community guidelines.", owner_id=admin.id, original_post_id=None)
    post4 = Post(content="Just setting up my twttr clone.", owner_id=user1.id, original_post_id=None)

    db.add_all([post1, post2, post3, post4])
    db.commit()
    db.refresh(post1)
    db.refresh(post2)

    post5 = Post(content="This is a repost", owner_id=user2.id, original_post_id=post1.id)
    db.add(post5)
    db.commit()
    db.refresh(post5)

    # Create Comments
    comment1 = Comment(content="Welcome to the platform!", post_id=post1.id, user_id=admin.id)
    comment2 = Comment(content="I agree, it's very fast.", post_id=post2.id, user_id=user1.id)

    db.add(comment1)
    db.add(comment2)
    db.commit()

    # Create Likes
    like1 = Like(user_id=user1.id, post_id=post2.id)
    like2 = Like(user_id=user2.id, post_id=post1.id)
    like3 = Like(user_id=admin.id, post_id=post1.id)
    
    db.add_all([like1, like2, like3])
    db.commit()

    # Create Followers
    # user1 follows user2
    follower1 = Follower(follower_id=user1.id, followed_id=user2.id)
    # user2 follows user1
    follower2 = Follower(follower_id=user2.id, followed_id=user1.id)
    # user2 follows admin
    follower3 = Follower(follower_id=user2.id, followed_id=admin.id)

    db.add_all([follower1, follower2, follower3])
    db.commit()

    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    database.Base.metadata.create_all(bind=database.engine)
    seed_db()
