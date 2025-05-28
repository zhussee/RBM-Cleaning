import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/emailconfirmationpage.css";
import emailcheck from "../assets/email_check.svg";

const ConfirmEmailPage = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirm = async () => {
      try {
        const response = await fetch(
          `http://rbm-cleaning.kz/api/auth/confirm-email/${uid}/${token}/`
        );
        if (response.ok) {
          const email = localStorage.getItem("temp_email");
          const password = localStorage.getItem("temp_password");

          if (email && password) {
            const loginResponse = await fetch(
              "/api/login/",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
              }
            );

            const loginData = await loginResponse.json();

            if (loginResponse.ok) {
              localStorage.setItem("access_token", loginData.access);
              localStorage.setItem("refresh_token", loginData.refresh);
              localStorage.removeItem("temp_email");
              localStorage.removeItem("temp_password");
              navigate("/profile");
            } else {
              alert("Почта подтверждена, но авторизация не удалась.");
              console.log(loginData);
              navigate("/login");
              window.location.reload();
            }
          } else {
            alert("Почта подтверждена. Войдите заново.");
            navigate("/login");
          }
        } else {
          const data = await response.json();
          alert(data.detail || "Ошибка подтверждения.");
        }
      } catch (err) {
        alert("Ошибка соединения с сервером.");
      }
    };

    confirm();
  }, [uid, token, navigate]);

  return (
    <div className="confirm">
      <div className="confirm_container">
        {status === "loading" && (
          <>
            <h1 className="confirm_title">Подтверждение</h1>
            <p className="confirm_text">Пожалуйста, подождите...</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="confirm_title">Почта подтверждена!</h1>
            <img src={emailcheck} alt="Success" className="confirm_icon" />
            <p className="confirm_text">
              Ваша электронная почта успешно подтверждена.
            </p>
            <button
              className="confirm_button"
              onClick={() => navigate("/login")}
            >
              Перейти к входу
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="confirm_title">Ошибка</h1>
            <p className="confirm_text">{message}</p>
            <button className="confirm_button" onClick={() => navigate("/")}>
              На главную
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmailPage;
