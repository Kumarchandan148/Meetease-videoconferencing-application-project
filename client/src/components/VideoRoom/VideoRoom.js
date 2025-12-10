import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { roomAPI } from "../../services/api";
import { useWebRTC } from "../../hooks/useWebRTC";
import VideoGrid from "./VideoGrid";
import ParticipantsList from "./ParticipantsList";
import ChatPanel from "./ChatPanel";
import Controls from "./Controls";

const VideoRoom = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [sidebarView, setSidebarView] = useState("participants");
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  // Only initialize WebRTC after socket is connected
  const {
    peers,
    stream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    shareScreen,
  } = useWebRTC(socket, roomId, user?._id);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    console.log("Initializing socket connection...");

    // Initialize socket connection
    const newSocket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);

      // Join room after connection is established
      console.log("Joining room:", roomId, "as user:", user._id, user.name);
      newSocket.emit("join-room", roomId, user._id, user.name);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
      setSocket(null);
    });

    // Load room data
    loadRoomData();

    // Socket event listeners for UI updates
    newSocket.on("user-connected", (userId, userName) => {
      console.log("UI: User connected:", userId, userName);
      setParticipants((prev) => {
        const exists = prev.find((p) => p.id === userId);
        if (!exists && userId !== user._id) {
          // Don't add current user to participants list
          return [
            ...prev,
            {
              id: userId,
              name: userName,
              isAudioEnabled: true,
              isVideoEnabled: true,
            },
          ];
        }
        return prev;
      });
    });

    newSocket.on("user-disconnected", (userId) => {
      console.log("UI: User disconnected:", userId);
      setParticipants((prev) => prev.filter((p) => p.id !== userId));
    });

    // Add event listener for getting current room participants
    newSocket.on("room-participants", (roomParticipants) => {
      console.log("Received room participants:", roomParticipants);
      // Filter out current user from participants list
      const otherParticipants = roomParticipants
        .filter((p) => p.id !== user._id)
        .map((p) => ({
          id: p.id,
          name: p.name,
          isAudioEnabled: true,
          isVideoEnabled: true,
        }));
      setParticipants(otherParticipants);
    });

    newSocket.on("chat-message", (message) => {
      console.log("Chat message received:", message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("user-audio-toggled", (userId, isEnabled) => {
      console.log("User audio toggled:", userId, isEnabled);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, isAudioEnabled: isEnabled } : p
        )
      );
    });

    newSocket.on("user-video-toggled", (userId, isEnabled) => {
      console.log("User video toggled:", userId, isEnabled);
      setParticipants((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, isVideoEnabled: isEnabled } : p
        )
      );
    });

    return () => {
      console.log("Cleaning up socket connection...");
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [roomId, user, navigate]);

  const loadRoomData = async () => {
    try {
      const response = await roomAPI.getRoom(roomId);
      setRoomData(response.data);

      // Don't set initial participants here - let socket events handle it
    } catch (error) {
      console.error("Error loading room:", error);
      // Try to join room if it exists
      try {
        await roomAPI.join(roomId);
        loadRoomData();
      } catch (joinError) {
        console.error("Error joining room:", joinError);
        alert("Room not found or unable to join");
        navigate("/");
      }
    }
  };

  const sendMessage = (message) => {
    if (socket && message.trim()) {
      console.log("Sending message:", message);
      socket.emit("chat-message", message);
    }
  };

  const leaveRoom = () => {
    console.log("Leaving room...");
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    navigate("/");
  };

  if (!user) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        Please login to join the meeting
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          color: "white",
          fontSize: "1.2rem",
        }}
      >
        Connecting to meeting...
      </div>
    );
  }

  return (
    <div className="video-room">
      <div className="main-content">
        <header className="header">
          <div className="logo">
            <span>MeetEase</span>
            <span className="meeting-id">Meeting ID: {roomId}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
              {isConnected ? "● Connected" : "○ Connecting..."}
            </span>
            <button className="end-call-btn" onClick={leaveRoom}>
              End Call
            </button>
          </div>
        </header>

        <VideoGrid
          peers={peers}
          userStream={stream}
          userName={user.name}
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
        />

        <Controls
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onShareScreen={shareScreen}
          onLeaveRoom={leaveRoom}
        />
      </div>

      <div className="sidebar">
        <div
          className="sidebar-header"
          style={{ display: "flex", gap: "1rem" }}
        >
          <button
            style={{
              background:
                sidebarView === "participants" ? "#3498db" : "transparent",
              color: "white",
              border: "1px solid #3498db",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
            onClick={() => setSidebarView("participants")}
          >
            Participants ({participants.length + 1})
          </button>
          <button
            style={{
              background: sidebarView === "chat" ? "#3498db" : "transparent",
              color: "white",
              border: "1px solid #3498db",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              cursor: "pointer",
            }}
            onClick={() => setSidebarView("chat")}
          >
            Chat ({messages.length})
          </button>
        </div>

        {sidebarView === "participants" ? (
          <ParticipantsList
            participants={[
              {
                id: user._id,
                name: `${user.name} (You)`,
                isAudioEnabled,
                isVideoEnabled,
              },
              ...participants,
            ]}
          />
        ) : (
          <ChatPanel
            messages={messages}
            onSendMessage={sendMessage}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );
};

export default VideoRoom;
