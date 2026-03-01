
const fs = require('fs');
const vm = require('vm');

// 读取JavaScript代码
let scriptContent;
try {
  scriptContent = fs.readFileSync('./js/script.js', 'utf8');
} catch (e) {
  console.error('读取JavaScript代码失败:', e);
  process.exit(1);
}

// 模拟API响应
const apiResponse = {
  days: [
    {"day":1,"status":"absent"},{"day":2,"status":"absent"},{"day":3,"status":"absent"},{"day":4,"status":"absent"},{"day":5,"status":"absent"},{"day":6,"status":"absent"},{"day":7,"status":"absent"},{"day":8,"status":"absent"},{"day":9,"status":"absent"},{"day":10,"status":"absent"},{"day":11,"status":"absent"},{"day":12,"status":"absent"},{"day":13,"status":"absent"},{"day":14,"status":"absent"},{"day":15,"status":"absent"},{"day":16,"status":"absent"},{"day":17,"status":"absent"},{"day":18,"status":"absent"},{"day":19,"status":"exercised"},{"day":20,"status":"absent"},{"day":21,"status":"exercised"},{"day":22,"status":"exercised"},{"day":23,"status":"exercised"},{"day":24,"status":"default"},{"day":25,"status":"default"},{"day":26,"status":"default"},{"day":27,"status":"default"},{"day":28,"status":"default"}
  ],
  stats: {"absent":19,"exercised":4,"leave":0}
};

// 模拟浏览器环境
const sandbox = {
  document: {
    getElementById: function(id) {
      console.log(`Mock: getElementById(${id})`);
      return {
        textContent: '',
        style: {},
        classList: {
          add: function() {},
          contains: function() {}
        },
        addEventListener: function() {},
        innerHTML: '',
        appendChild: function() {},
        querySelectorAll: function() { return []; }
      };
    },
    createElement: function(tag) {
      console.log(`Mock: createElement(${tag})`);
      return {
        textContent: '',
        style: {},
        classList: {
          add: function() {},
          contains: function() {}
        },
        addEventListener: function() {},
        innerHTML: '',
        appendChild: function() {},
        querySelectorAll: function() { return []; }
      };
    },
    querySelectorAll: function(selector) {
      console.log(`Mock: querySelectorAll(${selector})`);
      const mockElements = [];
      for (let i = 0; i < 3; i++) {
        mockElements.push({
          textContent: '',
          style: {},
          classList: {
            add: function() {},
            contains: function() {}
          },
          addEventListener: function() {},
          innerHTML: '',
          appendChild: function() {},
          querySelectorAll: function() { return []; },
          dataset: { status: 'exercised' }
        });
      }
      return mockElements;
    },
    removeEventListener: function() {},
    body: {}
  },
  window: {
    location: { href: 'http://127.0.0.1:8085/' },
    history: {},
    addEventListener: function() {},
    removeEventListener: function() {},
    setTimeout: function() {},
    setInterval: function() {},
    alert: function() {},
    console: {
      log: function(msg) { console.log(msg); },
      error: function(msg) { console.error(msg); },
      warn: function(msg) { console.warn(msg); }
    },
    fetch: function() {
      console.log('Mock: fetch()');
      return Promise.resolve({
        json: function() {
          console.log('Mock: json()');
          return Promise.resolve(apiResponse);
        }
      });
    }
  },
  globalThis: this,
  global: this
};

// 将模拟对象添加到全局
sandbox.window.document = sandbox.document;
sandbox.window.window = sandbox.window;
sandbox.window.global = sandbox.global;
sandbox.window.globalThis = sandbox.globalThis;

// 创建上下文
const context = vm.createContext(sandbox);

// 执行JavaScript代码
console.log('=== 执行前端JavaScript代码 ===');
try {
  // 创建脚本
  const script = new vm.Script(scriptContent, { filename: 'script.js' });
  
  // 执行代码
  script.runInContext(context);
  
  console.log('=== 代码执行成功 ===');
  
} catch (e) {
  console.error('JavaScript执行失败:', e);
  console.error('堆栈:', e.stack);
}
