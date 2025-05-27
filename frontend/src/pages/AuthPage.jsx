import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import eye_close from "../assets/eye_close.svg";
import eye_open from "../assets/eye_open.svg";
import "../styles/authpage.css";

const AuthPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const text = await response.text();
      console.log("Ответ от сервера (raw):", text);

      try {
        const data = JSON.parse(text);

        if (response.ok) {
          localStorage.setItem("access_token", data.access);
          localStorage.setItem("refresh_token", data.refresh);

          console.log("Авторизация успешна:", data);
          navigate("/profile");
          window.location.reload();
        } else {
          setError(data.detail || "Неверные учётные данные.");
        }
      } catch (err) {
        console.error("Ошибка парсинга JSON:", err);
        setError("Ошибка на сервере. Попробуйте позже.");
      }
    } catch (err) {
      console.error("Ошибка запроса:", err);
      setError("Нет подключения к серверу.");
    }
  };

  return (
    <div className="auth">
      <div className="auth_container">
        <h1 className="auth_title">Вход</h1>
        <p className="auth_subtitle">Добро пожаловать в RBM Cleaning</p>
        <form className="auth_form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            className="auth_input"
            placeholder="Введите email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="auth_password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              className="auth_input"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleChange}
            />
            <img
              src={showPassword ? eye_open : eye_close}
              alt="toggle"
              className="auth_eye-icon"
              onClick={() => setShowPassword((prev) => !prev)}
            />
          </div>
          <div className="auth_extras">
            <label className="auth_checkbox-label">
              <input type="checkbox" className="auth_checkbox" />
              Запомнить меня
            </label>
            <Link to="/password-reset" className="auth_link">
              Забыли пароль?
            </Link>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="auth_button">
            Войти
          </button>
        </form>

        <p className="auth_footer-text">Впервые на нашем сервисе?</p>
        <Link to="/registration">
          <button className="auth_register-btn">Зарегистрироваться</button>
        </Link>
      </div>
    </div>
  );
};

export default AuthPage;
