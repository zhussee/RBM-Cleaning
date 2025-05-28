import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/checkoutpage.css";

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const serviceId = parseInt(searchParams.get("service"));
  const companyId = parseInt(searchParams.get("company"));

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [service, setService] = useState(null);
  const [total, setTotal] = useState(null);
  const [time, setTime] = useState("08:00–10:00");
  const [date, setDate] = useState("");
  const [extraServices, setExtraServices] = useState({
    windows: false,
    balcony: false,
  });
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [paymentType, setPaymentType] = useState("cash");
  const [comment, setComment] = useState("");

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token) {
      fetch("http://rbm-cleaning.kz/api/user/addresses/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setAddresses(data);
            setSelectedAddress(data[0].id);
          }
        });

      fetch(`/api/company/public/employees/${companyId}/`)
        .then((res) => res.json())
        .then((data) => setEmployees(data));
    }

    if (companyId && serviceId) {
      fetch(`/api/company/${companyId}/`)
        .then((res) => res.json())
        .then((data) => {
          const found = data.services.find((s) => s.id === serviceId);
          setService(found);
        });
    }
  }, [companyId, serviceId]);

  useEffect(() => {
    const addr = addresses.find((a) => a.id === parseInt(selectedAddress));
    if (addr && service) {
      let base = addr.square_meters * parseFloat(service.price_per_m2);
      if (extraServices.windows) base += 1500;
      if (extraServices.balcony) base += 2000;
      setTotal(base.toFixed(2));
    }
  }, [selectedAddress, service, addresses, extraServices]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (token && companyId) {
      fetch(`/api/company/public/employees/${companyId}/`)
        .then((res) => res.json())
        .then((data) => {
          setEmployees(data);
        });
    }
  }, [companyId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://test-epay.homebank.kz/payform/payment-api.js";
    script.async = true;

    script.onload = () => console.log("✅ Скрипт Epay загружен");
    script.onerror = () => console.error("❌ Не удалось загрузить скрипт Epay");

    document.body.appendChild(script);
  }, []);

  const handleCheckout = async () => {
    const token = localStorage.getItem("access_token");
    const additional_services = [
      ...(extraServices.windows ? [1] : []),
      ...(extraServices.balcony ? [2] : []),
    ];

    const orderData = {
      address: selectedAddress,
      service: serviceId,
      cleaning_date: date,
      cleaning_time: time,
      additional_services,
      payment_type: paymentType,
      comment,
    };

    if (selectedEmployee && selectedEmployee !== "") {
      const employeeId = parseInt(selectedEmployee);
      if (!isNaN(employeeId)) {
        orderData.employee = employeeId;
      }
    }

    try {
      const response = await fetch("/api/orders/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Ошибка при оформлении:", data);
        alert("Ошибка при оформлении заказа");
        return;
      }

      // 💳 Если нужна оплата картой
      if (data.payment_required && paymentType === "card") {
        const paymentObject = {
          invoiceId: data.order_id.toString().padStart(8, "0"),
          terminal: "67e34d63-102f-4bd1-898e-370781d0074d",
          amount: data.amount.toString(), // обязательно строкой
          currency: "KZT",
          auth: data.access_token,
          backLink: "http://rbm-cleaning.kz/profile",
          failureBackLink: "http://rbm-cleaning.kz/payment-failed",
          autoBackLink: true,
          description: "Оплата клининга",
          language: "rus",
          accountId: "testuser1",
          phone: "77000000000",
          name: "Тестовый клиент",
          email: "test@example.com",
          lifetime: 900,
        };

        if (
          typeof window.halyk === "undefined" ||
          typeof window.halyk.pay !== "function"
        ) {
          alert("Платёжный модуль не загружен");
          console.error("❌ window.halyk не инициализирован");
          return;
        }

        console.log("🔁 Запуск оплаты через Halyk...", paymentObject);
        window.halyk.pay(paymentObject);
      } else {
        // Перенаправление в личный кабинет при Kaspi или наличных
        navigate("/profile");
      }
    } catch (err) {
      console.error("Ошибка запроса:", err);
      alert("Произошла ошибка при оформлении");
    }
  };

  const timeSlots = [
    "08:00–10:00",
    "11:00–13:00",
    "14:00–16:00",
    "17:00–19:00",
    "20:00–22:00",
  ];

  return (
    <section className="cleaning_data">
      <h1 className="cleaning_data_title">Оформление заказа</h1>

      <div className="cleaning_data_block">
        <p className="cleaning_data_subtitle">Выбранная услуга:</p>
        <p className="cleaning_data_desc">{service?.name_service}</p>

        {addresses.length > 0 ? (
          <>
            <label className="cleaning_data_subtitle">Выберите адрес</label>
            <select
              value={selectedAddress || ""}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="cleaning_data_address_dropdown"
            >
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.city}, {addr.street}, д.{addr.house}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p>Сначала добавьте адрес в личном кабинете</p>
        )}

        <label className="cleaning_data_subtitle" style={{ marginTop: "20px" }}>
          Выберите дату уборки
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
          className="cleaning_data_address_dropdown"
        />

        <label className="cleaning_data_subtitle" style={{ marginTop: "20px" }}>
          Выберите время
        </label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="cleaning_data_address_dropdown small-select"
        >
          {timeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <div className="cleaning_data_row">
          <label className="cleaning_data_subtitle">Сотрудник</label>
          <select
            value={selectedEmployee}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedEmployee(value);
            }}
            className="cleaning_data_address_dropdown"
          >
            <option value="">Без выбора</option>
            {employees && employees.length > 0 ? (
              employees.map((emp, index) => (
                <option key={`emp-${index}`} value={emp.id}>
                  {emp.first_name || ""} {emp.surname || ""}
                </option>
              ))
            ) : (
              <option disabled>Нет доступных сотрудников</option>
            )}
          </select>
        </div>

        <div className="cleaning_data_row">
          <label className="cleaning_data_subtitle">Способ оплаты</label>
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="cleaning_data_address_dropdown"
          >
            <option value="cash">Наличными</option>
            <option value="card">Картой</option>
            <option value="kaspi">Kaspi QR</option>
          </select>
        </div>

        <div className="cleaning_data_row">
          <label className="cleaning_data_subtitle">Комментарий</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="cleaning_data_textarea"
            rows={3}
          />
        </div>

        <div className="cleaning_data_services_list">
          <p className="cleaning_data_subtitle">Дополнительные услуги</p>
          <label>
            <input
              type="checkbox"
              checked={extraServices.windows}
              onChange={(e) =>
                setExtraServices((prev) => ({
                  ...prev,
                  windows: e.target.checked,
                }))
              }
            />{" "}
            Мытье окон (+1500 ₸)
          </label>
          <label>
            <input
              type="checkbox"
              checked={extraServices.balcony}
              onChange={(e) =>
                setExtraServices((prev) => ({
                  ...prev,
                  balcony: e.target.checked,
                }))
              }
            />{" "}
            Уборка балкона (+2000 ₸)
          </label>
        </div>

        {total && (
          <div className="cleaning_data_order_sum">
            Сумма к оплате: <span>{parseFloat(total).toLocaleString()} ₸</span>
          </div>
        )}

        <button
          className="cleaning_data_submit_btn"
          disabled={!selectedAddress || !total || !time || !date}
          onClick={handleCheckout}
        >
          Перейти к оплате
        </button>
      </div>
    </section>
  );
};

export default CheckoutPage;
