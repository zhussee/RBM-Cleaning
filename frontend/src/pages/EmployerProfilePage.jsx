import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/companyprofilepage.css";

const EmployerProfilePage = () => {
  const [employeeInfo, setEmployeeInfo] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    avatar: null,
  });
  const [originalInfo, setOriginalInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("confirmed");

  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/employees/profile/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setEmployeeInfo(data);
      setOriginalInfo(data);
    }
  };

  const fetchOrders = async () => {
    const res = await fetch("https://rbm-cleaning.kz/api/user/employees/orders/", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  };

  const handleComplete = async (orderId) => {
    const res = await fetch(
      `https://rbm-cleaning.kz/api/user/employees/orders/${orderId}/complete/`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.ok) {
      fetchOrders();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files.length > 0) {
      setEmployeeInfo({ ...employeeInfo, avatar: files[0] });
    } else {
      setEmployeeInfo({ ...employeeInfo, [name]: value });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (const key in employeeInfo) {
      if (employeeInfo[key] !== null && employeeInfo[key] !== undefined) {
        formData.append(key, employeeInfo[key]);
      }
    }

    const res = await fetch(
      "https://rbm-cleaning.kz/api/employees/profile/update/",
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (res.ok) {
      const data = await res.json();
      setEmployeeInfo(data);
      setIsEditing(false);
      fetchProfile();
    } else {
      alert("Ошибка при сохранении профиля");
    }
  };

  const renderOrders = (orderList, isCompleted = false) =>
    orderList.length === 0 ? (
      <p>Нет заказов</p>
    ) : (
      orderList.map((order) => (
        <div key={order.id} className="company-order-box">
          <p>
            <strong>Адрес:</strong> {order.address_name}
          </p>
          <p>
            <strong>Дата:</strong> {order.cleaning_date || "—"}
          </p>
          <p>
            <strong>Время:</strong> {order.cleaning_time || "—"}
          </p>
          <p>
            <strong>Комментарий:</strong> {order.comment || "—"}
          </p>
          <p>
            <strong>Способ оплаты:</strong> {order.payment_type || "—"}
          </p>
          <p>
            <strong>Услуга:</strong> {order.service_name}
          </p>
          <p>
            <strong>Сумма:</strong> {order.total_amount} ₸
          </p>
          {!isCompleted && (
            <button
              className="add-service-btn"
              onClick={() => handleComplete(order.id)}
            >
              Завершить
            </button>
          )}
        </div>
      ))
    );

  const STATUS_LABELS = {
    confirmed: "Принятые",
    completed: "Завершённые",
  };

  return (
    <div className="company-profile-wrapper">
      <div className="company-profile-container">
        <div className="company-profile-card">
          <h2 className="profile-title">Профиль</h2>

          {!isEditing ? (
            <>
              {employeeInfo.avatar && (
                <img
                  src={employeeInfo.avatar}
                  alt="avatar"
                  className="profile-avatar"
                />
              )}
              <h3 className="profile-name">
                {employeeInfo.first_name} {employeeInfo.last_name}
              </h3>
              <p className="profile-role">Сотрудник</p>
              <p className="profile-label">Email</p>
              <p className="profile-value">{employeeInfo.email}</p>
              <p className="profile-label">Телефон</p>
              <p className="profile-value">{employeeInfo.phone_number}</p>
              <button
                className="edit-profile-btn"
                onClick={() => setIsEditing(true)}
              >
                Редактировать профиль
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <form className="company-form" onSubmit={handleProfileSubmit}>
              <div className="custom-file-upload">
                <label htmlFor="avatar">Загрузить аватар</label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              </div>

              <label>
                Имя:
                <input
                  type="text"
                  name="first_name"
                  value={employeeInfo.first_name}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Фамилия:
                <input
                  type="text"
                  name="last_name"
                  value={employeeInfo.last_name || ""}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={employeeInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </label>
              <label>
                Телефон:
                <input
                  type="tel"
                  name="phone_number"
                  value={employeeInfo.phone_number}
                  onChange={handleInputChange}
                />
              </label>
              <label>
                Новый пароль:
                <input
                  type="password"
                  name="password"
                  value={employeeInfo.password || ""}
                  onChange={handleInputChange}
                />
              </label>
              <div className="button-group">
                <button type="submit">Сохранить</button>
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeInfo(originalInfo);
                    setIsEditing(false);
                  }}
                >
                  Отмена
                </button>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </form>
          )}
        </div>

        <div className="company-orders-panel">
          <h2>Заказы</h2>
          <div className="order-status-tabs">
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <button
                key={key}
                className={`order-status-tab ${
                  selectedStatus === key ? "active" : ""
                }`}
                onClick={() => setSelectedStatus(key)}
              >
                {label} ({orders.filter((o) => o.status === key).length})
              </button>
            ))}
          </div>

          <div className="orders-list">
            {renderOrders(
              orders.filter((o) => o.status === selectedStatus),
              selectedStatus === "completed"
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfilePage;
