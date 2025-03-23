import React from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";
import config from "../chatbot/config";
import MessageParser from "../chatbot/MessageParser";
import ActionProvider from "../chatbot/ActionProvider";

const ChatInterface = () => {
  return (
    <div
      style={{
        width: "80vw", // ✅ width 80% of viewport
        margin: "0 auto",
        paddingTop: "2rem", // Optional: top padding
      }}
    >
      <Chatbot
        config={config}
        messageParser={MessageParser}
        actionProvider={ActionProvider}
      />
    </div>
  );
};

export default ChatInterface;
