import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/emailconfirmationpage.css";
import envelopeIcon from "../assets/envelopeIcon.svg";

const EmailConfirmationPage = () => {
  const [resendTimer, setResendTimer] = useState(60);
  const [isResent, setIsResent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev > 0) {
          return prev - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    if (!userEmail) {
      alert("Email не найден. Зарегистрируйтесь снова.");
      return;
    }

    setResendTimer(60);
    setIsResent(true);

    try {
      const response = await fetch("/auth/api/resend-confirmation/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });
      if (response.ok) {
        console.log("Письмо отправлено повторно");
      } else {
        console.error("Ошибка при отправке письма повторно");
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  return (
    <div className="confirm">
      <div className="confirm_container">
        <h1 className="confirm_title">Подтверждение</h1>
        <img src={envelopeIcon} alt="Envelope Icon" className="confirm_icon" />

        <p className="confirm_text">
          На вашу почту отправлено письмо с ссылкой <br />
          на подтверждение аккаунта
        </p>

        {resendTimer > 0 && !isResent ? (
          <p className="confirm_text">
            Ожидание подтверждения, повторно отправить письмо можно через{" "}
            <strong>{resendTimer}</strong> секунд
          </p>
        ) : (
          <button onClick={handleResend} className="confirm_resend-link">
            Отправить повторно
          </button>
        )}

        {isResent && (
          <p className="confirm_success">Письмо отправлено повторно!</p>
        )}

        <Link to="/">
          <button className="confirm_button">Вернуться на главную</button>
        </Link>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
