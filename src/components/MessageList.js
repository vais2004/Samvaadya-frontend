import React, { useEffect, useRef } from "react";


const MessageList = ({ messages, user }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => {
        const isSender = msg.sender === user.username;

        return (
          <div
            key={index}
            className={`message ${isSender ? "sent" : "received"}`}>
            <div className="message-content">
              <strong>{msg.sender}: </strong>
              {msg.message}
            </div>
          </div>
        );
      })}
      {/* Auto scroll target */}
      <div ref={bottomRef}></div>
    </div>
  );
};


export default MessageList;
