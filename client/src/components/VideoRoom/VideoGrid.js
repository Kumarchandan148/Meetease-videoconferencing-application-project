import React, { useRef, useEffect } from "react";

const VideoGrid = ({
  peers = {}, // Default empty object
  userStream,
  userName = "User", // Default name
  isAudioEnabled = false,
  isVideoEnabled = false,
  isScreenSharing = false,
}) => {
  const userVideoRef = useRef();

  useEffect(() => {
    if (userVideoRef.current && userStream) {
      userVideoRef.current.srcObject = userStream;
      console.log("User stream set to video element:", userStream);

      // Additional debugging
      const videoTracks = userStream.getVideoTracks();
      console.log("Video tracks:", videoTracks);
      console.log(
        "Video tracks enabled:",
        videoTracks.map((track) => ({
          id: track.id,
          enabled: track.enabled,
          readyState: track.readyState,
        }))
      );

      // 🔥 FIX: Force enable video tracks when stream is available
      if (isVideoEnabled) {
        videoTracks.forEach((track) => {
          track.enabled = true;
          console.log("Force enabled video track:", track.id);
        });
      }
    }
  }, [userStream, isVideoEnabled]); // Added isVideoEnabled dependency

  // 🔥 FIX: Add effect to handle video enable/disable
  useEffect(() => {
    if (userStream) {
      const videoTracks = userStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = isVideoEnabled;
        console.log(
          "Video track enabled set to:",
          isVideoEnabled,
          "for track:",
          track.id
        );
      });
    }
  }, [isVideoEnabled, userStream]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const peerCount = Object.keys(peers || {}).length; // Safe check
  const totalParticipants = peerCount + 1; // +1 for current user

  // Calculate grid layout
  const getGridColumns = () => {
    if (totalParticipants === 1) return 1;
    if (totalParticipants === 2) return 2;
    if (totalParticipants <= 4) return 2;
    if (totalParticipants <= 6) return 3;
    return 3; // Max 3 columns for larger groups
  };

  // 🔥 FIXED: Simplified video check for user
  const shouldShowUserVideo = () => {
    // First check if we have a stream
    if (!userStream) {
      console.log("User video hidden - no stream");
      return false;
    }

    // Check if video is enabled by user
    if (!isVideoEnabled) {
      console.log("User video hidden - video disabled by user");
      return false;
    }

    // Check video tracks
    const videoTracks = userStream.getVideoTracks();
    if (videoTracks.length === 0) {
      console.log("User video hidden - no video tracks");
      return false;
    }

    // Check if any track is enabled and live
    const hasEnabledTrack = videoTracks.some(
      (track) => track.enabled && track.readyState === "live"
    );

    console.log("User video visibility:", hasEnabledTrack);
    console.log(
      "Debug - isVideoEnabled:",
      isVideoEnabled,
      "hasEnabledTrack:",
      hasEnabledTrack
    );

    return hasEnabledTrack;
  };

  return (
    <div
      className="video-grid"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${getGridColumns()}, 1fr)`,
        gap: "1rem",
        padding: "1rem",
        height: "100%",
        width: "100%",
      }}
    >
      {/* User's own video */}
      <div
        className="video-container"
        style={{
          position: "relative",
          backgroundColor: "#1a1a1a",
          borderRadius: "0.5rem",
          overflow: "hidden",
          minHeight: "200px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {shouldShowUserVideo() ? (
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className="video"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "0.5rem",
            }}
            onLoadedMetadata={() => {
              console.log("User video metadata loaded");
            }}
            onCanPlay={() => {
              console.log("User video can play");
            }}
            onError={(e) => {
              console.error("User video error:", e);
            }}
          />
        ) : (
          <div
            className="video-placeholder"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "white",
            }}
          >
            <div
              className="participant-avatar"
              style={{
                fontSize: "2rem",
                width: "4rem",
                height: "4rem",
                background: "#667eea",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: "bold",
              }}
            >
              {getInitials(userName)}
            </div>
          </div>
        )}
        <div
          className="user-name"
          style={{
            position: "absolute",
            bottom: "0.5rem",
            left: "0.5rem",
            right: "0.5rem",
            background: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.875rem",
            fontWeight: "500",
          }}
        >
          {userName} (You) {isScreenSharing && "📺"}
          <div
            className="participant-status"
            style={{
              marginTop: "0.25rem",
              display: "flex",
              gap: "0.5rem",
            }}
          >
            <span
              className={`status-icon ${
                isAudioEnabled ? "active" : "inactive"
              }`}
            >
              {isAudioEnabled ? "🎤" : "🔇"}
            </span>
            <span
              className={`status-icon ${
                isVideoEnabled ? "active" : "inactive"
              }`}
            >
              {isVideoEnabled ? "📹" : "📷"}
            </span>
          </div>
        </div>
      </div>

      {/* Other participants' videos */}
      {Object.entries(peers || {}).map(([peerId, peerData]) => (
        <PeerVideo key={peerId} peerId={peerId} peerData={peerData} />
      ))}
    </div>
  );
};

const PeerVideo = ({ peerId, peerData }) => {
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current && peerData.stream) {
      videoRef.current.srcObject = peerData.stream;
      console.log("Set stream for peer:", peerId, "name:", peerData.name);
    }
  }, [peerData.stream, peerId]);

  const getInitials = (name) => {
    if (!name || name === "Unknown User") return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Simplified peer video check
  const shouldShowPeerVideo = () => {
    if (!peerData.stream || peerData.isVideoEnabled === false) {
      return false;
    }

    const videoTracks = peerData.stream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some((track) => track.enabled);
  };

  return (
    <div
      className="video-container"
      style={{
        position: "relative",
        backgroundColor: "#1a1a1a",
        borderRadius: "0.5rem",
        overflow: "hidden",
        minHeight: "200px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {shouldShowPeerVideo() ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="video"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "0.5rem",
          }}
          onLoadedMetadata={() => {
            console.log("Video metadata loaded for peer:", peerId);
          }}
          onError={(e) => {
            console.error("Video error for peer:", peerId, e);
          }}
        />
      ) : (
        <div
          className="video-placeholder"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "white",
          }}
        >
          <div
            className="participant-avatar"
            style={{
              fontSize: "2rem",
              width: "4rem",
              height: "4rem",
              background: "#764ba2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
            }}
          >
            {getInitials(peerData.name || "User")}
          </div>
        </div>
      )}
      <div
        className="user-name"
        style={{
          position: "absolute",
          bottom: "0.5rem",
          left: "0.5rem",
          right: "0.5rem",
          background: "rgba(0, 0, 0, 0.7)",
          color: "white",
          padding: "0.5rem",
          borderRadius: "0.25rem",
          fontSize: "0.875rem",
          fontWeight: "500",
        }}
      >
        {peerData.name || "Unknown User"} {peerData.isScreenSharing && "📺"}
        <div
          className="participant-status"
          style={{
            marginTop: "0.25rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <span
            className={`status-icon ${
              peerData.isAudioEnabled ? "active" : "inactive"
            }`}
          >
            {peerData.isAudioEnabled ? "🎤" : "🔇"}
          </span>
          <span
            className={`status-icon ${
              peerData.isVideoEnabled ? "active" : "inactive"
            }`}
          >
            {peerData.isVideoEnabled ? "📹" : "📷"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VideoGrid;
