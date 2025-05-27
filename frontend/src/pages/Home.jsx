import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/home.css";

import googlePlay from "../assets/googleplay_download.png";
import appStore from "../assets/appstore_download.png";
import phone1 from "../assets/phone_1.png";
import logoBig from "../assets/logo_icon.svg";
import star from "../assets/star.svg";
import checkIcon from "../assets/check-mark.svg";
import starIcon from "../assets/star why.svg";
import alarmIcon from "../assets/alarm.svg";
import headphones from "../assets/headphones.svg";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container">
          <div className="hero-left">
            <h1 className="hero-title">
              RBM CLEANING<br />
              Поможем вам найти лучшие клининговые
            </h1>
            <p className="hero-desc">
              Найдите и закажите клининговые услуги  
              у профессиональных клининг компаний
            </p>
            <button className="hero-button" onClick={() => navigate("/catalog")}>
              Выбрать компанию
            </button>
          </div>
          <div className="hero-right">
            <img src={logoBig} alt="RBM Cleaning Logo" />
          </div>
        </div>
      </section>

      <section className="why-section">
        <div className="container">
          <h2 className="why-title">
            Почему выбирают <span className="highlight">RBM Cleaning?</span>
          </h2>
          <div className="why-cards">
            <div className="why-card">
              <img src={checkIcon} alt="Удобство" className="why-icon" />
              <h3>Высокорейтинговые клинеры</h3>
              <p className="why-desc">Наши клинеры проверены, имеют опыт работы и получили высокие оценки от клиентов, таких как вы.</p>
            </div>
            <div className="why-card">
              <img src={starIcon} alt="Качество" className="why-icon" />
              <h3>Качество</h3>
              <p className="why-desc">Сотрудничаем только с проверенными и надёжными клининговыми компаниями.</p>
            </div>
            <div className="why-card">
              <img src={alarmIcon} alt="Поддержка 24/7" className="why-icon" />
              <h3>Поддержка 24/7</h3>
              <p className="why-desc">В любое время дня и ночи вы можете рассчитывать на нашу оперативную помощь.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-left">
            <h2 className="about-title">О НАС</h2>
            <p className="about-desc">
              RBM Cleaning — это инновационная платформа, объединяющая лучших
              поставщиков клининговых услуг в одном месте. Мы помогаем клиентам
              быстро и удобно найти надежные компании для уборки офисов,
              квартир, торговых помещений и других объектов. Наша миссия — упростить процесс выбора клинингового сервиса и гарантировать высокое качество услуг.
            </p>
            <div className="store-buttons">
              <img src={googlePlay} alt="Google Play" />
              <img src={appStore} alt="App Store" />
            </div>
          </div>

          <div className="about-right">
            <img src={phone1} alt="Скриншот приложения" />
          </div>
        </div>
      </section>

      <section className="goals-section">
        <div className="container">
          <h2 className="goals-title">НАШИ ЦЕЛИ</h2>
          <div className="goals-content">
            <div className="goal-item">
              <img src={star} alt="Надёжность" />
              <h3 className="goal-title">Надёжность</h3>
              <p className="goal-desc">
                Объединить лучшие клининговые компании в единой платформе.
              </p>
            </div>
            <div className="goal-item">
              <img src={star} alt="Качество" />
              <h3 className="goal-title">Качество</h3>
              <p className="goal-desc">
                Гарантировать высокое качество и безопасность услуг.
              </p>
            </div>
            <div className="goal-item">
              <img src={star} alt="Доступность" />
              <h3 className="goal-title">Доступность</h3>
              <p className="goal-desc">
                Сделать заказ клининга простым и доступным каждому.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="support-section">
      <div className="support-container">
        <div className="support-icon">
          <img src={headphones} alt="Support" />
        </div>
        <div className="support-content">
          <h2>Нужна помощь?</h2>
          <p>Наша служба поддержки всегда рядом и готова ответить на ваши вопросы.</p>
        </div>
        <div className="support-action">
          <button onClick={() => navigate("/contacts")}>Связаться с нами</button>
        </div>
      </div>
    </section>
    </div>
  );
};

export default Home;
