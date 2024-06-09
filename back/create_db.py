import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv
load_dotenv()


def create_database():
    try:
        conn = psycopg2.connect(
            dbname='postgres',
            # user=current_app.config['POSTGRES_USER'],
            # password=current_app.config['POSTGRES_PASSWORD'],
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD'),
            host='localhost',
            port='5432'
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
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
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)


def create_pictures_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pictures (
            id SERIAL PRIMARY KEY,
            url VARCHAR NOT NULL,
            is_profile_picture BOOLEAN DEFAULT FALSE,
            owner INTEGER NOT NULL,
            FOREIGN KEY (owner) REFERENCES users(id)
        );
    """)


def create_views_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS views (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_viewed INTEGER NOT NULL,
            viewer INTEGER NOT NULL,
            FOREIGN KEY (user_viewed) REFERENCES users(id),
            FOREIGN KEY (viewer) REFERENCES users(id)
        );
    """)


def create_likes_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            liker INTEGER NOT NULL,
            user_liked INTEGER NOT NULL,
            FOREIGN KEY (liker) REFERENCES users(id),
            FOREIGN KEY (user_liked) REFERENCES users(id),
            UNIQUE (liker, user_liked)
        );
    """)


def create_locations_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS locations (
            id SERIAL PRIMARY KEY,
            longitude DECIMAL(9, 6) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            city VARCHAR(100),
            located_user INTEGER NOT NULL,
            FOREIGN KEY (located_user) REFERENCES users(id)
        );
    """)


def create_notifications_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            message VARCHAR(255),
            status VARCHAR(50),
            sender INTEGER NOT NULL,
            receiver INTEGER NOT NULL,
            FOREIGN KEY (sender) REFERENCES users(id),
            FOREIGN KEY (receiver) REFERENCES users(id)
        );
    """)


def create_blocks_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS blocks (
            id SERIAL PRIMARY KEY,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            user_blocked INTEGER NOT NULL,
            blocker INTEGER NOT NULL,
            FOREIGN KEY (user_blocked) REFERENCES users(id),
            FOREIGN KEY (blocker) REFERENCES users(id),
            UNIQUE (user_blocked, blocker)
        );
    """)


def create_interests_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS interests (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL
        );
    """)


def create_user_interests_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_interests (
            user_id INTEGER NOT NULL,
            interest_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, interest_id),
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (interest_id) REFERENCES interests(id)
        );
    """)


def create_refresh_tokens_table(cursor):
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            token VARCHAR(255) NOT NULL,
            user_id INTEGER NOT NULL,
            expiration_date TIMESTAMP NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );
    """)


def insert_interests(conn, cursor):
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


def create_all_tables():
    conn = psycopg2.connect(
        dbname=os.getenv('POSTGRES_DB'),
        user=os.getenv('POSTGRES_USER'),
        password=os.getenv('POSTGRES_PASSWORD'),
        host='localhost',
        port='5432'
    )
    cursor = conn.cursor()
    try:
        create_users_table(cursor)
        create_pictures_table(cursor)
        create_views_table(cursor)
        create_likes_table(cursor)
        create_locations_table(cursor)
        create_notifications_table(cursor)
        create_blocks_table(cursor)
        create_interests_table(cursor)
        create_user_interests_table(cursor)
        create_refresh_tokens_table(cursor)

        insert_interests(conn, cursor)

        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"An error occurred: {e}")
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    create_all_tables()
