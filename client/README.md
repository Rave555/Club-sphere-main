# ClubSphere Mobile Client Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For physical device: Expo Go app on your phone

## Quick Start

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure API Connection

#### For Emulator/Simulator (Default)
The app is pre-configured to work with `localhost:5000` which works with emulators.

#### For Physical Device Testing
1. Find your computer's IP address:
   - **Windows**: Run `ipconfig` in Command Prompt, look for IPv4 Address
   - **Mac**: Run `ifconfig | grep inet` in Terminal
   - **Linux**: Run `hostname -I` in Terminal

2. Update the API URL in `config.js`:
   ```javascript
   development: {
     API_BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api', // Replace YOUR_IP_ADDRESS
   }
   ```

### 3. Start the Development Server
```bash
npm start
```

### 4. Run on Device
- **iOS Simulator**: Press `i` in terminal or run `npm run ios`
- **Android Emulator**: Press `a` in terminal or run `npm run android`
- **Physical Device**: Scan QR code with Expo Go app
- **Web**: Press `w` in terminal or run `npm run web`

## Troubleshooting

### Network Issues
- Ensure your phone and computer are on the same WiFi network
- Check if your firewall is blocking port 5000
- Make sure the backend server is running on port 5000

### API Connection Failed
1. Verify the backend server is running (`npm start` in server directory)
2. Check the API URL in `config.js` matches your server configuration
3. For physical devices, ensure you're using your computer's IP address, not localhost

### Common IP Addresses
- Emulator/Simulator: `localhost` or `127.0.0.1`
- Physical Device: Your computer's network IP (e.g., `192.168.1.100`)

## Scripts
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

## Environment Configuration
The app automatically detects development vs production environments. For custom configuration, modify `config.js`.