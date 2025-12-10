import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { roomAPI } from "../../services/api";

const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const createRoom = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    try {
      const response = await roomAPI.create({ name: "New Meeting" });
      navigate(`/room/${response.data.roomId}`);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const joinRoom = () => {
    const roomId = prompt("Enter Room ID:");
    if (roomId) {
      navigate(`/room/${roomId}`);
    }
  };

  if (!user) {
    return (
      <div className="home-container">
        <div className="home-content">
          <h1>MeetEase</h1>
          <p>Connect, collaborate, and learn together</p>
          <div className="home-actions">
            <Link to="/login" className="home-btn">
              Login
            </Link>
            <Link to="/register" className="home-btn secondary">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome, {user.name}!</h1>
        <p>Start or join a meeting</p>
        <div className="home-actions">
          <button onClick={createRoom} className="home-btn">
            Create Meeting
          </button>
          <button onClick={joinRoom} className="home-btn secondary">
            Join Meeting
          </button>
          <button onClick={logout} className="home-btn secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
