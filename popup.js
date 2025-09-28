document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    
    // Load saved settings and stats
    await loadSettings();
    await updateStats();
    await checkTwitchStatus();

    // Event listeners for toggles
    document.getElementById('autoClaimPoints').addEventListener('change', saveSettings);
    document.getElementById('autoClaimDrops').addEventListener('change', saveSettings);
    document.getElementById('enableNotifications').addEventListener('change', saveSettings);

    // Event listeners for buttons
    document.getElementById('resetStats').addEventListener('click', resetStats);
    document.getElementById('testClaim').addEventListener('click', testClaim);
    document.getElementById('openTwitch').addEventListener('click', openTwitch);
    document.getElementById('openDashboard').addEventListener('click', openDashboard);
    
    // Info modal event listeners
    document.getElementById('infoButton').addEventListener('click', openInfoModal);
    document.getElementById('closeModal').addEventListener('click', closeInfoModal);
    document.getElementById('infoModal').addEventListener('click', (e) => {
        if (e.target.id === 'infoModal') closeInfoModal();
    });

    // Update stats and status periodically
    setInterval(updateStats, 3000);
    setInterval(checkTwitchStatus, 2000);
});

function openInfoModal() {
    document.getElementById('infoModal').style.display = 'flex';
}

function closeInfoModal() {
    const modal = document.getElementById('infoModal');
    modal.style.animation = 'modalFadeOut 0.3s ease';
    setTimeout(() => {
        modal.style.display = 'none';
        modal.style.animation = '';
    }, 300);
}

async function loadSettings() {
    const settings = await chrome.storage.sync.get({
        autoClaimPoints: true,
        autoClaimDrops: true,
        enableNotifications: true
    });

    document.getElementById('autoClaimPoints').checked = settings.autoClaimPoints;
    document.getElementById('autoClaimDrops').checked = settings.autoClaimDrops;
    document.getElementById('enableNotifications').checked = settings.enableNotifications;
}

async function saveSettings() {
    const settings = {
        autoClaimPoints: document.getElementById('autoClaimPoints').checked,
        autoClaimDrops: document.getElementById('autoClaimDrops').checked,
        enableNotifications: document.getElementById('enableNotifications').checked
    };

    await chrome.storage.sync.set(settings);
    
    // Notify content script of settings change
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('twitch.tv')) {
            chrome.tabs.sendMessage(tab.id, { action: 'updateSettings', settings });
        }
    } catch (error) {
        console.log('Could not send message to content script:', error);
    }
}

async function updateStats() {
    const stats = await chrome.storage.local.get({
        totalPoints: 0,
        totalDrops: 0,
        sessionsToday: 0,
        lastResetDate: new Date().toDateString()
    });

    // Reset daily stats if it's a new day
    const today = new Date().toDateString();
    if (stats.lastResetDate !== today) {
        await chrome.storage.local.set({
            sessionsToday: 0,
            lastResetDate: today
        });
        stats.sessionsToday = 0;
    }

    document.getElementById('totalPoints').textContent = stats.totalPoints.toLocaleString();
    document.getElementById('totalDrops').textContent = stats.totalDrops;
    document.getElementById('sessionsToday').textContent = stats.sessionsToday;
}

async function checkTwitchStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const notOnTwitchSection = document.getElementById('notOnTwitch');
        const onTwitchSection = document.getElementById('onTwitch');
        const statusIndicator = document.getElementById('statusIndicator');
        const statusText = document.getElementById('statusText');
        
        if (tab && tab.url && tab.url.includes('twitch.tv')) {
            // Show Twitch interface
            notOnTwitchSection.style.display = 'none';
            onTwitchSection.style.display = 'block';
            
            // Get channel info
            await updateChannelInfo(tab);
            
            // Try to get status from content script
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
                if (response && response.active) {
                    statusIndicator.classList.remove('loading');
                    statusIndicator.classList.add('active');
                    statusText.textContent = 'Active - Auto claiming enabled';
                } else if (response) {
                    statusIndicator.classList.remove('loading', 'active');
                    statusText.textContent = 'Connected - Monitoring for claims';
                } else {
                    statusIndicator.classList.remove('active');
                    statusIndicator.classList.add('loading');
                    statusText.textContent = 'Connecting...';
                }
            } catch (error) {
                statusIndicator.classList.remove('active');
                statusIndicator.classList.add('loading');
                statusText.textContent = 'Initializing...';
                
                // Try to inject content script
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                } catch (injectError) {
                    console.log('Content script injection failed:', injectError);
                }
            }
        } else {
            // Show not on Twitch interface
            notOnTwitchSection.style.display = 'block';
            onTwitchSection.style.display = 'none';
        }
    } catch (error) {
        console.log('Error checking Twitch status:', error);
        // Show not on Twitch interface as fallback
        document.getElementById('notOnTwitch').style.display = 'block';
        document.getElementById('onTwitch').style.display = 'none';
    }
}

async function updateChannelInfo(tab) {
    const channelInfo = document.getElementById('channelInfo');
    const channelName = document.getElementById('channelName');
    const channelCategory = document.getElementById('channelCategory');
    const channelAvatar = document.getElementById('channelAvatar');
    
    try {
        // Extract channel name from URL
        const url = new URL(tab.url);
        const pathParts = url.pathname.split('/').filter(part => part);
        
        if (pathParts.length > 0 && pathParts[0] !== 'directory') {
            const channel = pathParts[0];
            
            // Try to get channel info from content script
            try {
                const response = await chrome.tabs.sendMessage(tab.id, { action: 'getChannelInfo' });
                if (response && response.channelName) {
                    channelName.textContent = response.channelName;
                    channelCategory.textContent = response.category || 'Twitch Stream';
                    if (response.avatar) {
                        channelAvatar.style.backgroundImage = `url(${response.avatar})`;
                    }
                } else {
                    // Fallback to URL-based channel name
                    channelName.textContent = channel;
                    channelCategory.textContent = 'Twitch Stream';
                }
            } catch (error) {
                // Fallback to URL-based channel name
                channelName.textContent = channel;
                channelCategory.textContent = 'Twitch Stream';
            }
            
            channelInfo.style.display = 'flex';
        } else {
            channelInfo.style.display = 'none';
        }
    } catch (error) {
        console.log('Error updating channel info:', error);
        channelInfo.style.display = 'none';
    }
}

async function resetStats() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        await chrome.storage.local.set({
            totalPoints: 0,
            totalDrops: 0,
            sessionsToday: 0
        });
        await updateStats();
        
        // Show notification if enabled
        const settings = await chrome.storage.sync.get({ enableNotifications: true });
        if (settings.enableNotifications) {
            showNotification('Statistics reset successfully!');
        }
    }
}

async function testClaim() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url && tab.url.includes('twitch.tv')) {
            chrome.tabs.sendMessage(tab.id, { action: 'testClaim' });
            showNotification('Test claim initiated!');
        } else {
            showNotification('Please navigate to Twitch.tv first!');
        }
    } catch (error) {
        showNotification('Error: Could not communicate with Twitch tab');
    }
}

async function openTwitch() {
    try {
        await chrome.tabs.create({
            url: 'https://www.twitch.tv/directory',
            active: true
        });
        window.close(); // Close popup after opening Twitch
    } catch (error) {
        console.error('Error opening Twitch:', error);
        showNotification('Error opening Twitch');
    }
}

function showNotification(message) {
    // Create a temporary notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #51cf66;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 250px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);