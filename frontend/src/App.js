import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Homepage from "./Pages/Homepage";
import ChatPage from "./Pages/ChatPage";
import VideoChat from "./components/VideoChat";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/user") // Adjust API route
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/video-chat" element={<VideoChat users={users} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
