import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../styles/catalog.css";
import search_icon from "../assets/search_icon.svg";
import arrow_down from "../assets/arrow_down.svg";
import arrowLeft from "../assets/arrow_left.svg";
import arrowRight from "../assets/arrow_right.svg";
import companyImg from "../assets/company_img.png";
import star_full from "../assets/star_raiting_full.svg";
import star_empty from "../assets/star_raiting_empty.svg";

const Catalog = () => {
  const [company, setcompany] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const companyPerPage = 6;

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/company/")
      .then((res) => res.json())
      .then((data) => setcompany(data))
      .catch((err) => console.error("Ошибка загрузки компаний:", err));
  }, []);

  const filteredcompany = company.filter((company) =>
    company.name.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLastCompany = currentPage * companyPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companyPerPage;
  const currentcompany = filteredcompany.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredcompany.length / companyPerPage);

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1 className="catalog-title">НАШИ ПАРТНЕРЫ</h1>
        <div className="catalog-controls">
          <div className="search-box">
            <img src={search_icon} alt="Search" className="search-icon" />
            <input
              type="text"
              placeholder="Поиск"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // сброс при поиске
              }}
            />
          </div>
          <button className="filter-btn">
            Фильтр
            <img src={arrow_down} alt="Filter" className="filter-icon" />
          </button>
        </div>
      </div>

      <div className="catalog-items">
        {currentcompany.length > 0 ? (
          currentcompany.map((company) => (
            <div key={company.id} className="catalog-item">
              <Link to={`/company/${company.id}`} className="catalog-image-link">
                <div className="catalog-image">
                  <img
                    src={company.image ? `http://127.0.0.1:8000${company.image}` : companyImg}
                    alt={company.name}
                  />
                  <div className="overlay">
                    <span>Подробнее</span>
                  </div>
                </div>
              </Link>

              <div className="catalog-info">
                <h2>{company.name}</h2>
                <p>{company.description}</p>

                <div className="catalog-rating">
                  <div className="rating-stars">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img
                        key={star}
                        src={star <= Math.round(company.average_rating || 0) ? star_full : star_empty}
                        alt="star"
                      />
                    ))}
                  </div>
                  <span className="rating-info">
                    {(company.average_rating || 0).toFixed(1)} ★
                  </span>
                </div>

                <Link to={`/company/${company.id}`} className="catalog-button-link">
                  <button>Подробнее</button>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <p className="no-results">Компаний не найдено.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="catalog-pagination">
          <button
            className="arrow-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <img src={arrowLeft} alt="Previous" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}

          <button
            className="arrow-btn"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <img src={arrowRight} alt="Next" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Catalog;
