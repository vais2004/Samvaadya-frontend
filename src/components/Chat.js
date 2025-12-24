import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

const socket = io("https://samvaadya-production.up.railway.app");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    socket.emit("join", user.username);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await axios.get(
        "https://samvaadya-production.up.railway.app/users",
        { params: { currentUser: user.username } }
      );
      setUsers(data);
    };
    fetchUsers();

    socket.on("typing", (data) => {
      if (data.sender === currentChat && data.receiver === user.username) {
        setTypingUser(data.sender);
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socket.on("receive_message", (data) => {
      if (
        data.sender !== user.username &&
        (data.sender === currentChat || data.receiver === currentChat)
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    // Cleanup to prevent duplicate listeners when component unmounts
    return () => {
      socket.off("typing");
      socket.off("receive_message");
    };
  }, []); // ❌ EMPTY DEPENDENCY — only run once

  const fetchMessages = async (receiver) => {
    const { data } = await axios.get(
      "https://samvaadya-production.up.railway.app/messages",
      { params: { sender: user.username, receiver } }
    );
    setMessages(data);
    setCurrentChat(receiver);
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
      time: new Date().toLocaleTimeString(),
      status: "sent",
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, messageData]);
    setCurrentMessage(""); // ✅ ONLY clear input
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
