# Twitch Points Claimer Chrome Extension

⚠️ **Disclaimer / Educational Use Only**  
This extension is for **educational and personal use only**. It is intended to demonstrate Chrome extension development and automation concepts.  
The author does **not** encourage or endorse using this extension to interact with live Twitch accounts in violation of Twitch's Terms of Service.

**Important Risk Information:**
- Using this extension on a live Twitch account may **violate Twitch's Terms of Service**.  
- **Your Twitch account could be suspended or banned** if you use this on a live account.  
- The author is **not responsible** for any consequences arising from misuse.  
- Please use this extension strictly for learning, testing, or personal development in a controlled environment.

---

🎮 **Automatically claim Twitch channel points and drops with style!**

## Features

✨ **Auto Channel Points Claiming**
- Automatically detects and claims bonus channel points
- Works across all Twitch channels
- Smart detection with multiple fallback selectors

📦 **Auto Drops Claiming**  
- Automatically claims Twitch drops when available
- Monitors drops inventory and campaign progress
- Supports all types of drops (games, emotes, etc.)

📊 **Beautiful Statistics Tracking**
- Total points claimed counter
- Drops claimed tracking  
- Daily session statistics
- Persistent data storage

🎛️ **Smart Controls**
- Toggle auto-claiming on/off
- Enable/disable notifications
- Test claim functionality
- Reset statistics

🌟 **Modern UI**
- Beautiful gradient popup design
- Real-time status indicators
- Smooth animations and transitions
- Responsive toggle switches

---

## Installation

1. **Download the Extension**
   - Download all files to a folder named `twitch-points-claimer`
   - Ensure the folder structure matches the file layout

2. **Create Icons**
   - Create an `icons` folder inside your extension directory
   - Add icon files: `icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`
   - Use purple/Twitch-themed icons for best results

3. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right toggle)
   - Click "Load unpacked"
   - Select your `twitch-points-claimer` folder

4. **Start Using**
   - Navigate to any Twitch stream
   - Click the extension icon to open the popup
   - Configure your settings with the toggles
   - Watch your points accumulate! 🎉

> **Important:** Prefer using a test or secondary Twitch account to experiment. Do not use your main account to avoid risk of bans.

---

## File Structure

twitch-points-claimer/
├── manifest.json # Extension configuration
├── popup.html # Popup interface
├── popup.css # Popup styling
├── popup.js # Popup functionality
├── content.js # Main claiming logic
├── background.js # Background service worker
├── README.md # This file
└── icons/ # Extension icons
├── icon16.png
├── icon32.png
├── icon48.png
└── icon128.png

---

## How It Works

### Channel Points
- Scans for claimable bonus points every 2 seconds
- Uses multiple CSS selectors to find claim buttons
- Automatically clicks when points are available
- Tracks total points claimed

### Drops Claiming
- Monitors for drop claim notifications every 5 seconds
- Handles various drop types and layouts
- Occasionally checks drops inventory
- Updates drop statistics

### Smart Features
- **Navigation Detection**: Restarts when you change streams
- **Settings Sync**: Preferences saved across browser sessions
- **Daily Reset**: Session stats reset each day
- **Error Handling**: Graceful failure recovery

---

## Settings

- **Auto Claim Points**: Toggle automatic channel points claiming
- **Auto Claim Drops**: Toggle automatic drops claiming  
- **Enable Notifications**: Show in-page notifications for claims

---

## Statistics

- **Total Points Claimed**: Lifetime points collected
- **Drops Claimed**: Total drops successfully claimed
- **Sessions Today**: Number of times activated today

---

## Troubleshooting

### Extension Not Working
- Ensure you're on a Twitch stream page
- Check that toggles are enabled in popup
- Refresh the page and wait a few seconds
- Check browser console for error messages

### No Points Being Claimed
- Make sure you're eligible for channel points on the stream
- Some streams may not have points enabled
- Points may not be available to claim yet

### Popup Not Opening
- Ensure extension is loaded and enabled
- Try reloading the extension in chrome://extensions
- Check for JavaScript errors in popup

---

## Development Notes

### Key Components

**Manifest V3 Compliance**
- Uses service worker instead of background page
- Proper permissions for Twitch domains
- Content script injection

**Content Script (`content.js`)**
- Main claiming logic
- DOM observation and interaction
- Message passing with popup

**Popup Interface**
- Real-time statistics display
- Settings management
- Status indicators

### Customization

You can modify the claiming intervals by changing these values in `content.js`:
```javascript
// Point claiming interval (milliseconds)
this.claimInterval = setInterval(() => {
    this.claimChannelPoints();
}, 2000); // Change this value

// Drops claiming interval (milliseconds)  
this.dropInterval = setInterval(() => {
    this.claimDrops();
}, 5000); // Change this value

Legal & Ethics

This extension automates actions you could perform manually

It may violate Twitch's Terms of Service if used on live accounts

Use responsibly and respect content creators

No data is collected or transmitted outside your browser

Author does not endorse or encourage live usage

Contributing

Feel free to improve the extension:

Add new claiming selectors for better compatibility

Improve the UI/UX design

Add new features like sound notifications

Optimize performance and reliability

License

Twitch Auto Points Extension - Custom License

Copyright (c) 2025 [Your Name]

Permission is granted to use this software for personal, educational, or testing purposes.

You may not:

Redistribute, republish, or sell this software in any form.

The software is provided "as-is", without warranty of any kind.
The author is not responsible for any consequences resulting from the use of this software.

By using this software, you agree to comply with these restrictions.

Made with ❤️ for the Twitch community

Enjoy your automatically claimed points! 🎮✨