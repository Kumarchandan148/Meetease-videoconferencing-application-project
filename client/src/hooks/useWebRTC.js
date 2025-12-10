import { useState, useEffect, useRef } from "react";
// import Peer from "simple-peer";
import Peer from "simple-peer/simplepeer.min.js"; // instead of from "simple-peer"

export const useWebRTC = (socket, roomId, userId) => {
  const [peers, setPeers] = useState({});
  const [stream, setStream] = useState(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const peersRef = useRef({});
  const streamRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Get user media
    const getUserMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(mediaStream);
        streamRef.current = mediaStream;

        // Socket event listeners
        socket.on("user-connected", (newUserId, userName) => {
          console.log("User connected:", newUserId, userName);
          if (newUserId !== userId) {
            createPeer(newUserId, userName, mediaStream, true);
          }
        });

        socket.on("offer", (offer, callerUserId, targetUserId, callerName) => {
          console.log(
            "Received offer from:",
            callerUserId,
            "name:",
            callerName
          );
          if (targetUserId === userId && !peersRef.current[callerUserId]) {
            createPeer(
              callerUserId,
              callerName || "Unknown User",
              mediaStream,
              false,
              offer
            );
          }
        });

        socket.on("answer", (answer, answerUserId, targetUserId) => {
          console.log("Received answer from:", answerUserId);
          if (targetUserId === userId) {
            const peer = peersRef.current[answerUserId];
            if (peer && peer.peer) {
              peer.peer.signal(answer);
            }
          }
        });

        socket.on(
          "ice-candidate",
          (candidate, candidateUserId, targetUserId) => {
            console.log("Received ICE candidate from:", candidateUserId);
            if (targetUserId === userId) {
              const peer = peersRef.current[candidateUserId];
              if (peer && peer.peer) {
                peer.peer.signal(candidate);
              }
            }
          }
        );

        socket.on("user-disconnected", (disconnectedUserId) => {
          console.log("User disconnected:", disconnectedUserId);
          if (peersRef.current[disconnectedUserId]) {
            peersRef.current[disconnectedUserId].peer.destroy();
            delete peersRef.current[disconnectedUserId];
            setPeers((prev) => {
              const newPeers = { ...prev };
              delete newPeers[disconnectedUserId];
              return newPeers;
            });
          }
        });

        socket.on("user-audio-toggled", (userId, isEnabled) => {
          setPeers((prev) => ({
            ...prev,
            [userId]: prev[userId]
              ? { ...prev[userId], isAudioEnabled: isEnabled }
              : prev[userId],
          }));
        });

        socket.on("user-video-toggled", (userId, isEnabled) => {
          setPeers((prev) => ({
            ...prev,
            [userId]: prev[userId]
              ? { ...prev[userId], isVideoEnabled: isEnabled }
              : prev[userId],
          }));
        });

        socket.on("user-screen-share", (userId, isSharing) => {
          setPeers((prev) => ({
            ...prev,
            [userId]: prev[userId]
              ? { ...prev[userId], isScreenSharing: isSharing }
              : prev[userId],
          }));
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getUserMedia();

    return () => {
      // Cleanup function
      if (socket) {
        socket.off("user-connected");
        socket.off("offer");
        socket.off("answer");
        socket.off("ice-candidate");
        socket.off("user-disconnected");
        socket.off("user-audio-toggled");
        socket.off("user-video-toggled");
        socket.off("user-screen-share");
      }

      // Destroy all peers
      Object.values(peersRef.current).forEach((peerObj) => {
        if (peerObj.peer) {
          peerObj.peer.destroy();
        }
      });
      peersRef.current = {};

      // Stop all media tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, roomId, userId]);

  const createPeer = (
    targetUserId,
    userName,
    stream,
    initiator,
    incomingSignal = null
  ) => {
    console.log(
      "Creating peer for:",
      targetUserId,
      "name:",
      userName,
      "initiator:",
      initiator
    );

    const peer = new Peer({
      initiator,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      console.log("Sending signal to:", targetUserId, "type:", signal.type);
      if (initiator) {
        socket.emit("offer", signal, targetUserId);
      } else {
        socket.emit("answer", signal, targetUserId);
      }
    });

    peer.on("stream", (remoteStream) => {
      console.log("Received stream from:", targetUserId, "userName:", userName);
      const peerData = {
        peer,
        stream: remoteStream,
        name: userName, // Use the provided userName
        isAudioEnabled: true,
        isVideoEnabled: true,
        isScreenSharing: false,
      };

      setPeers((prev) => ({
        ...prev,
        [targetUserId]: peerData,
      }));

      peersRef.current[targetUserId] = peerData;
    });

    peer.on("error", (err) => {
      console.error("Peer error:", err);
    });

    peer.on("connect", () => {
      console.log("Peer connected:", targetUserId);
    });

    peer.on("close", () => {
      console.log("Peer connection closed:", targetUserId);
    });

    if (incomingSignal) {
      peer.signal(incomingSignal);
    }

    // Store peer temporarily until stream is received
    peersRef.current[targetUserId] = { peer, name: userName, stream: null };
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        if (socket) {
          socket.emit("toggle-audio", audioTrack.enabled);
        }
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        if (socket) {
          socket.emit("toggle-video", videoTrack.enabled);
        }
      }
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      // Stop screen sharing and return to camera
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        await replaceVideoTrack(cameraStream.getVideoTracks()[0]);
        setStream(cameraStream);
        streamRef.current = cameraStream;
        setIsScreenSharing(false);

        if (socket) {
          socket.emit("screen-share", false);
        }
      } catch (err) {
        console.error("Error returning to camera:", err);
      }
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        await replaceVideoTrack(screenStream.getVideoTracks()[0]);
        setStream(screenStream);
        streamRef.current = screenStream;
        setIsScreenSharing(true);

        if (socket) {
          socket.emit("screen-share", true);
        }

        // Handle screen share ending
        screenStream.getVideoTracks()[0].onended = async () => {
          try {
            const cameraStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true,
            });

            await replaceVideoTrack(cameraStream.getVideoTracks()[0]);
            setStream(cameraStream);
            streamRef.current = cameraStream;
            setIsScreenSharing(false);

            if (socket) {
              socket.emit("screen-share", false);
            }
          } catch (err) {
            console.error(
              "Error returning to camera after screen share ended:",
              err
            );
          }
        };
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    }
  };

  const replaceVideoTrack = async (newVideoTrack) => {
    // Replace video track in all peer connections
    for (const peerData of Object.values(peersRef.current)) {
      if (peerData.peer && peerData.peer._pc) {
        const senders = peerData.peer._pc.getSenders();
        const videoSender = senders.find(
          (sender) => sender.track && sender.track.kind === "video"
        );

        if (videoSender) {
          try {
            await videoSender.replaceTrack(newVideoTrack);
          } catch (err) {
            console.error("Error replacing video track:", err);
          }
        }
      }
    }
  };

  return {
    peers,
    stream,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    toggleAudio,
    toggleVideo,
    shareScreen,
  };
};
