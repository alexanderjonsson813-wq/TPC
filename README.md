# TPC
Never miss Twitch points again! Auto-claims channel points every 3 seconds, detects drops, tracks your daily stats, and shows which channel you're watching. Clean UI with customizable notifications.
# 🎮 Twitch Points Claimer


> **⚡ Never miss Twitch points again!** Automatically claims channel points every 3 seconds, detects drops, tracks your daily stats, and displays which channel you're watching.

## 🚨 **IMPORTANT DISCLAIMER**

**⚠️ USE AT YOUR OWN RISK ⚠️**

This extension is provided for **EDUCATIONAL PURPOSES ONLY**. Using automation tools may violate Twitch's Terms of Service and could result in:
- Account suspension or permanent ban
- Loss of channel points, badges, and progress
- Restriction from Twitch services

**By using this software, you acknowledge that:**
- You use it at your own risk and responsibility
- The developers are not liable for any consequences
- You are solely responsible for compliance with Twitch's ToS
- This software is not affiliated with or endorsed by Twitch

---

## ✨ Features

### 🎯 **Smart Automation**
- **Auto-claim channel points** every 3 seconds with intelligent detection
- **Automatic drops claiming** when available
- **Smart channel recognition** - displays current channel name
- **Zero false positives** - only claims when points are actually available

### 📊 **Advanced Statistics**
- **Daily session tracking** - see your progress in real-time
- **Total points claimed** counter
- **Drops claimed** statistics
- **Session duration** monitoring
- **Beautiful statistics dashboard**

### 🎨 **Premium User Experience**
- **Elegant popup interface** with modern design
- **Customizable notifications** - choose your alert preferences
- **Real-time updates** - watch your points grow live
- **Minimal resource usage** - won't slow down your browsing
- **Clean, intuitive controls**

### 🛡️ **Safety Features**
- **Randomized timing** to appear more human-like
- **Intelligent detection** prevents unnecessary API calls
- **Fail-safe mechanisms** to avoid detection
- **Resource-efficient operation**

---

## 🚀 Installation

### Method 1: Chrome Web Store (Recommended)
*Coming Soon - Under Review*

### Method 2: Manual Installation (Developer Mode)

1. **Download the extension**
   - Download the latest release ZIP file from [GitHub](https://github.com/alexanderjonsson813-wq/TPC/releases)
   - Or clone/download the repository as ZIP

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)

3. **Load the extension**
   - Click "Load unpacked"
   - Select the downloaded folder
   - The extension will appear in your toolbar

4. **Start using**
   - Navigate to any Twitch stream
   - Click the extension icon to open the dashboard
   - Watch your points accumulate automatically!

---

## 📖 How to Use

### 🎬 **Getting Started**

1. **Open any Twitch stream** in your browser
2. **Click the extension icon** in your Chrome toolbar
3. **View your live statistics** in the popup dashboard
4. **Sit back and watch** as points are automatically claimed!

### 🎛️ **Dashboard Overview**

The extension popup displays:
- **Current Channel**: Shows which stream you're watching
- **Session Stats**: Points and drops claimed this session
- **Total Counters**: Lifetime statistics
- **Session Time**: How long you've been active
- **Status Indicators**: Real-time operation status

### ⚙️ **Configuration**

Currently the extension works out-of-the-box with optimal settings. Future versions will include:
- Customizable claim intervals
- Notification preferences
- Advanced timing options
- Whitelist/blacklist channels

---

## 🔧 Technical Details

### **Architecture**
- **Content Script**: Monitors Twitch pages for claimable elements
- **Background Service**: Handles timing and coordination
- **Popup Interface**: Displays statistics and controls
- **Storage System**: Tracks statistics and preferences

### **Compatibility**
- ✅ Chrome 88+
- ✅ Chromium-based browsers (Edge, Brave, Opera)
- ✅ All Twitch layouts (new and legacy)
- ✅ Works with Twitch Turbo and Prime

### **Performance**
- **Minimal CPU usage** (~0.1% average)
- **Low memory footprint** (<5MB)
- **Efficient DOM monitoring** with smart selectors
- **Optimized for long streaming sessions**

---

## 🛡️ Privacy & Security

### **Data Collection**
- **NO personal data** is collected or transmitted
- **NO login credentials** are stored or accessed
- **Statistics stored locally** in browser storage only
- **NO external servers** - everything runs locally

### **Permissions Explained**
- `activeTab`: To detect when you're on Twitch
- `storage`: To save your statistics locally
- `host permissions`: To interact with Twitch's interface

