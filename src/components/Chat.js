import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import MessageList from "./MessageList";
import "./chat.css";

const socket = io("https://samvaadya-production.up.railway.app");

export const Chat = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    socket.emit("join", user.username);
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          "https://samvaadya-production.up.railway.app/users",
          {
            params: { currentUser: user.username },
          }
        );
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users", error);
      }
    };

    fetchUsers();

    // ✅ FIXED typing listener
    socket.on("typing", (data) => {
      if (data.sender === currentChat && data.receiver === user.username) {
        setTypingUser(data.sender);
        setIsTyping(true);

        setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    socket.on("receive_message", (data) => {
      if (data.sender === currentChat || data.receiver === currentChat) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => {
      socket.off("receive_message");
      socket.off("typing");
    };
  }, [currentChat]);

  const fetchMessages = async (receiver) => {
    try {
      const { data } = await axios.get(
        "https://samvaadya-production.up.railway.app/messages",
        {
          params: { sender: user.username, receiver },
        }
      );
      setMessages(data);
      setCurrentChat(receiver);
    } catch (error) {
      console.error("Error fetching messages", error);
    }
  };

  const sendMessage = () => {
    const messageData = {
      sender: user.username,
      receiver: currentChat,
      message: currentMessage,
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
          <div>
            <h5>You are chatting with {currentChat}</h5>

            {isTyping ? (
              <p style={{ fontSize: "13px", color: "green" }}>
                <b>{typingUser} is typing...</b>
              </p>
            ) : (
              <div style={{ paddingBottom: "1.2rem" }}></div>
            )}
          </div>
          <hr />

          <MessageList messages={messages} user={user} />

          <div className="message-field">
            <input
              type="text"
              placeholder="Type a message..."
              value={currentMessage}
              style={{ minWidth: "400px" }}
              onChange={(e) => {
                setCurrentMessage(e.target.value);
                socket.emit("typing", {
                  sender: user.username,
                  receiver: currentChat,
                });
              }}
            />

            <button
              style={{ backgroundColor: "#f2dafaff" }}
              onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
