import React, { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { Chat } from "./components/Chat";
//import "bootstrap/dist/js/bootstrap.min.js";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <h1 className="app-logo">
        <img
          src="https://cdn3.iconfinder.com/data/icons/smartphone-63/64/Conversation-Chat-Smartphone-256.png"
          alt="Samvaadya Logo"
          className="logo-img"
          style={{height:"40px", width:"45px"}}
        />
        Samvaadya
      </h1>
      {!user ? (
        <div className="container mt-5 text-center">
          <div className="row">
            <div className="col-md-6">
              <Register setUser={setUser} />
            </div>
            <div className="col-md-6">
              <Login setUser={setUser} />
            </div>
          </div>
        </div>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
};

export default App;
