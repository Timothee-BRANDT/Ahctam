import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from werkzeug.security import generate_password_hash
import os
import requests
import base64
import random
import string
from faker import Faker
from dotenv import load_dotenv
load_dotenv()


def create_database():
    print('Creating database...')
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            # user=current_app.config['POSTGRES_USER'],
            # password=current_app.config['POSTGRES_PASSWORD'],
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5433'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        # Check if database exists
        cur.execute("""
SELECT 1
FROM pg_database
WHERE datname = %s
        """, (os.getenv('POSTGRES_DB'),))
        if cur.fetchone():
            print('Database already exists')
            return

        cur.execute(sql.SQL('CREATE DATABASE {}').format(
            sql.Identifier(os.getenv('POSTGRES_DB'))))
        # cur.execute(sql.SQL('CREATE DATABASE {}').format(
        #    sql.Identifier(current_app.config['POSTGRES_DB'])))
        print('Database created successfully')
    except Exception as e:
        print(e)
    finally:
        cur.close()
        conn.close()


def create_users_table(cursor):
    print('Creating users table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL,
            firstname VARCHAR(50) NOT NULL,
            lastname VARCHAR(50) NOT NULL,
            age SMALLINT,
            email VARCHAR(50) NOT NULL,
            password VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT FALSE,
            gender VARCHAR(20),
            sexual_preferences VARCHAR(50),
            biography TEXT,
            fame INTEGER DEFAULT 0,
            last_connexion TIMESTAMP,
            status VARCHAR(24) DEFAULT 'offline',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)


def create_reports_table(cursor):
    print('Creating reports table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id SERIAL PRIMARY KEY,
            reporter_id INTEGER NOT NULL,
            reported_id INTEGER NOT NULL,
            reason TEXT,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'pending',
            FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (reporter_id, reported_id)
        );
    """)


def create_conversations_table(cursor):
    print('Creating conversations table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            user1 INTEGER NOT NULL,
            user2 INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user1) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user2) REFERENCES users(id) ON DELETE CASCADE,
            CHECK (user1 < user2),
            UNIQUE (user1, user2)
        );
    """)


def create_messages_table(cursor):
    print('Creating messages table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)


def create_matches_table(cursor):
    print('Creating matches table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS matches (
            id SERIAL PRIMARY KEY,
            user1 INTEGER NOT NULL,
            user2 INTEGER NOT NULL,
            FOREIGN KEY (user1) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user2) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user1, user2)
        );
    """)


def create_pictures_table(cursor):
    print('Creating pictures table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pictures (
            id SERIAL PRIMARY KEY,
            url VARCHAR NOT NULL,
            is_profile_picture BOOLEAN DEFAULT FALSE,
            owner INTEGER NOT NULL,
            FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE,
            CONSTRAINT unique_profile_picture UNIQUE(owner)
            WHERE is_profile_picture = TRUE
        );
    """)


def create_views_table(cursor):
    print('Creating views table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS views (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_viewed INTEGER NOT NULL,
            viewer INTEGER NOT NULL,
            FOREIGN KEY (user_viewed) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (viewer) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_viewed, viewer)
        );
    """)


def create_likes_table(cursor):
    print('Creating likes table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            liker INTEGER NOT NULL,
            user_liked INTEGER NOT NULL,
            FOREIGN KEY (liker) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (user_liked) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (liker, user_liked)
        );
    """)


def create_locations_table(cursor):
    print('Creating locations table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            longitude DECIMAL(9, 6) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            city VARCHAR(100),
            address VARCHAR(100),
            located_user INTEGER UNIQUE NOT NULL,
            FOREIGN KEY (located_user) REFERENCES users(id) ON DELETE CASCADE
        );
    """)


def create_notifications_table(cursor):
    print('Creating notifications table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message VARCHAR(255),
            status VARCHAR(50),
            sender INTEGER NOT NULL,
            receiver INTEGER NOT NULL,
            FOREIGN KEY (sender) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver) REFERENCES users(id) ON DELETE CASCADE
        );
    """)


def create_blocks_table(cursor):
    print('Creating blocks table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blocks (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_blocked INTEGER NOT NULL,
            blocker INTEGER NOT NULL,
            FOREIGN KEY (user_blocked) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (blocker) REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_blocked, blocker)
        );
    """)


def create_interests_table(cursor):
    print('Creating interests table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );
    """)


def create_user_interests_table(cursor):
    print('Creating user_interests table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_interests (
            user_id INTEGER NOT NULL,
            interest_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, interest_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (interest_id) REFERENCES interests(id),
            CONSTRAINT unique_user_interest UNIQUE(user_id, interest_id)
        );
    """)


def create_refresh_tokens_table(cursor):
    print('Creating refresh_tokens table...')
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            user_id INTEGER NOT NULL,
            expiration_date TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    """)


