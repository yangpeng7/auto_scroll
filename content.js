// 自动滚动插件内容脚本

let scrollInterval = null;
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
    
    // 开始滚动循环
    scrollInterval = setInterval(function() {
        performScroll();
    }, currentSettings.interval);
}

// 停止滚动
function stopScrolling() {
    if (scrollInterval) {
        clearInterval(scrollInterval);
        scrollInterval = null;
    }
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
        // 到达底部，自动从顶部继续滚动
        window.scrollTo({top: 0, behavior: 'smooth'});
    } else if (direction === 'up' && window.pageYOffset <= 0) {
        // 到达顶部，自动从底部继续滚动
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
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