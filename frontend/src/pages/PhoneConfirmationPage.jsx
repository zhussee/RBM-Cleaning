import React from "react";
import { Link } from "react-router-dom";
import "../styles/phoneconfirmationpage.css";

const PhoneConfirmationPage = () => {
  return (
    <div className="confirm">
      <div className="confirm_container">
        <h1 className="confirm_title">Подтверждение</h1>
        
        <p className="confirm_text">
            Мы отправили вам SMS с кодом
        </p>
        <input
            type="number"
            minlength="6"
            maxlength="6"
            className="confirm_input"
            placeholder="Введите код"
        />
        <Link to="/">
            <button className="confirm_button">Подтвердить</button>
        </Link>
        <Link to="/">
            <button className="repeat_confirm_button">Вернуться на главную</button>
        </Link>
      </div>
    </div>
  );
};

export default PhoneConfirmationPage;
