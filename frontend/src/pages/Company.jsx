import React from "react";
import { Link } from "react-router-dom";
import "../styles/company.css";
import companyImage from "../assets/company_img.png";
import reviews_user_icon from "../assets/reviews_user_icon.svg";
import star_1 from "../assets/star_raiting_1.svg";
import star_2 from "../assets/star_raiting_2.svg";
import star_3 from "../assets/star_raiting_3.svg";
import star_4 from "../assets/star_raiting_4.svg";
import star_5 from "../assets/star_raiting_5.svg";
import star_6 from "../assets/star_raiting_6.svg";
import star_7 from "../assets/star_raiting_7.svg";
import star_8 from "../assets/star_raiting_8.svg";
import star_9 from "../assets/star_raiting_8.svg";
import star_full from "../assets/star_raiting_full.svg";
import star_empty from "../assets/star_raiting_empty.svg";

const Company = () => {
  return (
    <div className="company-page">
      <h2 className="company-cart-title">О КОМПАНИИ</h2>
      <div className="company-details">
        <div className="company-left">
          <div className="company-card">
            <img src={companyImage} alt="Company" className="company-img" />
          </div>
          <div className="company-rating">
            <img src={star_full} alt="Star" />
            <img src={star_full} alt="Star" />
            <img src={star_5} alt="Star" />
            <img src={star_empty} alt="Star" />
            <img src={star_empty} alt="Star" />
          </div>
        </div>

        <div className="company-right">
          <h2 className="company-title">CleanMaster</h2>
          <p>
            При нажатии на карточку партнера пользователь сможет ознакомиться с
            детальной информацией о компании: её услугах, рейтинге, отзывах
            клиентов и контактных данных.
          </p>
          <Link to="/services">
            <button className="company-service">Выбрать услугу</button>
          </Link>
        </div>
      </div>

      <div className="reviews-section">
        <h3 className="reviews-title">ОТЗЫВЫ</h3>
        <ul className="reviews-list">
          <li>
            <strong>
              <img src={reviews_user_icon} alt="user_icon" /> Пользователь 1:
            </strong>
            <br /> Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </li>
          <li>
            <strong>
              <img src={reviews_user_icon} alt="user_icon" /> Пользователь 2:
            </strong>
            <br /> Aenean commodo ligula eget dolor.
          </li>
          <li>
            <strong>
              <img src={reviews_user_icon} alt="user_icon" /> Пользователь 3:
            </strong>
            <br /> Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Company;
