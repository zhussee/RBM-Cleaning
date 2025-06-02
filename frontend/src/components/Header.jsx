import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo_icon.svg";
import homeIcon from "../assets/home.svg";
import catalogIcon from "../assets/catalog.svg";
import phoneIcon from "../assets/phone.svg";
import "../styles/header.css";

const Header = () => {
  const isAuthenticated = !!localStorage.getItem("access_token");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.querySelector(".hero-section");
      if (!hero) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      setScrolled(heroBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header_conteiner">
        <div className="mobile-header">
          <button className="burger" onClick={toggleMenu}>
            ☰
          </button>

          <div className="mobile-auth">
            {isAuthenticated ? (
              <Link to="/profile" className="profile-button">
                Личный кабинет
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  Вход
                </Link>
                <Link to="/registration" className="register-btn">
                  Регистрация
                </Link>
              </div>
            )}
          </div>

          <select className="language-select">
            <option value="ru">RU</option>
            <option value="kk">KZ</option>
          </select>
        </div>

        <nav className={`nav mobile-nav ${menuOpen ? "open" : ""}`}>
          <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
            <img src={homeIcon} alt="Главная" className="nav-icon" />
            Главная
          </Link>
          <Link
            to="/catalog"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <img src={catalogIcon} alt="Каталог" className="nav-icon" />
            Каталог компаний
          </Link>
          <Link
            to="/contacts"
            className="nav-link"
            onClick={() => setMenuOpen(false)}
          >
            <img src={phoneIcon} alt="Контакты" className="nav-icon" />
            Контакты
          </Link>
        </nav>

        {/* === Десктопная шапка === */}
        <div className="header_body desktop-only">
          <div className="left-group">
            <div className="logo">
              <Link to="/">
                <img src={logo} alt="Logo" />
              </Link>
            </div>

            <nav className="nav">
              <Link to="/" className="nav-link">
                <img src={homeIcon} alt="Главная" className="nav-icon" />
                Главная
              </Link>
              <Link to="/catalog" className="nav-link">
                <img src={catalogIcon} alt="Каталог" className="nav-icon" />
                Каталог компаний
              </Link>
              <Link to="/contacts" className="nav-link">
                <img src={phoneIcon} alt="Контакты" className="nav-icon" />
                Контакты
              </Link>
            </nav>
          </div>

          <div className="actions">
            <select className="language-select">
              <option value="ru">RU</option>
              <option value="kk">KZ</option>
            </select>

            {isAuthenticated ? (
              <Link to="/profile" className="profile-button">
                Личный кабинет
              </Link>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="login-btn">
                  Вход
                </Link>
                <Link to="/registration" className="register-btn">
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
