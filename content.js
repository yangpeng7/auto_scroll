// 自动滚动插件内容脚本

let scrollInterval = null;
let startTimeout = null;
let countdownInterval = null;
let isScrolling = false;
let currentSettings = {
    direction: 'down',
    speed: 3,
    interval: 50,
    smooth: true
};

// 监听来自popup的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'start') {
        startScrolling(request);
        sendResponse({success: true, isScrolling: true});
    } else if (request.action === 'stop') {
        stopScrolling();
        sendResponse({success: true, isScrolling: false});
    } else if (request.action === 'getStatus') {
        sendResponse({isScrolling: isScrolling});
    }
    
    return true; // 保持消息通道开放
});

// 开始滚动
function startScrolling(settings) {
    // 停止之前的滚动
    stopScrolling();
    
    // 更新设置
    currentSettings = {
        direction: settings.direction || 'down',
        speed: settings.speed || 3,
        interval: settings.interval || 50,
        smooth: settings.smooth !== false
    };
    
    isScrolling = true;
    
    // 显示倒计时
    showCountdown();
    
    // 延时5秒后开始滚动
    startTimeout = setTimeout(function() {
        if (isScrolling) { // 确保在延时期间没有被停止
            removeCountdown();
            scrollInterval = setInterval(function() {
                performScroll();
            }, currentSettings.interval);
        }
    }, 5000);
}

// 停止滚动
function stopScrolling() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
    if (startTimeout) {
        clearTimeout(startTimeout);
        startTimeout = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    removeCountdown();
    isScrolling = false;
}

// 执行滚动
function performScroll() {
    const scrollDistance = currentSettings.speed * 2; // 增加滚动距离
    const direction = currentSettings.direction;
    
    if (currentSettings.smooth) {
        // 平滑滚动
        const targetY = window.pageYOffset + (direction === 'down' ? scrollDistance : -scrollDistance);
        window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
    } else {
        // 立即滚动
        window.scrollBy(0, direction === 'down' ? scrollDistance : -scrollDistance);
    }
    
    // 检查是否到达页面底部或顶部
    if (direction === 'down' && window.pageYOffset + window.innerHeight >= document.body.scrollHeight) {
        // 到达底部，自动停止滚动
        stopScrolling();
    } else if (direction === 'up' && window.pageYOffset <= 0) {
        // 到达顶部，自动停止滚动
        stopScrolling();
    }
}

// 键盘快捷键支持
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Shift + S 开始/停止滚动
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'S') {
        event.preventDefault();
        if (isScrolling) {
            stopScrolling();
        } else {
            startScrolling(currentSettings);
        }
    }
    
    // ESC 键停止滚动
    if (event.key === 'Escape' && isScrolling) {
        stopScrolling();
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', function() {
    stopScrolling();
});

// 监听页面焦点变化
document.addEventListener('visibilitychange', function() {
    if (document.hidden && isScrolling) {
        // 页面隐藏时暂停滚动
        stopScrolling();
    }
});

// 显示倒计时
function showCountdown() {
    // 移除已存在的倒计时
    removeCountdown();
    
    let countdown = 5;
    
    const countdownElement = document.createElement('div');
    countdownElement.id = 'auto-scroll-countdown';
    countdownElement.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 30px;
            border-radius: 50px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 48px;
            font-weight: bold;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 255, 255, 0.1);
            min-width: 120px;
            animation: countdownPulse 1s ease-in-out infinite alternate;
        ">
            <div id="countdown-number">${countdown}</div>
            <div style="
                font-size: 14px;
                margin-top: 10px;
                opacity: 0.8;
                font-weight: normal;
            ">自动滚动即将开始</div>
        </div>
        <style>
            @keyframes countdownPulse {
                from { transform: translate(-50%, -50%) scale(0.95); }
                to { transform: translate(-50%, -50%) scale(1.05); }
            }
        </style>
    `;
    
    document.body.appendChild(countdownElement);
    
    // 更新倒计时数字
    countdownInterval = setInterval(function() {
        countdown--;
        const numberElement = document.getElementById('countdown-number');
        if (numberElement) {
            numberElement.textContent = countdown;
        }
        
        if (countdown <= 0) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
    }, 1000);
}

// 移除倒计时
function removeCountdown() {
    const countdownElement = document.getElementById('auto-scroll-countdown');
    if (countdownElement) {
        countdownElement.remove();
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
} 