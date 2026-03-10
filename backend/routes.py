from flask import Blueprint, request, jsonify
from models import get_month_records, update_status, get_month_stats, get_consecutive_exercised_days
import calendar

api = Blueprint('api', __name__)

@api.route('/calendar', methods=['GET'])
def get_calendar():
    try:
        year = int(request.args.get('year'))
        month = int(request.args.get('month'))
        
        # 获取月份记录
        records = get_month_records(year, month)
        
        # 获取月份统计
        stats = get_month_stats(year, month)
        
        # 生成日历数据
        cal = calendar.monthcalendar(year, month)
        days_data = []
        
        for week in cal:
            for day in week:
                if day != 0:
                    days_data.append({
                        'day': day,
                        'status': records.get(day, 'default')  # 默认未设置
                    })
        
        return jsonify({
            'days': days_data,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/status', methods=['POST'])
def update_day_status():
    try:
        data = request.get_json()
        year = int(data.get('year'))
        month = int(data.get('month'))
        day = int(data.get('day'))
        status = data.get('status')
        
        # 验证状态值
        valid_statuses = ['exercised', 'absent', 'leave']
        if status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        # 更新状态
        success = update_status(year, month, day, status)
        
        if success:
            response_data = {'success': True, 'message': '状态更新成功'}
            
            # 如果是锻炼状态，计算连续打卡天数
            if status == 'exercised':
                consecutive_days = get_consecutive_exercised_days(year, month, day)
                response_data['consecutive_days'] = consecutive_days
            
            return jsonify(response_data)
        else:
            return jsonify({'success': False, 'message': '状态更新失败'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500