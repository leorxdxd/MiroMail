import React, { useEffect, useState } from "react";
import {
  FaHome,
  FaEnvelope,
  FaFolder,
  FaTrash,
  FaClock,
  FaSignOutAlt,
  FaPaintBrush,
  FaUserCircle,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./Dashboard.css";
import { useDrag, useDrop } from "react-dnd"; // Import react-dnd
import { motion } from "framer-motion"; // Import framer-motion for smooth transitions

// Draggable component for the design editor
const DraggableElement = ({ id, type, left, top, children, onDelete }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "ELEMENT",
    item: { id, left, top, type },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleDelete = () => {
    onDelete(id);
  };

  return (
    <motion.div
      ref={drag}
      className="draggable-element"
      style={{
        position: "absolute",
        left: `${left}px`,
        top: `${top}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
      animate={{ scale: isDragging ? 0.9 : 1 }}
    >
      {children}
      <button className="delete-btn" onClick={handleDelete}>
        X
      </button>
    </motion.div>
  );
};

const DesignEditor = () => {
  const [elements, setElements] = useState([]);
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "ELEMENT",
    drop: (item) => handleDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDrop = (item) => {
    setElements([
      ...elements,
      {
        id: new Date().getTime(),
        type: item.type,
        left: item.left,
        top: item.top,
      },
    ]);
  };

  const handleDelete = (id) => {
    setElements(elements.filter((element) => element.id !== id));
  };

  return (
    <div
      ref={drop}
      className={`canvas ${isOver ? "drag-over" : ""}`}
      style={{ position: "relative", width: "100%", height: "600px", border: "1px solid #ccc" }}
    >
      {elements.map((el) => (
        <DraggableElement
          key={el.id}
          id={el.id}
          left={el.left}
          top={el.top}
          onDelete={handleDelete}
        >
          {el.type === "image" ? (
            <img src="https://via.placeholder.com/100" alt="img" />
          ) : el.type === "shape" ? (
            <div
              style={{
                width: 100,
                height: 100,
                backgroundColor: "red",
                borderRadius: "10px",
              }}
            ></div>
          ) : (
            <div>Text</div>
          )}
        </DraggableElement>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [emails, setEmails] = useState([]);
  const [activeTab, setActiveTab] = useState("Inbox");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isDesignMode, setIsDesignMode] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [emailContent, setEmailContent] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("http://localhost:3001/auth/user", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setUser(data.user));

    fetch("http://localhost:3001/api/emails", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setEmails(data));
  }, []);

  const handleLogout = () => {
    window.location.href = "http://localhost:3001/auth/logout";
  };

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const profilePicUrl = user?.profilePic || "default-profile-pic.png";

  const handleSendEmail = () => {
    console.log("Sending email:", {
      content: emailContent,
      scheduleDate,
    });
    setIsComposeOpen(false);
    setEmailContent("");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Inbox":
        return (
          <div className="email-list">
            {emails.map((email, idx) => (
              <div key={idx} className="email-card">
                <h4>{email.subject}</h4>
                <p>{email.body}</p>
              </div>
            ))}
          </div>
        );
      case "Sent Mail":
        return <h2 className="placeholder">Sent Mail</h2>;
      case "Drafts":
        return <h2 className="placeholder">Drafts</h2>;
      case "Trash":
        return <h2 className="placeholder">Trash</h2>;
      case "Scheduled":
        return <h2 className="placeholder">Scheduled Emails</h2>;
      default:
        return <h2 className="placeholder">Inbox</h2>;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>MiroMail</h1>
        <div className="user-actions">
          <span>Welcome, {user?.displayName || "User"}!</span>

          <div className="profile-section" onClick={handleProfileClick}>
            <img
              src={profilePicUrl}
              alt="Profile"
              className="profile-pic"
            />
            {isProfileMenuOpen && (
              <div className="profile-menu">
                <button onClick={() => alert("Manage Account Clicked")}>
                  Manage Account
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav>
            <ul>
              <li
                onClick={() => setActiveTab("Inbox")}
                className={activeTab === "Inbox" ? "active" : ""}
              >
                <FaHome /> Inbox
              </li>
              <li
                onClick={() => setActiveTab("Sent Mail")}
                className={activeTab === "Sent Mail" ? "active" : ""}
              >
                <FaEnvelope /> Sent Mail
              </li>
              <li
                onClick={() => setActiveTab("Drafts")}
                className={activeTab === "Drafts" ? "active" : ""}
              >
                <FaFolder /> Drafts
              </li>
              <li
                onClick={() => setActiveTab("Scheduled")}
                className={activeTab === "Scheduled" ? "active" : ""}
              >
                <FaClock /> Scheduled
              </li>
              <li
                onClick={() => setActiveTab("Trash")}
                className={activeTab === "Trash" ? "active" : ""}
              >
                <FaTrash /> Trash
              </li>
            </ul>
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="compose-email">
            <button onClick={() => setIsComposeOpen(true)} className="compose-btn">
              Compose Email
            </button>
          </div>

          {isComposeOpen && (
            <div className="compose-modal">
              <h2>Compose Email</h2>

              <div className="mode-toggle">
                <button
                  className={!isDesignMode ? "active" : ""}
                  onClick={() => setIsDesignMode(false)}
                >
                  Text Mode
                </button>
                <button
                  className={isDesignMode ? "active" : ""}
                  onClick={() => setIsDesignMode(true)}
                >
                  Design Mode
                </button>
              </div>

              {isDesignMode ? (
                <DesignEditor />
              ) : (
                <ReactQuill
                  theme="snow"
                  value={emailContent}
                  onChange={setEmailContent}
                  placeholder="Start writing your email..."
                />
              )}

              <div className="modal-actions">
                <DatePicker
                  selected={scheduleDate}
                  onChange={(date) => setScheduleDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                />
                <div>
                  <button onClick={handleSendEmail} className="send-btn">
                    Send Now
                  </button>
                  <button
                    onClick={() => setIsComposeOpen(false)}
                    className="close-btn"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
