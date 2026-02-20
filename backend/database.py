import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'fitness.db')

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 创建表
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS fitness_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        day INTEGER NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # 创建索引
    cursor.execute('''
    CREATE INDEX IF NOT EXISTS idx_year_month_day 
    ON fitness_records(year, month, day)
    ''')
    
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()