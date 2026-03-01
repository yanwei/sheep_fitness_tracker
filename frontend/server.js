
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// 停止所有正在运行的服务器
function stopAllServers() {
    try {
        const child_process = require('child_process');
        const psOutput = child_process.execSync('ps aux | grep -E "(node|http.server)" | grep -v grep');
        const lines = psOutput.toString().split('\n');
        
        lines.forEach(line => {
            if (line.includes('node')) {
                const pid = parseInt(line.split(/\s+/)[1]);
                if (pid > 0 && pid !== process.pid) {
                    try {
                        process.kill(pid, 'SIGTERM');
                        console.log(`已停止进程: ${pid}`);
                    } catch (e) {
                        console.log(`无法停止进程: ${pid} - ${e}`);
                    }
                }
            }
        });
        
        return true;
    } catch (e) {
        console.log('无法获取运行中的进程');
        return false;
    }
}

// 代理API请求到Flask服务器
function proxyApiRequest(req, res) {
    const child_process = require('child_process');
    const parsedUrl = url.parse(req.url);
    
    console.log(`代理API请求: ${req.url}`);
    
    // 构建Flask服务器的请求地址
    const flaskUrl = `http://127.0.0.1:5000${req.url}`;
    
    try {
        // 使用curl命令发送请求到Flask服务器
        const result = child_process.execSync(`curl -s "${flaskUrl}"`);
        const data = result.toString();
        
        console.log(`API响应成功: ${data.length} 字节`);
        
        // 返回响应
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(data);
    } catch (e) {
        console.error(`API代理失败: ${e}`);
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'API请求失败' }));
    }
}

// 创建简单的服务器
function createSimpleServer() {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url);
        const pathname = parsedUrl.pathname;
        
        console.log(`请求: ${req.method} ${req.url}`);
        
        // 代理API请求
        if (pathname.startsWith('/api')) {
            proxyApiRequest(req, res);
            return;
        }
        
        // 处理其他请求
        let contentType = 'text/html; charset=utf-8';
        
        if (pathname.endsWith('.css')) {
            contentType = 'text/css; charset=utf-8';
        } else if (pathname.endsWith('.js')) {
            contentType = 'application/javascript; charset=utf-8';
        }
        
        let filePath = '.' + pathname;
        if (filePath === './') {
            filePath = './index.html';
        }
        
        fs.readFile(filePath, (err, data) => {
            if (err) {
                console.error(`File not found: ${filePath}`);
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
                return;
            }
            
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
    
    const PORT = 8085;
    const HOST = '0.0.0.0';
    
    server.listen(PORT, HOST, () => {
        console.log('服务器已启动在端口', PORT);
        console.log('访问地址: http://127.0.0.1:8085/');
    });
    
    return server;
}

console.log('正在停止所有运行中的服务器...');
stopAllServers();

console.log('正在创建新服务器...');
const server = createSimpleServer();

console.log('服务器正在运行...');

process.on('SIGINT', () => {
    console.log('正在停止服务器...');
    server.close();
    process.exit(0);
});

module.exports = server;