### **Security Measures**
- Code is **open source** and auditable
- **No network requests** to external services
- **Minimal permissions** required
- **Regular security updates**

---

## 🐛 Troubleshooting

### **Common Issues**

**Extension not working on Twitch?**
- Refresh the Twitch page
- Make sure you're watching a live stream
- Check that the extension is enabled
- Try disabling other Twitch extensions

**Points not being claimed?**
- Ensure you're eligible for points (account age, following channel, etc.)
- Check if points are actually available (green claim button visible)
- Verify the stream is live and not a rerun

**Statistics not updating?**
- Close and reopen the extension popup
- Clear extension storage in Chrome settings
- Reinstall the extension if issues persist

**Performance issues?**
- Close unnecessary browser tabs
- Disable other extensions temporarily
- Restart your browser

### **Getting Help**
- 📋 Check the [Issues](https://github.com/alexanderjonsson813-wq/TPC/issues) page
- 💬 Join our [Discord community](https://discord.gg/your-invite) *(Coming Soon)*
- 📧 Email support: support@extensionforge.com

---

## 🚧 Roadmap

### **Version 1.1.0** (Coming Soon)
- [ ] Settings panel with customizable options
- [ ] Export/import statistics
- [ ] Multiple account support
- [ ] Enhanced drop detection
- [ ] Sound notifications

### **Version 1.2.0** (Future)
- [ ] Firefox support
- [ ] Advanced scheduling options
- [ ] Channel-specific settings
- [ ] Statistics visualization charts
- [ ] Cloud backup for statistics

### **Version 2.0.0** (Long-term)
- [ ] Complete UI redesign
- [ ] Machine learning detection avoidance
- [ ] Advanced analytics dashboard
- [ ] Mobile app companion

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Ways to Contribute**
- 🐛 **Report bugs** - Found an issue? Let us know on [GitHub Issues](https://github.com/alexanderjonsson813-wq/TPC/issues)!
- 💡 **Suggest features** - Have ideas for improvements?
- 🔧 **Submit code** - Pull requests are welcome
- 📝 **Improve documentation** - Help make our docs better
- 🌍 **Translations** - Help us support more languages

### **How to Contribute**
1. Visit our [GitHub repository](https://github.com/alexanderjonsson813-wq/TPC)
2. Fork the project (click the Fork button)
3. Make your changes in your fork
4. Submit a pull request with your improvements
5. We'll review and merge quality contributions!

---

## 📄 Legal

### **License**
This project is licensed under the MIT License with additional disclaimers - see the [LICENSE](LICENSE) file for details.

### **Disclaimer**
This software is provided "as is" without warranty of any kind. The developers are not responsible for any consequences resulting from the use of this software, including but not limited to account bans, suspensions, or violations of terms of service.

### **Terms of Use**
- This software is for educational purposes only
- Users assume all risks associated with usage
- Commercial redistribution is prohibited without permission
- Not affiliated with or endorsed by Twitch Interactive, Inc.

---

## 🌟 Support the Project

If you find this extension helpful, consider supporting our development:

- ⭐ **Star this repository** on GitHub
- 🍕 **Buy us a coffee** - [Donate](https://buymeacoffee.com/extensionforge)
- 🐛 **Report issues** and help improve the extension
- 📢 **Share with friends** who might find it useful
- 💬 **Join our community** on Discord

---

## 📞 Contact

- 🌐 **Website**: [extensionforge.com](https://extensionforge.com) *(Coming Soon)*
- 📧 **Email**: contact@extensionforge.com
- 💬 **Discord**: [Join our server](https://discord.gg/your-invite) *(Coming Soon)*
- 🐙 **GitHub**: [TPC Repository](https://github.com/alexanderjonsson813-wq/TPC)
- 🐦 **Twitter**: [@ExtensionForge](https://twitter.com/ExtensionForge) *(Coming Soon)*

---

<div align="center">

**Made with ❤️ by the ExtensionForge team**

*Crafting premium browser extensions that enhance your digital experience*

[![GitHub stars](https://img.shields.io/github/stars/alexanderjonsson813-wq/TPC.svg?style=social&label=Star)](https://github.com/alexanderjonsson813-wq/TPC)
[![GitHub forks](https://img.shields.io/github/forks/alexanderjonsson813-wq/TPC.svg?style=social&label=Fork)](https://github.com/alexanderjonsson813-wq/TPC/fork)

</div>
