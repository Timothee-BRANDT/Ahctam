import React, { useState, useEffect } from "react";
import { FaPhone } from "react-icons/fa";

interface AudioChatComponentProps {
  onStartCall: () => void;
  onAnswerCall: (
    remoteSDP: RTCSessionDescriptionInit,
    receiverId: number,
  ) => Promise<void>;
  onEndCall: () => void;
}

const AudioChatComponent: React.FC<AudioChatComponentProps> = ({
  onStartCall,
  onAnswerCall,
  onEndCall,
}) => {
  const [isMicrophoneGranted, setIsMicrophoneGranted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);

  useEffect(() => {
    requestMicrophoneAccess();
  }, []);

  const requestMicrophoneAccess = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsMicrophoneGranted(true);
    } catch (error) {
      setIsMicrophoneGranted(false);
      console.log("L'accès au micro est refusé.");
    }
  };

  const handleCallClick = () => {
    if (isMicrophoneGranted) {
      onStartCall();
    } else {
      alert("Enable micophone access in your browser settings.");
    }
  };

  // Simulate incoming call
  const receiveIncomingCall = () => {
    setIncomingCall(true);
  };

  const answerCall = () => {
    setIncomingCall(false);
    // useless mock
    const remoteSDP: any = {};
    const receiverId = 123;

    onAnswerCall(remoteSDP, receiverId);
  };

  const declineCall = () => {
    setIncomingCall(false);
    onEndCall();
  };

  return (
    <div>
      <FaPhone
        onClick={handleCallClick}
        style={{
          cursor: "pointer",
          color: "lightgreen",
        }}
      />

      {incomingCall && (
        <div className="incoming-call">
          <p>Call of user incoming</p>
          <button onClick={answerCall}>Accept call</button>
          <button onClick={declineCall}>Decline call</button>
        </div>
      )}
    </div>
  );
};

export default AudioChatComponent;
