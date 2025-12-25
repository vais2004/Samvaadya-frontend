import React, { useEffect, useRef } from "react";

const MessageList = ({ messages, user }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.sender === user.username ? "sent" : "received"
          }`}>
          <strong>{msg.sender}: </strong>
          {msg.message}

          <small style={{ fontSize: "10px", display: "block" }}>
            {msg.time ||
              (msg.createdAt && new Date(msg.createdAt).toLocaleTimeString())}
          </small>

          <span
            style={{
              fontSize: "12px",
              marginLeft: "5px",
              color: msg.read ? "#0d6efd" : "#777",
            }}>
            {!msg.delivered && "✓"}
            {msg.delivered && !msg.read && "✓✓"}
            {msg.read && "🔵✓✓"}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
