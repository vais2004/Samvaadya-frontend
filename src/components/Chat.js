import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const socket = io("https://bitter-hettie-neog-1ffc9095.koyeb.app/", {
  transports: ["websocket"],
});

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const currentChatRef = useRef(null);

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  useEffect(() => {
    socket.emit("join", user.username);
  }, []);

  useEffect(() => {
    axios
      .get("https://bitter-hettie-neog-1ffc9095.koyeb.app/users", {
        params: { currentUser: user.username },
      })
      .then((res) => setUsers(res.data));

    socket.on("typing", (data) => {
      if (
        data.sender === currentChatRef.current &&
        data.receiver === user.username
      ) {
        setTypingUser(data.sender);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    socket.on("receive_message", (data) => {
      if (data.sender === currentChatRef.current) {
        setMessages((prev) => [...prev, data]);
      }
    });

    socket.on("message_delivered", ({ _id }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg._id === _id ? { ...msg, delivered: true } : msg))
      );
    });

    socket.on("message_read", ({ sender }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === user.username && msg.receiver === sender
            ? { ...msg, read: true }
            : msg
        )
      );
    });

    return () => {
      socket.off("typing");
      socket.off("receive_message");
      socket.off("message_delivered");
      socket.off("message_read");
    };
  }, []);

  const fetchMessages = async (receiver) => {
    const res = await axios.get(
      "https://bitter-hettie-neog-1ffc9095.koyeb.app/messages",
      { params: { sender: user.username, receiver } }
    );
    setMessages(res.data);
    setCurrentChat(receiver);

    socket.emit("message_read", {
      sender: receiver,
      receiver: user.username,
    });
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
      time: new Date().toLocaleTimeString(),
      delivered: false, // initially false
      read: false, // initially false
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage("");
  };

  return (
    <div className="chat-container">
      <h2>Welcome, {user.username}</h2>

      <div className="chat-list">
        <h3>Chats</h3>
        {users.map((u) => (
          <div
            key={u._id}
            className={`chat-user ${
              currentChat === u.username ? "active" : ""
            }`}
            onClick={() => fetchMessages(u.username)}>
            {u.username}
          </div>
        ))}
      </div>

      {currentChat && (
        <div className="chat-window">
          <h5>You are chatting with {currentChat}</h5>

          {isTyping && (
            <p style={{ fontSize: "13px", color: "green" }}>
              <b>{typingUser} is typing...</b>
            </p>
          )}

          <hr />

          <MessageList messages={messages} user={user} />

          <div className="message-field">
            <div className="emoji-wrapper">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="emoji-btn">
                <i className="bi bi-emoji-smile"></i>
              </button>

              {showEmoji && (
                <div className="emoji-picker-container">
                  <Picker
                    data={data}
                    onEmojiSelect={(e) => {
                      setCurrentMessage((prev) => prev + e.native);
                      setShowEmoji(false);
                    }}
                  />
                </div>
              )}
            </div>
            <input
              type="text"
              value={currentMessage}
              placeholder="Type a message..."
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                socket.emit("typing", {
                  sender: user.username,
                  receiver: currentChat,
                });
              }}
            />

            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};
