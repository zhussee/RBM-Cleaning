import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/companyprofilepage.css";

const CompanyProfilePage = () => {
  const [companyInfo, setCompanyInfo] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    password: "",
    logo: null,
  });
  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("new");
  const [activeTab, setActiveTab] = useState("orders");
  const [services, setServices] = useState([]);
  const [extras, setExtras] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const STATUS_LABELS = {
    new: "Новые",
    confirmed: "Принятые",
    completed: "Завершённые",
    canceled: "Отменённые",
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCompany();
    fetchOrders();
    fetchServices();
    fetchExtras();
    fetchEmployees();
    fetchReviews();
  }, []);

  const fetchCompany = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/company/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setCompanyInfo(data);
      setOriginalData(data);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/company/orders/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const fetchServices = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/services/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setServices(data);
    }
  };

  const fetchExtras = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/additional-services/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setExtras(data);
    }
  };

  const fetchEmployees = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/company/employees/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setEmployees(data);
    }
  };

  const fetchReviews = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/company/reviews/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "logo" && files.length > 0) {
      setCompanyInfo((prev) => ({ ...prev, logo: files[0] }));
    } else {
      setCompanyInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(companyInfo).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const res = await fetch(
      "https://rbm-cleaning.kz/api/company/profile/update/",
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    if (res.ok) {
      alert("Профиль обновлён");
      setIsEditing(false);
      fetchCompany();
    } else {
      alert("Ошибка при обновлении профиля");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleConfirm = async (orderId) => {
    const res = await fetch(
      `https://rbm-cleaning.kz/api/company/orders/${orderId}/confirm/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      fetchOrders();
    } else {
      alert("Не удалось подтвердить заказ");
    }
  };

  const handleCancel = async (orderId) => {
    const res = await fetch(
      `https://rbm-cleaning.kz/api/company/orders/${orderId}/cancel/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      alert("Заказ отменён");
      fetchOrders();
    } else {
      alert("Не удалось отменить заказ");
    }
  };

  const handleEmployeeSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      first_name: e.target.first_name.value,
      last_name: e.target.last_name.value,
      email: e.target.email.value,
      phone_number: e.target.phone_number.value,
      password: e.target.password.value,
    };

    const res = await fetch("https://rbm-cleaning.kz/api/employees/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("Сотрудник добавлен");
      e.target.reset();
      fetchEmployees();
    } else {
      alert("Ошибка при добавлении сотрудника");
    }
  };

  const renderOrders = (ordersList) =>
    ordersList.length === 0 ? (
      <p>Нет заказов</p>
    ) : (
      ordersList.map((order) => (
        <div key={order.id} className="company-order-box">
          <p>
            <strong>Клиент:</strong> {order.client_name}
          </p>
          <p>
            <strong>Сотрудник:</strong>{" "}
            {order.employee_name || "Сотрудник не назначен"}
          </p>
          <p>
            <strong>Адрес:</strong> {order.address_name}
          </p>
          <p>
            <strong>Дата уборки:</strong> {order.cleaning_date || "—"}
          </p>
          <p>
            <strong>Время:</strong> {order.cleaning_time || "—"}
          </p>
          <p>
            <strong>Услуга:</strong> {order.service_name}
          </p>
          <p>
            <strong>Способ оплаты:</strong> {order.payment_type}
          </p>
          <p>
            <strong>Комментарий:</strong> {order.comment || "—"}
          </p>
          <p>
            <strong>Сумма:</strong> {order.total_amount} ₸
          </p>
          {order.status === "new" && (
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button
                onClick={() => handleConfirm(order.id)}
                className="edit-profile-btn"
              >
                Принять
              </button>
              <button
                onClick={() => handleCancel(order.id)}
                className="logout-btn"
              >
                Отменить
              </button>
            </div>
          )}
        </div>
      ))
    );

  return (
    <div className="company-profile-wrapper">
      <div className="company-profile-container">
        {/* Левая панель */}
        <div className="company-profile-card">
          <h2 className="profile-title">Профиль</h2>
          {!isEditing ? (
            <>
              {companyInfo.logo && (
                <img
                  src={
                    typeof companyInfo.logo === "string"
                      ? companyInfo.logo
                      : URL.createObjectURL(companyInfo.logo)
                  }
                  alt="Аватар"
                  className="profile-avatar"
                />
              )}
              <h3 className="profile-name">{companyInfo.name}</h3>
              <p className="profile-role">Компания</p>
              <p className="profile-label">Email</p>
              <p className="profile-value">{companyInfo.email}</p>
              <p className="profile-label">Телефон</p>
              <p className="profile-value">{companyInfo.phone}</p>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-profile-btn"
              >
                Редактировать профиль
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>

              {/* Добавить сотрудника */}
              <hr className="section-divider" />
              <h3 className="services-title">Добавить сотрудника</h3>
              <form className="services-form" onSubmit={handleEmployeeSubmit}>
                <div className="service-input">
                  <label>Имя</label>
                  <input type="text" name="first_name" required />
                </div>
                <div className="service-input">
                  <label>Фамилия</label>
                  <input type="text" name="last_name" required />
                </div>
                <div className="service-input">
                  <label>Email</label>
                  <input type="email" name="email" required />
                </div>
                <div className="service-input">
                  <label>Телефон</label>
                  <input type="tel" name="phone_number" required />
                </div>
                <div className="service-input">
                  <label>Пароль</label>
                  <input type="password" name="password" required />
                </div>
                <button type="submit" className="add-service-btn">
                  Добавить
                </button>
              </form>

              {/* Добавить услугу */}
              <hr className="section-divider" />
              <h3 className="services-title">Добавить услугу</h3>
              <form
                className="services-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = {
                    name_service: e.target.name_service.value,
                    description: e.target.description.value,
                    price_per_m2: parseFloat(e.target.price_per_m2.value),
                    lead_time: parseInt(e.target.lead_time.value),
                  };
                  const res = await fetch(
                    "https://rbm-cleaning.kz/api/services_add/",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(formData),
                    }
                  );
                  if (res.ok) {
                    alert("Услуга добавлена");
                    e.target.reset();
                    fetchCompany();
                  } else {
                    alert("Ошибка при добавлении услуги");
                  }
                }}
              >
                <div className="service-input">
                  <label>Название услуги</label>
                  <input type="text" name="name_service" required />
                </div>
                <div className="service-input">
                  <label>Описание</label>
                  <input type="text" name="description" />
                </div>
                <div className="service-input">
                  <label>Цена за м²</label>
                  <input
                    type="number"
                    step="0.01"
                    name="price_per_m2"
                    required
                  />
                </div>
                <div className="service-input">
                  <label>Время выполнения (в минутах)</label>
                  <input type="number" name="lead_time" required />
                </div>
                <button type="submit" className="add-service-btn">
                  Добавить услугу
                </button>
              </form>

              {/* Добавить доп. услугу */}
              <hr className="section-divider" />
              <h3 className="services-title">Добавить дополнительные услуги</h3>
              <form
                className="services-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = {
                    name: e.target.name.value,
                    price: parseFloat(e.target.price.value),
                  };
                  const res = await fetch(
                    "https://rbm-cleaning.kz/api/additional-services/",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify(formData),
                    }
                  );

                  if (res.ok) {
                    alert("Дополнительная услуга добавлена");
                    e.target.reset();
                    fetchExtras();
                  } else {
                    alert("Ошибка при добавлении дополнительной услуги");
                  }
                }}
              >
                <div className="service-input">
                  <label>Название доп. услуги</label>
                  <input type="text" name="name" required />
                </div>
                <div className="service-input">
                  <label>Цена за 1 услугу</label>
                  <input type="number" step="0.01" name="price" required />
                </div>
                <button type="submit" className="add-service-btn">
                  Добавить
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="company-form">
              <label>
                Фото: <input type="file" name="logo" onChange={handleChange} />
              </label>
              <label>
                Название:{" "}
                <input
                  type="text"
                  name="name"
                  value={companyInfo.name}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Описание:{" "}
                <textarea
                  name="description"
                  value={companyInfo.description}
                  onChange={handleChange}
                />
              </label>
              <label>
                Почта:{" "}
                <input
                  type="email"
                  name="email"
                  value={companyInfo.email}
                  onChange={handleChange}
                />
              </label>
              <label>
                Телефон:{" "}
                <input
                  type="tel"
                  name="phone"
                  value={companyInfo.phone}
                  onChange={handleChange}
                />
              </label>
              <label>
                Новый пароль:{" "}
                <input
                  type="password"
                  name="password"
                  value={companyInfo.password}
                  onChange={handleChange}
                />
              </label>
              <div className="button-group">
                <button type="submit">Сохранить</button>
                <button
                  type="button"
                  onClick={() => {
                    setCompanyInfo(originalData);
                    setIsEditing(false);
                  }}
                >
                  Отмена
                </button>
              </div>
              <button
                type="button"
                className="logout-btn"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </form>
          )}
        </div>

        {/* Правая панель */}
        <div className="company-orders-panel">
          <div className="tab-header">
            <h2>
              {activeTab === "orders"
                ? "Заказы"
                : activeTab === "services"
                ? "Услуги"
                : activeTab === "employees"
                ? "Сотрудники"
                : "Отзывы"}
            </h2>
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
            >
              <option value="orders">Заказы</option>
              <option value="services">Услуги</option>
              <option value="employees">Сотрудники</option>
              <option value="reviews">Отзывы</option>
            </select>
          </div>

          {activeTab === "orders" && (
            <>
              <div className="order-status-tabs">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    className={`order-status-tab ${
                      selectedStatus === key ? "active" : ""
                    }`}
                    onClick={() => setSelectedStatus(key)}
                  >
                    {label} (
                    {orders.filter((o) => o.status === key).length || 0})
                  </button>
                ))}
              </div>
              <div className="orders-list">
                {renderOrders(
                  orders.filter((o) => o.status === selectedStatus)
                )}
              </div>
            </>
          )}

          {activeTab === "services" && (
            <>
              <h3 className="services-title">Основные услуги</h3>
              {services.length === 0 ? (
                <p>Нет услуг</p>
              ) : (
                services.map((s) => (
                  <div key={s.id} className="company-order-box">
                    <p>
                      <strong>{s.name_service}</strong>
                    </p>
                    <p>{s.description}</p>
                    <p>Цена за м²: {s.price_per_m2} ₸</p>
                    <p>Время выполнения: {s.lead_time} мин</p>
                  </div>
                ))
              )}
              <h3 className="services-title">Дополнительные услуги</h3>
              {extras.length === 0 ? (
                <p>Нет дополнительных услуг</p>
              ) : (
                extras.map((a) => (
                  <div key={a.id} className="company-order-box">
                    <p>
                      <strong>{a.name}</strong>
                    </p>
                    <p>{a.description}</p>
                    <p>Цена: {a.price} ₸</p>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "employees" && (
            <>
              {employees.length === 0 ? (
                <p>Нет сотрудников</p>
              ) : (
                employees.map((emp) => (
                  <div key={emp.id} className="company-employee-box">
                    {emp.avatar && (
                      <img
                        src={emp.avatar}
                        alt="avatar"
                        className="employee-avatar"
                      />
                    )}
                    <div className="employee-info">
                      <p>
                        <strong>
                          {emp.first_name} {emp.last_name}
                        </strong>
                      </p>
                      <p>Email: {emp.email}</p>
                      <p>Телефон: {emp.phone_number}</p>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === "reviews" && (
            <>
              <h3 className="services-title">Отзывы клиентов</h3>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfilePage;
