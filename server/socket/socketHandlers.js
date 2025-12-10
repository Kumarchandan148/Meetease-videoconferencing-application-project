// const handleSocketConnection = (socket, io) => {
//   console.log("User connected:", socket.id);

//   // Join room
//   socket.on("join-room", (roomId, userId, userName) => {
//     socket.join(roomId);
//     socket.roomId = roomId;
//     socket.userId = userId;
//     socket.userName = userName;

//     // Notify others in the room
//     socket.to(roomId).emit("user-connected", userId, userName);

//     // Handle chat messages
//     socket.on("chat-message", (message) => {
//       io.to(roomId).emit("chat-message", {
//         userId,
//         userName,
//         message,
//         timestamp: new Date().toISOString(),
//       });
//     });

//     // Handle WebRTC signaling
//     socket.on("offer", (offer, targetUserId) => {
//       socket.to(roomId).emit("offer", offer, userId, targetUserId);
//     });

//     socket.on("answer", (answer, targetUserId) => {
//       socket.to(roomId).emit("answer", answer, userId, targetUserId);
//     });

//     socket.on("ice-candidate", (candidate, targetUserId) => {
//       socket.to(roomId).emit("ice-candidate", candidate, userId, targetUserId);
//     });

//     // Handle media controls
//     socket.on("toggle-audio", (isAudioEnabled) => {
//       socket.to(roomId).emit("user-audio-toggled", userId, isAudioEnabled);
//     });

//     socket.on("toggle-video", (isVideoEnabled) => {
//       socket.to(roomId).emit("user-video-toggled", userId, isVideoEnabled);
//     });

//     socket.on("screen-share", (isSharing) => {
//       socket.to(roomId).emit("user-screen-share", userId, isSharing);
//     });
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     if (socket.roomId && socket.userId) {
//       socket.to(socket.roomId).emit("user-disconnected", socket.userId);
//     }
//     console.log("User disconnected:", socket.id);
//   });
// };

// module.exports = { handleSocketConnection };

const handleSocketConnection = (socket, io) => {
  console.log("User connected:", socket.id);

  // Join room
  socket.on("join-room", (roomId, userId, userName) => {
    console.log(`User ${userName} (${userId}) joining room ${roomId}`);

    socket.join(roomId);
    socket.roomId = roomId;
    socket.userId = userId;
    socket.userName = userName;

    // Get all users in the room except the current user
    const room = io.sockets.adapter.rooms.get(roomId);
    const usersInRoom = [];

    if (room) {
      room.forEach((socketId) => {
        const clientSocket = io.sockets.sockets.get(socketId);
        if (
          clientSocket &&
          clientSocket.userId &&
          clientSocket.userId !== userId
        ) {
          usersInRoom.push({
            userId: clientSocket.userId,
            userName: clientSocket.userName,
            socketId: clientSocket.id,
          });
        }
      });
    }

    console.log(`Users already in room ${roomId}:`, usersInRoom);

    // Notify the new user about existing users
    usersInRoom.forEach((user) => {
      socket.emit("user-connected", user.userId, user.userName);
    });

    // Notify others in the room about the new user
    socket.to(roomId).emit("user-connected", userId, userName);

    // Handle chat messages
    socket.on("chat-message", (message) => {
      console.log(`Chat message from ${userName}: ${message}`);
      io.to(roomId).emit("chat-message", {
        userId,
        userName,
        message,
        timestamp: new Date().toISOString(),
      });
    });

    // Handle WebRTC signaling
    socket.on("offer", (offer, targetUserId) => {
      console.log(`Offer from ${userId} to ${targetUserId}`);

      // Find the target user's socket
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        room.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.userId === targetUserId) {
            clientSocket.emit("offer", offer, userId, targetUserId);
          }
        });
      }
    });

    socket.on("answer", (answer, targetUserId) => {
      console.log(`Answer from ${userId} to ${targetUserId}`);

      // Find the target user's socket
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        room.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.userId === targetUserId) {
            clientSocket.emit("answer", answer, userId, targetUserId);
          }
        });
      }
    });

    socket.on("ice-candidate", (candidate, targetUserId) => {
      console.log(`ICE candidate from ${userId} to ${targetUserId}`);

      // Find the target user's socket
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) {
        room.forEach((socketId) => {
          const clientSocket = io.sockets.sockets.get(socketId);
          if (clientSocket && clientSocket.userId === targetUserId) {
            clientSocket.emit("ice-candidate", candidate, userId, targetUserId);
          }
        });
      }
    });

    // Handle media controls
    socket.on("toggle-audio", (isAudioEnabled) => {
      console.log(`${userName} toggled audio: ${isAudioEnabled}`);
      socket.to(roomId).emit("user-audio-toggled", userId, isAudioEnabled);
    });

    socket.on("toggle-video", (isVideoEnabled) => {
      console.log(`${userName} toggled video: ${isVideoEnabled}`);
      socket.to(roomId).emit("user-video-toggled", userId, isVideoEnabled);
    });

    socket.on("screen-share", (isSharing) => {
      console.log(`${userName} toggled screen share: ${isSharing}`);
      socket.to(roomId).emit("user-screen-share", userId, isSharing);
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (socket.roomId && socket.userId) {
      console.log(`${socket.userName} left room ${socket.roomId}`);
      socket.to(socket.roomId).emit("user-disconnected", socket.userId);
    }
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
};

module.exports = { handleSocketConnection };
