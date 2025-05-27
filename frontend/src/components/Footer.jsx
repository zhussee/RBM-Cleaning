import React from "react";
import "../styles/footer.css";
import logo from "../assets/logo_icon.svg";
import instagram from "../assets/instagram_icon.svg";
import whatsapp from "../assets/whatsapp_icon.svg";
import facebook from "../assets/facebook_icon.svg";

const Footer = () => {
  return (
    // футер остаётся footer, но убедись, что он обёрнут в page-wrapper в App.jsx или Layout
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <img src={logo} alt="RBM Cleaning Logo" />
          <h2>
            RBM <br /> CLEANING
          </h2>
        </div>

        <div className="footer-right">
          <nav className="footer-nav">
            <a href="/">Главная</a>
            <a href="/about">О нас</a>
            <a href="/catalog">Каталог компаний</a>
            <a href="/contacts">Контакты</a>
          </nav>

          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <img src={instagram} alt="Instagram" />
            </a>
            <a href="https://wa.me" target="_blank" rel="noreferrer">
              <img src={whatsapp} alt="WhatsApp" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">
              <img src={facebook} alt="Facebook" />
            </a>
          </div>

          <div className="footer-links">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/copyright">Copyright Information</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
