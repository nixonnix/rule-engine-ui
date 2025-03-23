import React from "react";
import ChatInterface from "./components/ChatInterface";
import "./App.css";

function App() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <ChatInterface />
    </div>
  );
}

export default App;
