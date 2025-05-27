import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/authpage.css"; 

const PasswordResetRequestPage = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/password-reset/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        setError("Пользователь с таким email не найден.");
      }
    } catch (err) {
      console.error("Ошибка:", err);
      setError("Ошибка подключения к серверу.");
    }
  };

  return (
    <div className="auth">
      <div className="auth_container">
        <h1 className="auth_title">Сброс пароля</h1>
        <p className="auth_subtitle">Укажите ваш email для восстановления доступа</p>

        {!success ? (
          <form className="auth_form" onSubmit={handleReset}>
            <input
              type="email"
              className="auth_input"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit" className="auth_button">
              Отправить ссылку
            </button>
          </form>
        ) : (
          <div className="auth_success-box">
            <p className="success">
              Письмо с инструкциями по сбросу пароля было отправлено на <strong>{email}</strong>.
            </p>
          </div>
        )}

        <p className="auth_footer-text">Вспомнили пароль?</p>
        <Link to="/login">
          <button className="auth_register-btn">Вернуться ко входу</button>
        </Link>
      </div>
    </div>
  );
};

export default PasswordResetRequestPage;
