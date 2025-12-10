import React from "react";

const ParticipantsList = ({ participants }) => {
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="participants-list">
      {participants.map((participant) => (
        <div key={participant.id} className="participant">
          <div className="participant-avatar">
            {getInitials(participant.name)}
          </div>
          <div className="participant-info">
            <div className="participant-name">{participant.name}</div>
            <div className="participant-status">
              <span
                className={`status-icon ${
                  participant.isAudioEnabled ? "active" : "inactive"
                }`}
              >
                🎤
              </span>
              <span
                className={`status-icon ${
                  participant.isVideoEnabled ? "active" : "inactive"
                }`}
              >
                📹
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsList;
