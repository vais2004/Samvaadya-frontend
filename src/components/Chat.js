import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import Picker from "emoji-picker-react";
import MessageList from "./MessageList";
import "./chat.css";

const socket = io("https://bitter-hettie-neog-1ffc9095.koyeb.app");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    socket.emit("register", user.username);
  }, [user.username]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          "https://bitter-hettie-neog-1ffc9095.koyeb.app/users",
          { params: { currentUser: user.username } }
        );
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    };
    fetchUsers();
  }, [user.username]);

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(
        "https://bitter-hettie-neog-1ffc9095.koyeb.app/messages",
        { params: { sender: user.username, receiver } }
      );
      setMessages(data);
      setCurrentChat(receiver);
      setShowEmojiPicker(false);
    } catch (err) {
      console.log(err);
    }
  };

  const sendMessage = () => {
    if (!currentMessage.trim()) return;

    socket.emit("send_message", {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
    });

    setMessages((prev) => [
      ...prev,
      { sender: user.username, receiver: currentChat, message: currentMessage },
    ]);

    setCurrentMessage("");
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setCurrentMessage((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="container-fluid">
      <h4 className="text-center my-2">Welcome, {user.username}</h4>

      <div className="row">
        {/* CHAT LIST */}
        <div className="col-12 col-md-4 col-lg-3 border-end">
          <h6>Chats</h6>
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

        {/* CHAT WINDOW */}
        {currentChat && (
          <div className="col-12 col-md-8 col-lg-9 d-flex flex-column">
            <h6>You are chatting with {currentChat}</h6>

            <MessageList messages={messages} user={user} />

            {isTyping && (
              <p className="typing-indicator">{typingUser} is typing...</p>
            )}

            {/* MESSAGE INPUT LINE (WHATSAPP STYLE) */}
            <div className="d-flex align-items-center flex-nowrap gap-2 mt-2 position-relative">
              {/* Emoji Button */}
              <button
                className="btn btn-light"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                😊
              </button>

              {/* Emoji Picker */}
              {showEmojiPicker && (
                <div
                  className="position-absolute bg-white shadow rounded"
                  style={{
                    bottom: "55px",
                    left: "0",
                    width: "280px",
                    maxWidth: "90vw",
                    zIndex: 1000,
                  }}>
                  <Picker
                    onEmojiClick={handleEmojiClick}
                    width={280}
                    height={300}
                  />
                </div>
              )}

              {/* Input */}
              <input
                type="text"
                className="form-control flex-grow-1"
                placeholder="Type a message"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
              />

              {/* Send Button */}
              <button className="btn btn-primary" onClick={sendMessage}>
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
