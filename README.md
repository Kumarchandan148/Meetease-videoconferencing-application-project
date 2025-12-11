# Meetease – Online Video Conferencing Application

Meetease is a full-stack MERN video-conferencing web application that supports real-time video/audio calls, screen sharing, chat, and secure meeting rooms.  
It is inspired by modern meeting platforms and built with React,Node.js,Express,Socket.IO, and WebRTC.

---

# Features

# Video & Audio
- Real-time video and audio streaming using WebRTC  
- Toggle Mic / Camera  
- Auto-adjust layout based on number of participants  

# Screen Sharing
- Share full screen or specific application window  
- Automatically switches layout when screen sharing starts  

# Real-Time Chat
- One-to-many messaging  
- Chat stored inside the room session  
- Typing indicator and timestamp support

# Participants Panel
- Live participant count  
- List of all connected users  
- Ability to mute/unmute own stream  

# Authentication 
- Login / Signup pages  
- JWT + bcrypt for secure access  
- User-specific meeting history (optional)

# Meeting Rooms
- Unique meeting URLs  
- Join using room code  
- Create new meeting with a single click  

# Frontend (React+HTML+CSS)
- Responsive design  
- Minimal UI inspired by Google Meet / Zoom  
- Custom animated hero section  
- Join-meeting form on homepage  

# Backend (Node + Express + Socket.IO)
- Handles all WebRTC signaling  
- Real-time user connection events  
- Secure room creation and joining  

---

# Folder Structure
meetease/
│
├── client/                     # React frontend (Create React App)
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   │
│   ├── src/
│   │   ├── assets/             # Images, logos, icons, etc.
│   │   ├── components/         # Reusable components (Navbar, Footer, Chat, VideoPlayer)
│   │   ├── pages/              # Main pages (Home, Login, Signup, MeetingRoom)
│   │   ├── context/            # React Context or Redux store for state management
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API calls and Socket.IO services
│   │   ├── App.js
│   │   ├── index.js
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js           # If using Vite instead of CRA
│
├── server/                     # Node.js + Express backend
│   ├── controllers/            # Logic for users, meetings, authentication
│   ├── models/                 # MongoDB models (User, Meeting, Chat)
│   ├── routes/                 # Express routes
│   ├── middleware/             # Auth middleware, error handling
│   ├── utils/                  # Helper functions (JWT, WebRTC signaling)
│   ├── server.js               # Entry point for backend
│   └── package.json
│
├── .gitignore
└── README.md
1.Install Frontend Dependencies
cd client
npm install
npm start

2.Install Backend Dependencies
cd server
npm install
npm start

