// Background script for Twitch Points Claimer
chrome.runtime.onInstalled.addListener(() => {
    console.log('Twitch Points Claimer extension installed');
    
    // Initialize default settings
    chrome.storage.sync.set({
        autoClaimPoints: true,
        autoClaimDrops: true,
        enableNotifications: true
    });
    
    // Initialize stats
    chrome.storage.local.set({
        totalPoints: 0,
        totalDrops: 0,
        sessionsToday: 0,
        lastResetDate: new Date().toDateString()
    });
});

// Listen for tab updates to ensure content script is working
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('twitch.tv')) {
        console.log('Twitch page loaded:', tab.url);
        
        // Small delay to let Twitch load
        setTimeout(async () => {
            try {
                // Test if content script is responsive
                const response = await chrome.tabs.sendMessage(tabId, { action: 'getStatus' });
                console.log('Content script is active:', response);
            } catch (error) {
                console.log('Content script not responding, attempting injection...');
                
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: ['content.js']
                    });
                    console.log('Content script injected successfully');
                } catch (injectionError) {
                    console.error('Failed to inject content script:', injectionError);
                }
            }
        }, 3000);
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);
    
    switch (request.action) {
        case 'updateStats':
            chrome.storage.local.get(['totalPoints', 'totalDrops'], (result) => {
                const updatedStats = {
                    totalPoints: (result.totalPoints || 0) + (request.points || 0),
                    totalDrops: (result.totalDrops || 0) + (request.drops || 0)
                };
                chrome.storage.local.set(updatedStats);
                sendResponse({ success: true });
            });
            return true;
            
        case 'showNotification':
            if (request.message && chrome.notifications) {
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icons/icon48.png',
                    title: 'Twitch Points Claimer',
                    message: request.message
                });
            }
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ success: false, error: 'Unknown action' });
    }
});

// Clean up old data periodically
chrome.alarms.create('cleanup', { delayInMinutes: 60, periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'cleanup') {
        chrome.storage.local.get(['lastResetDate'], (result) => {
            const today = new Date().toDateString();
            if (result.lastResetDate !== today) {
                chrome.storage.local.set({
                    sessionsToday: 0,
                    lastResetDate: today
                });
                console.log('Daily stats reset');
            }
        });
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('Extension started');
});

// Handle extension update
chrome.runtime.onUpdateAvailable.addListener(() => {
    console.log('Extension update available');
});