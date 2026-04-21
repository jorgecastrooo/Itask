import { useState } from "react";
import "../css/login.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      if (!response.ok) {
        const err = await response.json();
        setErrorMessage(err.detail || "Erro no login");
        return;
      }

      const data = await response.json();
      console.log("Login bem-sucedido:", data);

      localStorage.setItem("user", JSON.stringify(data));

      window.location.href = "/";

    } catch (error) {
      console.error("Erro:", error);
      setErrorMessage("Erro ao comunicar com o servidor.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-content">
          
          <h1 className="login-title">iTasks</h1>
          <p className="login-welcome">Bem-vindo</p>
          <p className="login-subtitle">Inicia sessão na tua conta</p>

          <form className="login-form" onSubmit={handleLogin}>
            
            {errorMessage && <p className="error-msg">{errorMessage}</p>}
            
            <div className="input-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Digite o seu username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="input-group password-group">
              <label>Palavra-passe</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i
                  className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  onClick={togglePassword}
                ></i>
              </div>
            </div>

            <button type="submit" className="login-button">
              Entrar
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}
