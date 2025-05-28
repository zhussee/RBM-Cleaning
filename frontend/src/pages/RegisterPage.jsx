import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import eye_close from "../assets/eye_close.svg";
import eye_open from "../assets/eye_open.svg";
import "../styles/registerpage.css";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPass1, setShowPass1] = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password1: "",
    password2: "",
    agree: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrors({ email: ["Введите корректный email."] });
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!strongPasswordRegex.test(formData.password1)) {
      setErrors({
        password1: [
          "Пароль должен содержать минимум 8 символов, включая заглавные, строчные буквы и цифры.",
        ],
      });
      return;
    }

    if (formData.password1 !== formData.password2) {
      setErrors({ password2: ["Пароли не совпадают."] });
      return;
    }

    if (!formData.agree) {
      setErrors({ agree: ["Согласитесь с условиями сервиса."] });
      return;
    }

    try {
      const response = await fetch("http://rbm-cleaning.kz/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Регистрация успешна:", data);
        localStorage.setItem("user_email", formData.email);
        localStorage.setItem("temp_email", formData.email); 
        localStorage.setItem("temp_password", formData.password1); 
        navigate("/email_confirmation");
      } else {
        const errorData = await response.json();
        setErrors(errorData);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  return (
    <div className="register">
      <div className="register_container">
        <h1 className="register_title">Регистрация</h1>
        <p className="register_subtitle">Введите данные для регистрации</p>

        <form className="register_form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="email"
            className="register_input"
            placeholder="Введите email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="register_password-wrapper">
            <input
              type={showPass1 ? "text" : "password"}
              name="password1"
              className="register_input"
              placeholder="Введите пароль"
              value={formData.password1}
              onChange={handleChange}
            />
            <img
              src={showPass1 ? eye_open : eye_close}
              alt="toggle"
              className="register_eye-icon"
              onClick={() => setShowPass1((prev) => !prev)}
            />
          </div>

          <div className="register_password-wrapper">
            <input
              type={showPass2 ? "text" : "password"}
              name="password2"
              className="register_input"
              placeholder="Подтвердите пароль"
              value={formData.password2}
              onChange={handleChange}
            />
            <img
              src={showPass2 ? eye_open : eye_close}
              alt="toggle"
              className="register_eye-icon"
              onClick={() => setShowPass2((prev) => !prev)}
            />
          </div>

          <p className="register_note">
            * Пароль должен состоять минимум из 8 цифр, символов, а также
            содержать заглавные и строчные буквы
          </p>

          <label className="register_checkbox-label">
            <input
              type="checkbox"
              name="agree"
              className="register_checkbox"
              checked={formData.agree}
              onChange={handleChange}
            />
            Я ознакомился(ась) с условиями сервиса и принимаю соглашение
          </label>
          {Object.values(errors)
            .flat()
            .map((msg, idx) => (
              <p key={idx} className="error">
                {msg}
              </p>
            ))}

          <button type="submit" className="register_button">
            Продолжить
          </button>
        </form>

        <p className="register_footer-text">У вас уже есть учетная запись?</p>
        <Link to="/login">
          <button className="register_footer-btn">Войти</button>
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
