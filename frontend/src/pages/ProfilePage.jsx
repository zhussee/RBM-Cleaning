import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../styles/profilepage.css";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    patronymic: "",
    phone_number: "",
    email: "",
    avatar: null,
  });
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      jwtDecode(token);
      fetchProfile();
      fetchOrders();
      fetchAddresses();
    } catch (err) {
      console.error("Ошибка токена:", err);
      handleLogout();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/user/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();

      const data = await res.json();
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        patronymic: data.patronymic || "",
        phone_number: data.phone_number || "",
        email: data.email || "",
        avatar: data.avatar || null,
      });
    } catch (err) {
      console.error("Ошибка профиля:", err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/user/addresses/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();

      const data = await res.json();
      setAddresses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка адресов:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/user/orders/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) return handleLogout();

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Ошибка заказов:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = new FormData();
      for (const key in formData) {
        const value = formData[key];

        if (key === "avatar") {
          if (value instanceof File) {
            payload.append("avatar", value); 
          }
        } else if (value !== null && value !== undefined) {
          payload.append(key, value);
        }
      }

      const res = await fetch("/api/user/profile/", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });

      if (res.ok) {
        await fetchProfile();
        setIsEditing(false);
      } else {
        console.error("Ошибка при сохранении профиля");
      }
    } catch (err) {
      console.error("Ошибка сохранения:", err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Удалить этот адрес?")) return;

    try {
      const res = await fetch(`/api/user/addresses/${addressId}/`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok || res.status === 204) {
        setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      } else {
        alert("Не удалось удалить адрес. Попробуйте позже.");
      }
    } catch (err) {
      alert("Произошла ошибка при удалении.");
    }
  };

  const handleReviewSubmit = async () => {
    const response = await fetch("/api/reviews/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ order: selectedOrderId, rating, comment }),
    });

    if (response.ok) {
      setShowReviewModal(false);
      setRating(5);
      setComment("");
      fetchOrders();
    } else {
      alert("Ошибка при отправке отзыва");
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "new":
        return "Новый";
      case "confirmed":
        return "Принятый";
      case "completed":
        return "Завершённый";
      case "canceled":
        return "Отменённый";
      default:
        return "Неизвестный";
    }
  };

  return (
    <div className="profile-flex-container">
      {/* модалка */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Оцените выполненный заказ</h3>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((num) => (
                <span
                  key={num}
                  style={{
                    cursor: "pointer",
                    color: num <= rating ? "#ffc107" : "#ccc",
                  }}
                  onClick={() => setRating(num)}
                >
                  ★
                </span>
              ))}
            </div>
            <textarea
              placeholder="Опишите, как всё прошло"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={() => setShowReviewModal(false)}>Отмена</button>
              <button onClick={handleReviewSubmit}>Отправить</button>
            </div>
          </div>
        </div>
      )}

      {/* профиль */}
      <div className="profile-card">
        <h2>Профиль</h2>
        {formData.avatar && (
          <img
            src={formData.avatar}
            alt="avatar"
            className="profile-avatar"
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}

        <p className="profile-name">
          {formData.last_name} {formData.first_name} {formData.patronymic}
        </p>
        <p className="profile-role">Клиент</p>
        <p className="profile-email">{formData.email}</p>
        <p className="profile-phone">{formData.phone_number}</p>

        {isEditing ? (
          <div className="profile-edit-fields">
            <label>
              Аватар:
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    avatar: e.target.files[0],
                  }))
                }
              />
            </label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              placeholder="Фамилия"
            />
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              placeholder="Имя"
            />
            <input
              name="patronymic"
              value={formData.patronymic}
              onChange={handleChange}
              placeholder="Отчество"
            />
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Телефон"
            />
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <div className="profile-edit-buttons">
              <button onClick={handleSave}>Сохранить</button>
              <button onClick={() => setIsEditing(false)}>Отмена</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}>
            Редактировать профиль
          </button>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          Выйти
        </button>

        <hr />

        {/* адреса */}
        <div className="profile-addresses">
          <div className="profile-addresses-title">📍 Мои адреса</div>
          <ul className="profile-addresses-list">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <div className="address-details">
                  <strong>
                    {addr.city}, {addr.street}, д.{addr.house}
                  </strong>
                  <span>Кв. {addr.apartment}</span>
                  {addr.entrance && <span>Подъезд: {addr.entrance}</span>}
                  {addr.floor && <span>Этаж: {addr.floor}</span>}
                  {addr.bathrooms && <span>Санузлов: {addr.bathrooms}</span>}
                </div>
                <div className="address-actions">
                  <button onClick={() => handleDeleteAddress(addr.id)}>
                    🗑
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {!showForm ? (
            <button
              className="add-address-btn"
              onClick={() => setShowForm(true)}
            >
              Добавить адрес
            </button>
          ) : (
            <form
              className="address-form"
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = {
                  city: e.target.city.value,
                  street: e.target.street.value,
                  house: e.target.house.value,
                  apartment: e.target.apartment.value,
                  square_meters: parseFloat(e.target.square_meters.value),
                  entrance: e.target.entrance.value,
                  floor: parseInt(e.target.floor.value),
                  bathrooms: parseInt(e.target.bathrooms.value),
                };

                const res = await fetch(
                  "https://rbm-cleaning.kz/api/addresses/",
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
                  alert("Адрес добавлен");
                  fetchAddresses();
                  setShowForm(false);
                  e.target.reset();
                } else {
                  alert("Ошибка при добавлении адреса");
                }
              }}
            >
              <input type="text" name="city" placeholder="Город" required />
              <input type="text" name="street" placeholder="Улица" required />
              <input type="text" name="house" placeholder="Дом" required />
              <input
                type="text"
                name="apartment"
                placeholder="Квартира (необязательно)"
              />
              <input
                type="number"
                name="square_meters"
                placeholder="Площадь квартиры (м²)"
                required
              />
              <input type="text" name="entrance" placeholder="Подъезд" />
              <input type="number" name="floor" placeholder="Этаж" />
              <input
                type="number"
                name="bathrooms"
                placeholder="Количество санузлов"
              />
              <button type="submit" className="add-address-btn">
                Сохранить
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="orders-card">
        <h2>Мои заказы</h2>
        {orders.length === 0 ? (
          <p>У вас пока нет заказов</p>
        ) : (
          [...orders].reverse().map((order) => (
            <div key={order.id} className="order-box">
              <div className="order-top">
                <strong>{order.company_name}</strong>
                <span className={`order-status ${order.status}`}>
                  {renderStatus(order.status)}
                </span>
              </div>
              <p>📍 {order.address_name}</p>
              <p>👤 {order.employee_name || "Сотрудник не назначен"}</p>
              <p>
                <strong>Пожелания:</strong> {order.comment}
              </p>
              <p>
                <strong>Услуга:</strong> {order.service_name} —{" "}
                {order.total_amount?.toLocaleString()} ₸
              </p>

              {order.status === "completed" && !order.has_review && (
                <button
                  className="review-btn"
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setShowReviewModal(true);
                  }}
                >
                  Оставить отзыв
                </button>
              )}

              {order.status === "completed" && order.has_review && (
                <p className="review-exists">Отзыв уже оставлен</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
