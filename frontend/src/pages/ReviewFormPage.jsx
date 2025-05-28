// src/pages/ReviewFormPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/reviewform.css";

const ReviewFormPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://rbm-cleaning.kz/api/reviews/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        order: orderId,
        rating,
        comment,
      }),
    });

    if (response.ok) {
      alert("Отзыв отправлен!");
      navigate("/profile");
    } else {
      const errorData = await response.json();
      console.error("Ошибка:", errorData);
      alert("Ошибка при отправке отзыва");
    }
  };

  return (
    <div className="review_form">
      <h2 className="review_title">Оставить отзыв</h2>

      <form onSubmit={handleSubmit}>
        <label className="review_label">
          Оценка:
          <select
            className="review_select"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} ★
              </option>
            ))}
          </select>
        </label>

        <label className="review_label">
          Комментарий:
          <textarea
            className="review_textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш отзыв..."
          />
        </label>

        <button type="submit" className="review_btn">Отправить</button>
      </form>
    </div>
  );
};

export default ReviewFormPage;
