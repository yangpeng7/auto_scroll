document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const toggleButton = document.getElementById('toggleScroll');
    const statusDiv = document.getElementById('status');
    const directionSelect = document.getElementById('direction');
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speedValue');
    const intervalSlider = document.getElementById('interval');
    const intervalValue = document.getElementById('intervalValue');
    const smoothScrollCheckbox = document.getElementById('smoothScroll');
    const resetButton = document.getElementById('resetSettings');
    
    let isScrolling = false;
    
    // 从存储中加载设置
    loadSettings();
    
    // 更新速度显示
    speedSlider.addEventListener('input', function() {
        speedValue.textContent = this.value;
        saveSettings();
        if (isScrolling) {
            sendMessageToContent();
        }
    });
    
    // 更新间隔显示
    intervalSlider.addEventListener('input', function() {
        intervalValue.textContent = this.value;
        saveSettings();
        if (isScrolling) {
            sendMessageToContent();
        }
    });
    
    // 方向改变
    directionSelect.addEventListener('change', function() {
        saveSettings();
        if (isScrolling) {
            sendMessageToContent();
        }
    });
    
    // 平滑滚动设置改变
    smoothScrollCheckbox.addEventListener('change', function() {
        saveSettings();
        if (isScrolling) {
            sendMessageToContent();
        }
    });
    
    // 开始/停止滚动
    toggleButton.addEventListener('click', function() {
        isScrolling = !isScrolling;
        updateUI();
        sendMessageToContent();
    });
    
    // 重置设置
    resetButton.addEventListener('click', function() {
        directionSelect.value = 'down';
        speedSlider.value = 3;
        speedValue.textContent = '3';
        intervalSlider.value = 50;
        intervalValue.textContent = '50';
        smoothScrollCheckbox.checked = true;
        saveSettings();
        
        if (isScrolling) {
            sendMessageToContent();
        }
    });
    
    // 更新UI状态
    function updateUI() {
        if (isScrolling) {
            toggleButton.textContent = '停止滚动';
            toggleButton.classList.add('active');
            statusDiv.textContent = '正在滚动...';
        } else {
            toggleButton.textContent = '开始滚动';
            toggleButton.classList.remove('active');
            statusDiv.textContent = '已停止';
        }
    }
    
    // 向内容脚本发送消息
    function sendMessageToContent() {
        const settings = {
            action: isScrolling ? 'start' : 'stop',
            direction: directionSelect.value,
            speed: parseInt(speedSlider.value),
            interval: parseInt(intervalSlider.value),
            smooth: smoothScrollCheckbox.checked
        };
        
        if (chrome && chrome.tabs) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, settings);
                }
            });
        }
    }
    
    // 保存设置到本地存储
    function saveSettings() {
        const settings = {
            direction: directionSelect.value,
            speed: speedSlider.value,
            interval: intervalSlider.value,
            smooth: smoothScrollCheckbox.checked
        };
        
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({autoScrollSettings: settings});
        }
    }
    
    // 从本地存储加载设置
    function loadSettings() {
        if (chrome && chrome.storage && chrome.storage.local) {
            chrome.storage.local.get(['autoScrollSettings'], function(result) {
                if (result.autoScrollSettings) {
                    const settings = result.autoScrollSettings;
                    directionSelect.value = settings.direction || 'down';
                    speedSlider.value = settings.speed || 3;
                    speedValue.textContent = settings.speed || 3;
                    intervalSlider.value = settings.interval || 50;
                    intervalValue.textContent = settings.interval || 50;
                    smoothScrollCheckbox.checked = settings.smooth !== false;
                }
            });
        }
    }
    
    // 检查当前页面的滚动状态
    if (chrome && chrome.tabs) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            if (tabs && tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {action: 'getStatus'}, function(response) {
                    if (response && response.isScrolling) {
                        isScrolling = true;
                        updateUI();
                    }
                });
            }
        });
    }
}); 