import database
import auth
from database import SessionLocal, User, Post, Comment

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
        role="admin"
    )
    
    # Create regular users
    user1 = User(
        username="johndoe", 
        email="john@example.com", 
        password_hash=auth.get_password_hash("password123"), 
        role="user"
    )
    user2 = User(
        username="janedoe", 
        email="jane@example.com", 
        password_hash=auth.get_password_hash("password123"), 
        role="user"
    )

    db.add(admin)
    db.add(user1)
    db.add(user2)
    db.commit()

    # Create Posts
    post1 = Post(content="Hello world! This is my first tweet on Fake Twitter.", owner_id=user1.id, original_post_id=None)
    post2 = Post(content="FastAPI is amazing for building backends quickly.", owner_id=user2.id, original_post_id=None)
    post3 = Post(content="Admin message: Please follow the community guidelines.", owner_id=admin.id, original_post_id=None)
    post4 = Post(content="Just setting up my twttr clone.", owner_id=user1.id, original_post_id=None)
    post5 = Post(content="This is a repost", owner_id=user2.id, original_post_id=post1.id)

    db.add(post1)
    db.add(post2)
    db.add(post3)
    db.add(post4)
    db.add(post5)
    db.commit()

    # Create Comments
    comment1 = Comment(content="Welcome to the platform!", post_id=post1.id, user_id=admin.id)
    comment2 = Comment(content="I agree, it's very fast.", post_id=post2.id, user_id=user1.id)

    db.add(comment1)
    db.add(comment2)
    db.commit()

    print("Seeding complete!")
    db.close()

if __name__ == "__main__":
    database.Base.metadata.create_all(bind=database.engine)
    seed_db()