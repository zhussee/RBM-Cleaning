import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/paymentpage.css";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const token = localStorage.getItem("access_token");

  const { service_id, address_id, company_id, total } = state || {};

  const handlePay = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          service: service_id,
          address: address_id,
          company: company_id,
          additional_services: [],
        }),
      });

      if (response.ok) {
        alert("Оплата прошла успешно ✅ Заказ сохранён");
        navigate("/profile");
      } else {
        alert("Ошибка при создании заказа ❌");
      }
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      alert("Сервер недоступен");
    }
  };

  return (
    <div className="payment-container">
      <h1>Подтверждение оплаты</h1>

      <div className="payment-info">
        <p><span>Услуга ID:</span> {service_id}</p>
        <p><span>Адрес ID:</span> {address_id}</p>
        <p><span>Компания ID:</span> {company_id}</p>
        <p className="total">
          <span>Сумма к оплате:</span> {parseFloat(total || 0).toLocaleString()} ₸
        </p>
      </div>

      <button className="pay-button" onClick={handlePay}>Оплатить</button>
    </div>
  );
};

export default PaymentPage;
