# ClubSphere - College Club Management App

A React Native mobile application for managing college clubs, events, and memberships.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Expo Go** app on your phone (for physical device testing)
- **MongoDB** database
- **Cloudinary** account (for image uploads)

---

## 📱 Client Setup (Mobile App)

### 1. Install Dependencies
```bash
cd client
npm install
```

### 2. Configure API Connection

**For Emulator/Simulator (Recommended for beginners):**
- The app is pre-configured to work with `localhost:5000`
- Works out of the box with Android/iOS simulators

**For Physical Device Testing:**
1. Find your computer's IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address)
   - **Mac**: `ifconfig | grep inet`
   - **Linux**: `hostname -I`

2. Update `client/config.js`:
   ```javascript
   development: {
     API_BASE_URL: 'http://YOUR_IP_ADDRESS:5000/api'
   }
   ```

### 3. Start the Client
```bash
npm start
```

### 4. Run on Device
- **iOS Simulator**: Press `i` or run `npm run ios`
- **Android Emulator**: Press `a` or run `npm run android`
- **Physical Device**: Scan QR code with Expo Go app
- **Web**: Press `w` or run `npm run web`

---

## 🖥️ Server Setup (Backend API)

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Configuration
Create `server/.env` file:
```bash
MONGODB_URI=mongodb://localhost:27017/clubsphere
JWT_SECRET=your_jwt_secret_key
PORT=5000

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FOLDER_NAME=clubsphere
```

### 3. Start the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

---

## 🔧 Development Workflow

### Running Both Client and Server
You'll need **two terminals**:

**Terminal 1 (Server):**
```bash
cd server
npm start
```

**Terminal 2 (Client):**
```bash
cd client
npm start
```

---

## 🌐 Network Configuration

### Common Issues & Solutions

**"Network request failed" or "Cannot connect to server":**
1. Ensure server is running on port 5000
2. For physical devices, use your computer's IP instead of localhost
3. Check firewall settings (allow port 5000)
4. Ensure phone and computer are on same WiFi network

**Finding Your IP Address:**
- Windows: `ipconfig`
- Mac: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- Linux: `hostname -I`

---

## 📚 Project Structure

```
Club-sphere/
├── client/                 # React Native mobile app
│   ├── src/
│   │   ├── screens/       # App screens
│   │   ├── navigation/    # Navigation setup
│   │   ├── services/      # API calls
│   │   └── stores/        # State management
│   ├── config.js          # Environment configuration
│   └── README.md          # Client-specific setup
├── server/                # Node.js backend
│   ├── controllers/       # Business logic
│   ├── models/           # Database schemas
│   ├── routes/           # API endpoints
│   └── config/           # Database & service configs
└── README.md             # This file
```

---

## 🛠️ Troubleshooting

### Client Issues
- **App won't start**: Check if Expo CLI is installed globally
- **Metro bundler errors**: Clear cache with `expo start -c`
- **Network errors**: Verify API URL in `client/config.js`

### Server Issues
- **MongoDB connection**: Ensure MongoDB is running locally or update connection string
- **Port conflicts**: Change PORT in `.env` if 5000 is occupied
- **Environment variables**: Double-check `.env` file format

### General Tips
- Restart both server and client after configuration changes
- Check console logs for detailed error messages
- Ensure all dependencies are installed with correct versions
