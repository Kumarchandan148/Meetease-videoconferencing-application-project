# Meetease – Online Video Conferencing Application

## 📌 Project Overview

Meetease is a full-stack video conferencing web application that enables users to join meeting rooms and communicate through real-time audio, video, and chat. It is built using the MERN stack, Socket.IO, and WebRTC to support online meetings and collaboration.

## ✨ Features

- **Real-Time Audio and Video:** Supports audio/video communication using WebRTC.
- **Camera and Microphone Controls:** Allows users to toggle their camera and microphone.
- **Screen Sharing:** Enables users to share their screen during meetings.
- **Real-Time Chat:** Supports messaging between meeting participants.
- **Participant Panel:** Displays connected participants and the participant count.
- **User Authentication:** Provides login and registration functionality using JWT and bcrypt.
- **Meeting Rooms:** Supports creating and joining meetings using room links or room codes.
- **Responsive Interface:** Provides a user interface built with React, HTML, and CSS.

## 🛠️ Technologies Used

- **Frontend:** React.js, HTML, CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Real-Time Communication:** Socket.IO
- **Audio/Video Communication:** WebRTC and Simple-Peer
- **Authentication:** JSON Web Tokens (JWT), bcrypt
- **API Communication:** Axios

## 📁 Project Structure

```text
Meetease/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
│
├── server/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── socket/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation and Setup

### Prerequisites

- Node.js and npm
- MongoDB running locally or a MongoDB connection URI
- A modern browser with camera and microphone permissions

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd Meetease-videoconferencing-application-project-main
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your repository URL.

### 2. Set Up the Backend

Open a terminal and run:

```bash
cd server
npm install
```

Configure your MongoDB connection using the `MONGODB_URI` environment variable. The server uses port `5000` by default.

Start the backend:

```bash
npm start
```

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm start
```

The React development server normally opens at:

```text
http://localhost:3000
```

## 🔐 Environment Configuration

Create a `.env` file in the `server` directory if you need to configure environment variables.

Example:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edumeet
JWT_SECRET=replace_with_a_secure_secret
```

Use your own secure JWT secret. Do not commit real passwords, secrets, or private database credentials to GitHub.

## 🚀 Future Improvements

- Deploy the frontend and backend for public access.
- Improve meeting security and access controls.
- Add meeting scheduling and notifications.
- Enhance the interface and meeting experience.
- Add automated testing and error handling.

## 👨‍💻 Author

**Chandan Kumar**

