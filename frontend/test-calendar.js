
const fs = require('fs');
const path = require('path');

// 读取JavaScript代码
let scriptContent;
try {
  scriptContent = fs.readFileSync(path.resolve(__dirname, 'js', 'script.js'), 'utf8');
} catch (e) {
  console.error('读取JavaScript代码失败:', e);
  process.exit(1);
}

// 提取生成日历的函数
const functionMatch = scriptContent.match(/function generateCalendar\([\s\S]*?\}\s*?\n/g);
if (!functionMatch) {
  console.error('未找到generateCalendar函数');
  process.exit(1);
}
const generateCalendar = functionMatch[0];

// 模拟DOM对象
const mockCalendarGrid = {
  innerHTML: '',
  appendChild: function(element) {
    console.log(`添加元素: ${element.textContent}`);
  }
};

// 模拟API响应
const apiResponse = {
  days: [
    {"day":1,"status":"absent"},{"day":2,"status":"absent"},{"day":3,"status":"absent"},{"day":4,"status":"absent"},{"day":5,"status":"absent"},{"day":6,"status":"absent"},{"day":7,"status":"absent"},{"day":8,"status":"absent"},{"day":9,"status":"absent"},{"day":10,"status":"absent"},{"day":11,"status":"absent"},{"day":12,"status":"absent"},{"day":13,"status":"absent"},{"day":14,"status":"absent"},{"day":15,"status":"absent"},{"day":16,"status":"absent"},{"day":17,"status":"absent"},{"day":18,"status":"absent"},{"day":19,"status":"exercised"},{"day":20,"status":"absent"},{"day":21,"status":"exercised"},{"day":22,"status":"exercised"},{"day":23,"status":"exercised"},{"day":24,"status":"default"},{"day":25,"status":"default"},{"day":26,"status":"default"},{"day":27,"status":"default"},{"day":28,"status":"default"}
  ],
  stats: {"absent":19,"exercised":4,"leave":0}
};

// 执行测试
console.log('=== 测试generateCalendar函数 ===');
try {
  // 执行生成日历的函数
  const func = new Function('calendarGrid', 'daysData', `
    ${generateCalendar}
    return generateCalendar(daysData);
  `);
  
  func(mockCalendarGrid, apiResponse.days);
  console.log('=== 函数执行成功 ===');
  
} catch (e) {
  console.error('函数执行失败:', e);
  console.error(e.stack);
}
