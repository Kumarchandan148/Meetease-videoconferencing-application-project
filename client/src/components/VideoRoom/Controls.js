// import React from "react";

// const Controls = ({
//   isAudioEnabled,
//   isVideoEnabled,
//   onToggleAudio,
//   onToggleVideo,
//   onShareScreen,
//   onLeaveRoom,
// }) => {
//   return (
//     <div className="controls">
//       <button
//         className={`control-btn ${isAudioEnabled ? "active" : "inactive"}`}
//         onClick={onToggleAudio}
//         title={isAudioEnabled ? "Mute" : "Unmute"}
//       >
//         {isAudioEnabled ? "🎤" : "🔇"}
//       </button>

//       <button
//         className={`control-btn ${isVideoEnabled ? "active" : "inactive"}`}
//         onClick={onToggleVideo}
//         title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
//       >
//         {isVideoEnabled ? "📹" : "📷"}
//       </button>

//       <button
//         className="control-btn neutral"
//         onClick={onShareScreen}
//         title="Share screen"
//       >
//         🖥️
//       </button>

//       <button className="control-btn neutral" title="Settings">
//         ⚙️
//       </button>

//       <button
//         className="control-btn inactive"
//         onClick={onLeaveRoom}
//         title="Leave room"
//       >
//         📞
//       </button>
//     </div>
//   );
// };

// export default Controls;

import React from "react";

const Controls = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  onToggleAudio,
  onToggleVideo,
  onShareScreen,
  onLeaveRoom,
}) => {
  return (
    <div className="controls">
      <button
        className={`control-btn ${isAudioEnabled ? "active" : "inactive"}`}
        onClick={onToggleAudio}
        title={isAudioEnabled ? "Mute Microphone" : "Unmute Microphone"}
      >
        {isAudioEnabled ? "🎤" : "🔇"}
      </button>

      <button
        className={`control-btn ${isVideoEnabled ? "active" : "inactive"}`}
        onClick={onToggleVideo}
        title={isVideoEnabled ? "Turn Off Camera" : "Turn On Camera"}
      >
        {isVideoEnabled ? "📹" : "📷"}
      </button>

      <button
        className={`control-btn ${isScreenSharing ? "active" : "neutral"}`}
        onClick={onShareScreen}
        title={isScreenSharing ? "Stop Screen Share" : "Share Screen"}
      >
        {isScreenSharing ? "🛑" : "🖥️"}
      </button>

      <button
        className="control-btn neutral"
        title="Meeting Statistics"
        onClick={() => {
          // You can add analytics/stats functionality here
          alert(
            "Meeting Statistics:\n- Participants: Connected\n- Connection: Good\n- Duration: Active"
          );
        }}
      >
        📊
      </button>

      <button
        className="control-btn inactive"
        onClick={onLeaveRoom}
        title="Leave Meeting"
      >
        📞
      </button>
    </div>
  );
};

export default Controls;
