from database import get_db_connection
import datetime

def get_month_records(year, month):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
    SELECT day, status FROM fitness_records 
    WHERE year = ? AND month = ?
    ORDER BY day
    ''', (year, month))
    
    records = cursor.fetchall()
    conn.close()
    
    # 转换为字典格式
    result = {}
    for record in records:
        result[record['day']] = record['status']
    
    return result

def update_status(year, month, day, status):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 检查是否已存在记录
    cursor.execute('''
    SELECT id FROM fitness_records 
    WHERE year = ? AND month = ? AND day = ?
    ''', (year, month, day))
    
    existing = cursor.fetchone()
    
    if existing:
        # 更新现有记录
        cursor.execute('''
        UPDATE fitness_records 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        ''', (status, existing['id']))
    else:
        # 插入新记录
        cursor.execute('''
        INSERT INTO fitness_records (year, month, day, status) 
        VALUES (?, ?, ?, ?)
        ''', (year, month, day, status))
    
    conn.commit()
    conn.close()
    return True

def get_month_stats(year, month):
    records = get_month_records(year, month)
    
    stats = {
        'exercised': 0,
        'absent': 0,
        'leave': 0
    }
    
    for status in records.values():
        if status in stats and status != 'default':
            stats[status] += 1
    
    return stats

def get_consecutive_exercised_days(year, month, day):
    """获取连续打卡天数"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    consecutive_days = 0
    current_date = datetime.date(year, month, day)
    
    # 从当前日期往前找，直到遇到非锻炼的日期
    while True:
        cursor.execute('''
        SELECT status FROM fitness_records 
        WHERE year = ? AND month = ? AND day = ?
        ''', (current_date.year, current_date.month, current_date.day))
        
        record = cursor.fetchone()
        
        # 如果当天是锻炼状态，连续天数+1
        if record and record['status'] == 'exercised':
            consecutive_days += 1
            # 前一天
            current_date -= datetime.timedelta(days=1)
        else:
            break
    
    conn.close()
    return consecutive_days