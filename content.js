// Prevent multiple instances
if (window.twitchPointsClaimerActive) {
    console.log('Twitch Points Claimer already active');
} else {
    window.twitchPointsClaimerActive = true;
    
    // Content script for Twitch Points Claimer
    class TwitchPointsClaimer {
        constructor() {
            this.settings = {
                autoClaimPoints: true,
                autoClaimDrops: true,
                enableNotifications: true
            };
            this.isActive = false;
            this.observers = [];
            this.claimInterval = null;
            this.dropInterval = null;
            this.channelInfo = null;
            
            this.init();
        }

        async init() {
            console.log('Twitch Points Claimer initialized on:', window.location.href);
            
            // Wait for page to load
            await this.waitForPageLoad();
            
            // Load settings
            await this.loadSettings();
            
            // Get channel info
            this.updateChannelInfo();
            
            // Start the claimer
            this.start();
            
            // Listen for messages from popup
            chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                this.handleMessage(request, sender, sendResponse);
                return true;
            });
            
            // Listen for page navigation
            this.setupNavigationListener();
        }

        async waitForPageLoad() {
            return new Promise((resolve) => {
                if (document.readyState === 'complete') {
                    setTimeout(resolve, 2000); // Wait extra 2 seconds for Twitch to fully load
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(resolve, 2000);
                    });
                }
            });
        }

        async loadSettings() {
            try {
                const settings = await chrome.storage.sync.get({
                    autoClaimPoints: true,
                    autoClaimDrops: true,
                    enableNotifications: true
                });
                this.settings = settings;
                console.log('Settings loaded:', settings);
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }

        updateChannelInfo() {
            try {
                // Get channel name from URL
                const urlParts = window.location.pathname.split('/').filter(part => part);
                if (urlParts.length > 0 && urlParts[0] !== 'directory') {
                    const channelName = urlParts[0];
                    
                    // Try to get display name from page
                    const displayNameSelectors = [
                        '[data-a-target="stream-title"]',
                        'h1[data-a-target="stream-title"]',
                        '.channel-info-content h1',
                        '[data-testid="stream-info-card-component"] h2'
                    ];
                    
                    let displayName = channelName;
                    let category = 'Twitch Stream';
                    let avatar = null;
                    
                    // Try to find display name
                    for (const selector of displayNameSelectors) {
                        const element = document.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            displayName = element.textContent.trim();
                            break;
                        }
                    }
                    
                    // Try to find category
                    const categorySelectors = [
                        '[data-a-target="stream-game-link"]',
                        'a[data-a-target="stream-game-link"]',
                        '.game-name'
                    ];
                    
                    for (const selector of categorySelectors) {
                        const element = document.querySelector(selector);
                        if (element && element.textContent.trim()) {
                            category = element.textContent.trim();
                            break;
                        }
                    }
                    
                    // Try to find avatar
                    const avatarSelectors = [
                        '[data-a-target="channel-header-avatar"] img',
                        '.channel-header__avatar img'
                    ];
                    
                    for (const selector of avatarSelectors) {
                        const element = document.querySelector(selector);
                        if (element && element.src) {
                            avatar = element.src;
                            break;
                        }
                    }
                    
                    this.channelInfo = {
                        channelName: displayName,
                        category: category,
                        avatar: avatar
                    };
                    
                    console.log('Channel info updated:', this.channelInfo);
                }
            } catch (error) {
                console.error('Error updating channel info:', error);
            }
        }

        handleMessage(request, sender, sendResponse) {
            console.log('Content script received message:', request);
            
            switch (request.action) {
                case 'getStatus':
                    sendResponse({ active: this.isActive });
                    break;
                case 'getChannelInfo':
                    sendResponse(this.channelInfo);
                    break;
                case 'updateSettings':
                    this.settings = request.settings;
                    console.log('Settings updated:', this.settings);
                    this.restart();
                    sendResponse({ success: true });
                    break;
                case 'testClaim':
                    this.testClaim();
                    sendResponse({ success: true });
                    break;
            }
        }

        start() {
            if (this.isActive) return;
            
            this.isActive = true;
            console.log('Starting Twitch Points Claimer with settings:', this.settings);
            
            // Start point claiming interval
            if (this.settings.autoClaimPoints) {
                this.claimInterval = setInterval(() => {
                    this.claimChannelPoints();
                }, 3000); // Check every 3 seconds (less aggressive)
                console.log('Channel points auto-claiming enabled');
            }
            
            // Start drops claiming interval
            if (this.settings.autoClaimDrops) {
                this.dropInterval = setInterval(() => {
                    this.claimDrops();
                }, 8000); // Check every 8 seconds
                console.log('Drops auto-claiming enabled');
            }
            
            // Update session count
            this.updateSessionCount();
        }

        stop() {
            if (!this.isActive) return;
            
            this.isActive = false;
            console.log('Stopping Twitch Points Claimer');
            
            if (this.claimInterval) {
                clearInterval(this.claimInterval);
                this.claimInterval = null;
            }
            
            if (this.dropInterval) {
                clearInterval(this.dropInterval);
                this.dropInterval = null;
            }
        }

        restart() {
            console.log('Restarting claimer...');
            this.stop();
            setTimeout(() => this.start(), 2000);
        }

        async claimChannelPoints() {
            if (!this.settings.autoClaimPoints) return;
            
            try {
                // Updated selectors for 2024 Twitch layout
                const pointsSelectors = [
                    // Primary bonus claim button
                    'button[data-test-selector="community-points-summary"] div[data-test-selector="click-to-claim"]',
                    'button[aria-label*="Claim Bonus"]',
                    
                    // Community points summary buttons
                    '.community-points-summary button[aria-label*="Claim"]',
                    '[data-test-selector="community-points-summary"] button',
                    
                    // Alternative layouts
                    'button[data-a-target="player-overlay-claim-button"]',
                    '.community-points-summary .tw-button[aria-label*="Claim"]',
                    
                    // More generic selectors
                    'button:has([data-test-selector="click-to-claim"])',
                    'div[data-test-selector="community-points-summary"] button'
                ];
                
                for (const selector of pointsSelectors) {
                    try {
                        const button = document.querySelector(selector);
                        if (button && this.isElementVisible(button)) {
                            console.log(`Found points button with selector: ${selector}`);
                            
                            // Check if it's actually claimable
                            const buttonText = button.textContent || button.getAttribute('aria-label') || '';
                            if (buttonText.toLowerCase().includes('claim')) {
                                button.click();
                                console.log('✅ Channel points claimed!');
                                
                                await this.updateStats('points', 50);
                                
                                if (this.settings.enableNotifications) {
                                    this.showNotification('Channel points claimed! 🎉', 'success');
                                }
                                
                                return true;
                            }
                        }
                    } catch (selectorError) {
                        // Continue to next selector if this one fails
                        continue;
                    }
                }
                
                // Check for the glowing bonus indicator
                const bonusIndicators = document.querySelectorAll('[class*="points"], [class*="bonus"], [class*="claim"]');
                for (const indicator of bonusIndicators) {
                    if (this.isElementVisible(indicator) && indicator.closest('button')) {
                        const button = indicator.closest('button');
                        const computedStyle = window.getComputedStyle(indicator);
                        
                        // Look for glowing/animated elements (bonus points often have animations)
                        if (computedStyle.animationName !== 'none' || 
                            computedStyle.transform !== 'none' || 
                            indicator.textContent.toLowerCase().includes('claim')) {
                            
                            console.log('Found potential bonus indicator, clicking...');
                            button.click();
                            
                            await this.updateStats('points', 50);
                            if (this.settings.enableNotifications) {
                                this.showNotification('Bonus points claimed! 🎉', 'success');
                            }
                            return true;
                        }
                    }
                }
                
            } catch (error) {
                console.error('Error claiming channel points:', error);
            }
            return false;
        }

        async claimDrops() {
            if (!this.settings.autoClaimDrops) return;
            
            try {
                // Updated drops selectors
                const dropsSelectors = [
                    // Primary drops buttons
                    'button[data-a-target="drops-claim-button"]',
                    '[data-test-selector="drops-campaign-claim-button"]',
                    
                    // Drops notifications
                    'button[aria-label*="Claim Drop"]',
                    'button[aria-label*="Claim drop"]',
                    
                    // Drops overlay
                    '[data-test-selector="drops-root"] button:not([disabled])',
                    '.drops-campaign-details button[aria-label*="Claim"]',
                    
                    // Player overlay
                    'button[data-a-target="player-overlay-claim-button"]',
                    
                    // Inventory panel
                    '[data-test-selector="drops-list"] button[aria-label*="Claim"]'
                ];
                
                for (const selector of dropsSelectors) {
                    try {
                        const button = document.querySelector(selector);
                        if (button && this.isElementVisible(button) && !button.disabled) {
                            const buttonText = button.textContent || button.getAttribute('aria-label') || '';
                            if (buttonText.toLowerCase().includes('claim')) {
                                console.log(`Found drop button with selector: ${selector}`);
                                button.click();
                                
                                await this.updateStats('drops', 1);
                                console.log('✅ Drop claimed!');
                                
                                if (this.settings.enableNotifications) {
                                    this.showNotification('Drop claimed! 📦', 'success');
                                }
                                
                                return true;
                            }
                        }
                    } catch (selectorError) {
                        continue;
                    }
                }
                
                // Occasionally check inventory (10% chance)
                if (Math.random() < 0.1) {
                    this.checkDropsInventory();
                }
                
            } catch (error) {
                console.error('Error claiming drops:', error);
            }
            return false;
        }

        checkDropsInventory() {
            try {
                const inventoryButton = document.querySelector('[data-a-target="inventory-button"]');
                if (inventoryButton && this.isElementVisible(inventoryButton)) {
                    console.log('Checking drops inventory...');
                    inventoryButton.click();
                    
                    setTimeout(() => {
                        const claimButtons = document.querySelectorAll('[data-test-selector="DropsCampaignInProgressRewardPresentation"] button, [data-test-selector="drops-list"] button');
                        for (const button of claimButtons) {
                            if (button.textContent.toLowerCase().includes('claim') && !button.disabled) {
                                button.click();
                                console.log('Claimed drop from inventory');
                                break;
                            }
                        }
                        
                        // Close inventory
                        const closeButton = document.querySelector('[data-a-target="modal-close-button"]');
                        if (closeButton) closeButton.click();
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking drops inventory:', error);
            }
        }

        isElementVisible(element) {
            if (!element) return false;
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            
            return rect.width > 0 && 
                   rect.height > 0 && 
                   style.visibility !== 'hidden' && 
                   style.display !== 'none' && 
                   style.opacity !== '0';
        }

        async testClaim() {
            console.log('🧪 Testing claim functionality...');
            
            // Show test notification
            if (this.settings.enableNotifications) {
                this.showNotification('Running test claim...', 'info');
            }
            
            const pointsClaimed = await this.claimChannelPoints();
            const dropsClaimed = await this.claimDrops();
            
            setTimeout(() => {
                if (!pointsClaimed && !dropsClaimed) {
                    if (this.settings.enableNotifications) {
                        this.showNotification('No claimable items found at this time', 'warning');
                    }
                    console.log('Test complete: No claimable items found');
                } else {
                    console.log('Test complete: Found and claimed items');
                }
            }, 1000);
        }

        async updateStats(type, amount) {
            try {
                const stats = await chrome.storage.local.get({
                    totalPoints: 0,
                    totalDrops: 0
                });
                
                if (type === 'points') {
                    stats.totalPoints += amount;
                } else if (type === 'drops') {
                    stats.totalDrops += amount;
                }
                
                await chrome.storage.local.set(stats);
                console.log(`Stats updated - ${type}: +${amount}, Total points: ${stats.totalPoints}, Total drops: ${stats.totalDrops}`);
            } catch (error) {
                console.error('Error updating stats:', error);
            }
        }

        async updateSessionCount() {
            try {
                const stats = await chrome.storage.local.get({
                    sessionsToday: 0,
                    lastResetDate: new Date().toDateString()
                });
                
                const today = new Date().toDateString();
                if (stats.lastResetDate !== today) {
                    stats.sessionsToday = 1;
                    stats.lastResetDate = today;
                } else {
                    stats.sessionsToday += 1;
                }
                
                await chrome.storage.local.set(stats);
                console.log(`Session count updated: ${stats.sessionsToday}`);
            } catch (error) {
                console.error('Error updating session count:', error);
            }
        }

        showNotification(message, type = 'success') {
            if (!this.settings.enableNotifications) return;
            
            // Remove any existing notifications
            const existingNotifications = document.querySelectorAll('.twitch-claimer-notification');
            existingNotifications.forEach(notif => notif.remove());
            
            const notification = document.createElement('div');
            notification.className = 'twitch-claimer-notification';
            
            const colors = {
                success: 'linear-gradient(135deg, #51cf66 0%, #40c057 100%)',
                warning: 'linear-gradient(135deg, #ffd43b 0%, #fab005 100%)',
                error: 'linear-gradient(135deg, #ff6b6b 0%, #fa5252 100%)',
                info: 'linear-gradient(135deg, #74c0fc 0%, #339af0 100%)'
            };
            
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: ${colors[type] || colors.success};
                color: white;
                padding: 12px 18px;
                border-radius: 12px;
                font-size: 14px;
                font-weight: 600;
                z-index: 999999;
                box-shadow: 0 8px 25px rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                backdrop-filter: blur(10px);
                animation: slideInFromRight 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 280px;
                word-wrap: break-word;
            `;
            notification.textContent = message;
            
            // Add animation styles if not already present
            if (!document.getElementById('twitchClaimerStyles')) {
                const style = document.createElement('style');
                style.id = 'twitchClaimerStyles';
                style.textContent = `
                    @keyframes slideInFromRight {
                        from { 
                            transform: translateX(100%) scale(0.8); 
                            opacity: 0; 
                        }
                        to { 
                            transform: translateX(0) scale(1); 
                            opacity: 1; 
                        }
                    }
                    @keyframes slideOutToRight {
                        from { 
                            transform: translateX(0) scale(1); 
                            opacity: 1; 
                        }
                        to { 
                            transform: translateX(100%) scale(0.8); 
                            opacity: 0; 
                        }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            // Auto remove after 4 seconds
            setTimeout(() => {
                notification.style.animation = 'slideOutToRight 0.4s cubic-bezier(0.6, -0.28, 0.735, 0.045)';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 400);
            }, 4000);
        }

        setupNavigationListener() {
            let currentUrl = location.href;
            
            const observer = new MutationObserver((mutations) => {
                if (location.href !== currentUrl) {
                    console.log('Navigation detected:', currentUrl, '->', location.href);
                    currentUrl = location.href;
                    
                    // Update channel info on navigation
                    setTimeout(() => {
                        this.updateChannelInfo();
                        this.restart();
                    }, 3000); // Wait for new page to load
                }
            });
            
            observer.observe(document, { subtree: true, childList: true });
            this.observers.push(observer);
            
            // Also listen for popstate events
            window.addEventListener('popstate', () => {
                setTimeout(() => {
                    this.updateChannelInfo();
                    this.restart();
                }, 2000);
            });
        }
    }

        // Initialize the claimer
        console.log('Initializing Twitch Points Claimer...');
        new TwitchPointsClaimer();
    }