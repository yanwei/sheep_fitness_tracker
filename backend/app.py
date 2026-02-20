from flask import Flask
from flask_cors import CORS
from routes import api
from database import init_db

# 初始化数据库
init_db()

app = Flask(__name__)
CORS(app)  # 启用CORS，支持跨域请求

# 注册路由
app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)