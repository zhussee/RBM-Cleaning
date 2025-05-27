import React from "react";
import { Link } from "react-router-dom";
import "../styles/services.css";
import cross_icon from "../assets/cross_icon.svg"

const Services = () => {
  return (
    <section className="services">
      <div className="services_container">
        <h2 className="services_title">Что мы предлагаем?</h2>
        <div className="services_cards">
          <div className="services_card">
            <h3 className="services_card-title">Поддерживающая</h3>
            <p className="services_price">12 000 тг</p>
            <p className="services_include">Что включено:</p>
            <ul className="services_list">
              <li>Профессиональные средства для уборки</li>
              <li>Собираем и выносим мусор</li>
              <li>Пылесосим и моем полы</li>
              <li>Вызываем мастера по уборке</li>
            </ul>
            <button className="services_button">Выбрать</button>
          </div>

          <div className="services_card">
            <h3 className="services_card-title">Генеральная</h3>
            <p className="services_price">27 000 тг</p>
            <p className="services_include">Что включено:</p>
            <ul className="services_list">
              <li>Моем окна с внутренней стороны</li>
              <li>Вызов бригады мастеров</li>
              <li>Профессиональный пылесос (по запросу)</li>
              <li>Моем кафель на кухне и в санузле</li>
            </ul>
            <button className="services_button">Выбрать</button>
          </div>

          <div className="services_card">
            <h3 className="services_card-title">После ремонта</h3>
            <p className="services_price">43 500 тг</p>
            <p className="services_include">Что включено:</p>
            <ul className="services_list">
              <li>Покраска стен или поклейка обоев</li>
              <li>Удаляем строительную пыль и клей</li>
              <li>Моем кафель на стенах и полу</li>
            </ul>
            <button className="services_button">Выбрать</button>
          </div>
        </div>

        <div className="services_actions">
          <p className="services_choose-text"><img src={cross_icon} alt="cross_icon"/>Выберите услугу</p>
          <Link to="/checkout">
            <button className="services_order-btn">Оформить заказ</button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;