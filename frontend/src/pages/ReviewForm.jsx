import React, { useState } from "react";

const ReviewForm = ({ orderId, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = comment.trim();
    if (trimmed.length < 3) return;

    onSubmit({ order: orderId, rating, comment: trimmed });
    setComment("");
    setRating(5);
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <label htmlFor="rating">Оценка:</label>
      <select
        id="rating"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      >
        {[5, 4, 3, 2, 1].map((r) => (
          <option key={r} value={r}>
            {r} ⭐
          </option>
        ))}
      </select>

      <label htmlFor="comment">Комментарий:</label>
      <textarea
        id="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Напишите ваш отзыв..."
        rows={3}
        required
      />

      <button type="submit">Отправить отзыв</button>
    </form>
  );
};

export default ReviewForm;
