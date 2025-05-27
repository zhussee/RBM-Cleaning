import React from "react";
import "../styles/contactpage.css";

const ContactPage = () => {
  return (
    <div className="contact-page">
      <h1>Свяжитесь с нами</h1>
      <div className="contact-content">
        <div className="contact-left">
          <h2>Связаться с нами</h2>
          <p><strong>Адрес:</strong><br /> ул. Торетай 28в</p>
          <p><strong>Телефон:</strong><br /> +7 777 589 9790</p>
          <p><strong>Email:</strong><br /> RBMcleaning@gmail.com</p>
        </div>
        <div className="contact-right">
          <h2>Отправьте нам сообщение</h2>
          <form>
            <label>Имя</label>
            <input type="text" placeholder="Ваше имя" />
            <label>Электронная почта</label>
            <input type="email" placeholder="example@email.com" />
            <label>Сообщение</label>
            <textarea rows="5" placeholder="Введите сообщение..." />
            <button type="submit">Отправить сообщение</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
