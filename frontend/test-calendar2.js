
// 独立的测试函数
function generateCalendar(daysData) {
  console.log('生成日历');
  
  // 模拟日历网格
  const calendarGrid = {
    innerHTML: '',
    appendChild: function(element) {
      console.log(`添加元素: ${element.textContent}`);
    }
  };
  
  calendarGrid.innerHTML = '';
  
  const currentYear = 2026;
  const currentMonth = 2;
  
  // 生成月份的日历网格
  const firstDay = new Date(currentYear, currentMonth - 1, 1);
  const lastDay = new Date(currentYear, currentMonth, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay()); // 从星期日开始
  
  console.log(`开始日期: ${startDate}`);
  console.log(`结束日期: ${lastDay}`);
  
  // 计算需要显示的周数
  const weeksToShow = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7);
  
  console.log(`需要显示的周数: ${weeksToShow}`);
  
  // 创建一个映射，方便查找每天的状态
  const dayStatusMap = {};
  daysData.forEach(day => {
    dayStatusMap[day.day] = day.status;
  });
  
  // 当前日期
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() + 1 === currentMonth;
  
  // 生成实际需要的格子数（weeksToShow * 7）
  for (let i = 0; i < weeksToShow * 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayElement = {
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
    
    // 检查是否是当前月份的日期
    if (currentDate.getMonth() + 1 === currentMonth) {
      const day = currentDate.getDate();
      dayElement.textContent = day;
      
      // 设置状态
      const status = dayStatusMap[day] || 'default';
      dayElement.classList.add(status);
      
      // 高亮当天
      if (isCurrentMonth && day === today.getDate()) {
        dayElement.classList.add('today');
      }
      
      // 检查是否已到期（不允许修改未来的日期）
      const isPastOrToday = isCurrentMonth && day <= today.getDate();
      const isPastMonth = currentYear < today.getFullYear() || (currentYear === today.getFullYear() && currentMonth < today.getMonth() + 1);
      
      if (isPastOrToday || isPastMonth) {
        // 添加点击事件
        dayElement.addEventListener('click', (e) => {
          console.log('点击了日期');
        });
      } else {
        // 未来日期，添加不可点击样式
        dayElement.style.cursor = 'default';
        dayElement.style.opacity = '0.6';
        
        // 添加点击事件，显示自定义提示
        dayElement.addEventListener('click', () => {
          console.log('不能修改未来日期的状态');
        });
      }
    } else {
      dayElement.classList.add('empty');
    }
    
    calendarGrid.appendChild(dayElement);
  }
}

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
  generateCalendar(apiResponse.days);
  console.log('=== 函数执行成功 ===');
  
} catch (e) {
  console.error('函数执行失败:', e);
  console.error(e.stack);
}
