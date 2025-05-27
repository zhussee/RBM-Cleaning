import React, { useState } from "react";
import "../../styles/addaddressform.css";

const AddAddressForm = ({ onAddressAdded }) => {
  const [form, setForm] = useState({
    city: "",
    street: "",
    house: "",
    apartment: "",
    square_meters: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Вы не авторизованы");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/addresses/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Ошибка ответа:", errorData);
        alert("Ошибка при добавлении адреса");
        return;
      }

      const newAddress = await response.json();
      onAddressAdded(newAddress); // добавляем в список
      setForm({
        city: "",
        street: "",
        house: "",
        apartment: "",
        square_meters: "",
      });
    } catch (error) {
      console.error("Ошибка запроса:", error);
      alert("Ошибка при добавлении адреса");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-address-form">
      <h3>Добавить адрес</h3>
      <input
        type="text"
        name="city"
        value={form.city}
        onChange={handleChange}
        placeholder="Город"
        required
      />
      <input
        type="text"
        name="street"
        value={form.street}
        onChange={handleChange}
        placeholder="Улица"
        required
      />
      <input
        type="text"
        name="house"
        value={form.house}
        onChange={handleChange}
        placeholder="Дом"
        required
      />
      <input
        type="text"
        name="apartment"
        value={form.apartment}
        onChange={handleChange}
        placeholder="Квартира (необязательно)"
      />
      <input
        type="number"
        name="square_meters"
        value={form.square_meters}
        onChange={handleChange}
        placeholder="Площадь квартиры (м²)"
        required
        min={1}
      />
      <button type="submit">Сохранить адрес</button>
    </form>
  );
};

export default AddAddressForm;