def insert_interests(cursor):
    print('Inserting interests...')
    interests = [
        'Tunnels', 'Obstacle', 'Naps', 'Vegetable', 'Chewing', 'Rolling',
        'Baths', 'Hide', 'Collecting', 'Nests', 'Contests', 'Grooming',
        'Nibbling', 'Cuddles', 'Outdoor', 'Company', 'Music',
        'Races', 'Flavors', 'Hiding', 'Carrots'
    ]
    query = """
INSERT INTO interests (name)
VALUES (%s)
    """
    try:
        cursor.executemany(query, [(interest,) for interest in interests])
    except Exception as e:
        raise ValueError(e)


def generate_random_image_string():
    try:
        response = requests.get("https://picsum.photos/200", stream=True)
        if response.status_code != 200:
            raise Exception("Error fetching image from picsum.photos")

        image_data = base64.b64encode(response.content).decode('utf-8')
        image_string = f"data:image/png;base64,{image_data}"
        return image_string

    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def insert_random_users(cursor, num_users=100):
    print('Inserting random users...')
    fake = Faker()
    genders = ['male', 'female', 'other']
    sexual_preferences = ['male', 'female', 'both']
    interests = [
        'Tunnels', 'Obstacle', 'Naps', 'Vegetable', 'Chewing', 'Rolling',
        'Baths', 'Hide', 'Collecting', 'Nests', 'Contests', 'Grooming',
        'Nibbling', 'Cuddles', 'Outdoor', 'Company', 'Music',
        'Races', 'Flavors', 'Hiding', 'Carrots'
    ]

    for _ in range(num_users):
        username = fake.user_name()
        firstname = fake.first_name()
        lastname = fake.last_name()
        age = random.randint(18, 70)
        email = fake.email()
        password = generate_password_hash('Bobby123!')
        gender = random.choice(genders)
        sexual_preference = random.choice(sexual_preferences)
        biography = fake.text()
        fame = random.randint(0, 100)

        # User
        cursor.execute("""
INSERT INTO users (username, firstname, lastname, age, email, password, is_active, gender, sexual_preferences, biography, fame)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
RETURNING id
        """, (username, firstname, lastname, age, email, password, True, gender, sexual_preference, biography, fame))

        user_id = cursor.fetchone()[0]

        # Picture
        image = generate_random_image_string()
        if image is None:
            continue
        cursor.execute("""
INSERT INTO pictures (url, is_profile_picture, owner)
VALUES (%s, %s, %s)
        """, (image, True, user_id))

        # Interests
        user_interests = random.sample(interests, random.randint(1, 5))
        for interest in user_interests:
            cursor.execute("""
INSERT INTO user_interests (user_id, interest_id)
VALUES (%s, (SELECT id FROM interests WHERE name=%s))
            """, (user_id, interest))

        # Location
        longitude = fake.longitude()
        latitude = fake.latitude()
        city = fake.city()
        address = fake.address()
        cursor.execute("""
INSERT INTO locations (longitude, latitude, city, address, located_user)
VALUES (%s, %s, %s, %s, %s)
        """, (longitude, latitude, city, address, user_id))

        # Likes
        cursor.execute("SELECT id FROM users")
        user_ids = [row[0] for row in cursor.fetchall()]
        for _ in range(random.randint(0, 10)):
            liker = user_id
            user_liked = random.choice(user_ids)
            if liker != user_liked:
                cursor.execute("""
INSERT INTO likes (liker, user_liked)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
                """, (liker, user_liked))

        # Views
        for _ in range(random.randint(0, 10)):
            viewer = user_id
            user_viewed = random.choice(user_ids)
            if viewer != user_viewed:
                cursor.execute("""
INSERT INTO views (viewer, user_viewed)
VALUES (%s, %s)
ON CONFLICT DO NOTHING
                """, (viewer, user_viewed))


def create_all_tables():
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host='localhost',
        port='5433'
    )
    cursor = conn.cursor()
    try:
        create_users_table(cursor)
        create_matches_table(cursor)
        create_pictures_table(cursor)
        create_views_table(cursor)
        create_likes_table(cursor)
        create_locations_table(cursor)
        create_notifications_table(cursor)
        create_blocks_table(cursor)
        create_interests_table(cursor)
        create_user_interests_table(cursor)
        create_refresh_tokens_table(cursor)
        create_conversations_table(cursor)
        create_messages_table(cursor)
        insert_interests(cursor)

        insert_random_users(cursor, 100)

        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    create_database()
    create_all_tables()
