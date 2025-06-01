import React, { useState } from "react";
import { useParams } from "react-router-dom";

const PasswordResetConfirmPage = () => {
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleConfirm = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://rbm-cleaning.kz/api/auth/password-reset-confirm/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, token, new_password: password }),
      });

      if (response.ok) {
        setMessage("Пароль успешно изменён!");
      } else {
        setMessage("Ошибка. Ссылка могла устареть.");
      }
    } catch (error) {
      console.error("Ошибка:", error);
      setMessage("Ошибка сети.");
    }
  };

  return (
    <div className="reset-confirm">
      <h2>Установить новый пароль</h2>
      <form onSubmit={handleConfirm}>
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Сменить пароль</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default PasswordResetConfirmPage;
