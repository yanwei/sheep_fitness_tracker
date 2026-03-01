// 全局变量
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1; // 月份从1开始
let selectedDay = null;

// DOM元素
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthElement = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const statusMenu = document.getElementById('status-menu');
const exercisedCount = document.getElementById('exercised-count');
const absentCount = document.getElementById('absent-count');
const leaveCount = document.getElementById('leave-count');

// 初始化
function init() {
    updateCurrentMonthDisplay();
    loadCalendarData();
    bindEvents();
    bindModalEvents();
}

// 更新当前月份显示
function updateCurrentMonthDisplay() {
    currentMonthElement.textContent = `${currentMonth}月`;
}

// 加载日历数据
async function loadCalendarData() {
    try {
        const response = await fetch(`/api/calendar?year=${currentYear}&month=${currentMonth}`);
        const data = await response.json();
        
        // 更新统计数据
        updateStats(data.stats);
        
        // 生成日历
        generateCalendar(data.days);
    } catch (error) {
        console.error('加载日历数据失败:', error);
    }
}

// 更新统计数据
function updateStats(stats) {
    exercisedCount.textContent = stats.exercised || 0;
    absentCount.textContent = stats.absent || 0;
    leaveCount.textContent = stats.leave || 0;
}

// 生成日历
function generateCalendar(daysData) {
    calendarGrid.innerHTML = '';
    
    // 生成月份的日历网格
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // 从星期日开始
    
    // 计算需要显示的周数
    const weeksToShow = Math.ceil((firstDay.getDay() + lastDay.getDate()) / 7);
    
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
        
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        
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
                    showStatusMenu(e, currentDate.getDate());
                });
            } else {
                // 未来日期，添加不可点击样式
                dayElement.style.cursor = 'default';
                dayElement.style.opacity = '0.6';
                
                // 添加点击事件，显示自定义提示
                dayElement.addEventListener('click', () => {
                    showModal('不能修改未来日期的状态');
                });
            }
        } else {
            dayElement.classList.add('empty');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// 显示状态选择菜单
function showStatusMenu(event, day) {
    selectedDay = day;
    
    // 显示菜单（位置由CSS固定在底部）
    statusMenu.style.display = 'block';
    
    // 点击其他地方关闭菜单
    document.addEventListener('click', closeStatusMenu);
}

// 关闭状态选择菜单
function closeStatusMenu(event) {
    if (!statusMenu.contains(event.target) && !event.target.classList.contains('calendar-day')) {
        statusMenu.style.display = 'none';
        document.removeEventListener('click', closeStatusMenu);
    }
}

// 绑定事件
function bindEvents() {
    // 月份切换
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 1) {
            currentMonth = 12;
            currentYear--;
        }
        updateCurrentMonthDisplay();
        loadCalendarData();
    });
    
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 12) {
            currentMonth = 1;
            currentYear++;
        }
        updateCurrentMonthDisplay();
        loadCalendarData();
    });
    
    // 点击月份显示切换到当前月份
    currentMonthElement.addEventListener('click', () => {
        const today = new Date();
        currentYear = today.getFullYear();
        currentMonth = today.getMonth() + 1;
        updateCurrentMonthDisplay();
        loadCalendarData();
    });
    
    // 状态选择
    document.querySelectorAll('.status-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            const status = e.target.dataset.status;
            await updateDayStatus(selectedDay, status);
            statusMenu.style.display = 'none';
        });
    });
}

// 更新单日状态
async function updateDayStatus(day, status) {
    try {
        const response = await fetch('/api/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                year: currentYear,
                month: currentMonth,
                day: day,
                status: status
            })
        });
        
        const result = await response.json();
        if (result.success) {
            // 重新加载日历数据
            loadCalendarData();
        } else {
            console.error('更新状态失败:', result.message);
        }
    } catch (error) {
        console.error('更新状态失败:', error);
    }
}

// 显示自定义模态对话框
function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modal-message');
    
    modalMessage.textContent = message;
    modal.style.display = 'flex';
}

// 关闭模态对话框
function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// 绑定模态对话框关闭按钮
function bindModalEvents() {
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // 绑定状态菜单关闭按钮
    const closeMenuBtn = document.getElementById('close-menu');
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            statusMenu.style.display = 'none';
            document.removeEventListener('click', closeStatusMenu);
        });
    }
}

// 初始化应用
init();

