import React from "react";
import "./Login.css";

const Login = () => {
  const handleGoogleLogin = () => {
    // Update the URL to your production backend URL
    window.location.href = "https://miroo-phi.vercel.app/api/auth/google"; // Use the production URL here
  };

  return (
    <div className="login-container">
      <header className="login-header">
        <h1 className="login-title">Welcome to Miro</h1>
        <p className="login-subtitle">
          Organize tasks, collaborate, and bring your ideas to life with ease.
        </p>
      </header>

      <div className="login-box">
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
            alt="Google Logo"
          />
          Login with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
