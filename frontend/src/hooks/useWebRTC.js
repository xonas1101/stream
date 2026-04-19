import { useEffect, useRef, useState, useCallback } from "react";
import { useSocket } from "../context/socketContext";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useWebRTC = (roomId) => {
  const socket = useSocket();
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const peersRef = useRef({});
  const localStreamRef = useRef(null);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  }, []);

  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  }, []);

  const createPeer = useCallback(
    (targetUserId, name, pfp) => {
      const peer = new RTCPeerConnection(ICE_SERVERS);
      peersRef.current[targetUserId] = peer;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          peer.addTrack(track, localStreamRef.current);
        });
      }

      peer.ontrack = (event) => {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetUserId]: {
            stream: event.streams[0],
            name,
            pfp,
          },
        }));
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            roomId,
            targetUserId: targetUserId,
            senderId: socket.id,
            candidate: event.candidate,
          });
        }
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState === "disconnected" ||
          peer.connectionState === "failed" ||
          peer.connectionState === "closed"
        ) {
          setRemoteStreams((prev) => {
            const newStreams = { ...prev };
            delete newStreams[targetUserId];
            return newStreams;
          });
          delete peersRef.current[targetUserId];
        }
      };

      return peer;
    },
    [roomId, socket]
  );

  useEffect(() => {
    if (!socket || !roomId) return;

    startMedia();

    const handleUserJoined = async ({ socketId, name, pfp }) => {
      if (!localStreamRef.current || !socketId) return;

      const peer = createPeer(socketId, name, pfp);
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("webrtc-offer", {
          roomId,
          targetUserId: socketId,
          senderId: socket.id,
          offer,
        });
      } catch (err) {
        console.error("Error creating offer", err);
      }
    };

    const handleOffer = async ({ offer, senderId, name, pfp }) => {
      const peer = createPeer(senderId, name, pfp);
      try {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("webrtc-answer", {
          roomId,
          targetUserId: senderId,
          senderId: socket.id,
          answer,
        });
      } catch (err) {
        console.error("Error handling offer", err);
      }
    };

    const handleAnswer = async ({ answer, senderId }) => {
      const peer = peersRef.current[senderId];
      if (peer) {
        try {
          await peer.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote description from answer", err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate, senderId }) => {
      const peer = peersRef.current[senderId];
      if (peer) {
        try {
          await peer.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ice candidate", err);
        }
      }
    };

    socket.on("user-joined", handleUserJoined);
    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);

      Object.values(peersRef.current).forEach((peer) => peer.close());
      peersRef.current = {};
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, roomId, createPeer, startMedia]);

  return { localStream, remoteStreams, toggleAudio, toggleVideo, isAudioMuted, isVideoMuted };
};
