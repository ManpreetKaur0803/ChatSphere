import React, { useState, useRef, useEffect } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:5000"); // Adjust for deployment

const VideoChat = ({ users }) => {
  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [selectedUser, setSelectedUser] = useState(""); // Store selected user

  const userVideo = useRef();
  const partnerVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (userVideo.current) userVideo.current.srcObject = stream;
      });

    socket.on("callIncoming", (data) => {
      setReceivingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });
  }, []);

  const callUser = () => {
    if (!selectedUser) {
      alert("Please select a user to call.");
      return;
    }

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: selectedUser, // Use selected user
        signalData: data,
        from: socket.id,
      });
    });

    peer.on("stream", (userStream) => {
      if (partnerVideo.current) partnerVideo.current.srcObject = userStream;
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: caller });
    });

    peer.on("stream", (userStream) => {
      if (partnerVideo.current) partnerVideo.current.srcObject = userStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  return (
    <div>
      <h2>Video Chat</h2>
      <video ref={userVideo} autoPlay playsInline style={{ width: "300px" }} />
      {callAccepted && (
        <video
          ref={partnerVideo}
          autoPlay
          playsInline
          style={{ width: "300px" }}
        />
      )}

      <div>
        <h3>Select User to Call:</h3>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
        >
          <option value="">--Select User--</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name}
            </option>
          ))}
        </select>
        <button onClick={callUser} disabled={!selectedUser}>
          Call
        </button>
      </div>

      {receivingCall && (
        <div>
          <h3>Incoming Call...</h3>
          <button onClick={answerCall}>Answer</button>
        </div>
      )}
    </div>
  );
};

export default VideoChat;
