import { useState } from "react";
import "../styles/aichatwidget.css";

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Здравствуйте! Я ИИ-консультант RBM Cleaning. Чем могу помочь?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Сброс высоты текстового поля после отправки
    const textarea = document.querySelector(".chat-input textarea");
    if (textarea) {
      textarea.style.height = "36px";
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/company/ai/chat/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );

      const data = await response.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "Произошла ошибка 😓" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div>
      <button className="chat-toggle-btn" onClick={toggleChat}>
        💬
      </button>

      {isOpen && (
        <div className="chat-box">
          <div className="chat-header">
            <span>Чат с ИИ</span>
            <button onClick={toggleChat} className="close-btn">
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-message ${msg.from}`}>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input">
            <textarea
              placeholder="Введите вопрос..."
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={1}
            />
            <button onClick={sendMessage} disabled={loading}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
