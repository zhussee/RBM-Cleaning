import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import star_full from "../assets/star_raiting_full.svg";
import star_empty from "../assets/star_raiting_empty.svg";
import companyImg from "../assets/company_img.png";
import "../styles/company.css";

const CompanyPage = () => {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/company/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCompany(data.company);
        setServices(data.services);
        setReviews(data.reviews);
      })
      .catch((err) => console.error("Ошибка загрузки компании:", err));
  }, [id]);

  const handleSelectService = (serviceId) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Пожалуйста, войдите в аккаунт, чтобы выбрать услугу.");
      navigate("/login");
      return;
    }

    navigate(`/checkout?service=${serviceId}&company=${id}`);
  };

  if (!company) return <p>Загрузка...</p>;

  return (
    <div className="company-page">
      <h1 className="company-cart-title">О КОМПАНИИ</h1>

      <div className="company-details">
        <div className="company-left">
          <div className="company-card">
            <img
              src={company.image ? `http://127.0.0.1:8000${company.image}` : companyImg}
              alt={company.name}
              className="company-img"
            />
          </div>
          <div className="company-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={star <= Math.round(company.average_rating || 0) ? star_full : star_empty}
                alt="star"
              />
            ))}
          </div>
        </div>

        <div className="company-right">
          <h2 className="company-title">{company.name}</h2>
          <p>{company.description}</p>
        </div>
      </div>

      <div className="company-services">
        <h2>Услуги</h2>
        {services.length > 0 ? (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <h3>{service.name_service}</h3>
                <ul className="service-features">
                  {service.description.split('\n').map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
                <p className="service-price">
                  <strong>{service.price_per_m2} тг/м²</strong> — {service.lead_time} мин
                </p>
                <button onClick={() => handleSelectService(service.id)}>
                  Выбрать услугу
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Услуги пока не добавлены.</p>
        )}
      </div>

      <div className="reviews-section">
        <h2 className="reviews-title">ОТЗЫВЫ</h2>
        {reviews.length === 0 ? (
          <p>Пока нет отзывов.</p>
        ) : (
          <ul className="reviews-list">
            {reviews.map((review, index) => (
              <li key={index}>
                <strong>🧑 {review.user}</strong>
                <p>{review.comment}</p>
                <small>{review.rating} ★</small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CompanyPage;
