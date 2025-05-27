import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Catalog from "./pages/Catalog";
import CompanyPage from "./pages/CompanyPage";
import Services from "./pages/Services";
import AuthPage from "./pages/AuthPage";
import RegisterPage from "./pages/RegisterPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import CheckoutPage from "./pages/CheckoutPage";
import PhoneConfirmationPage from "./pages/PhoneConfirmationPage";
import PrivateRoute from "./context/PrivateRoute";
import PasswordResetConfirmPage from "./pages/PasswordResetConfirmPage";
import PasswordResetRequestPage from "./pages/PasswordResetRequestPage";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import PaymentPage from "./pages/PaymentPage";
import ReviewFormPage from "./pages/ReviewFormPage";
import ContactPage from "./pages/ContactPage";
import AiChatWidget from "./components/AiChatWidget";
// Профильные страницы
import ProfilePage from "./pages/ProfilePage";
import CompanyProfilePage from "./pages/CompanyProfilePage";
import EmployerProfilePage from "./pages/EmployerProfilePage";

// Динамический выбор компонента профиля
const ProfileRouter = () => {
  const [status, setStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const token = localStorage.getItem("access_token");

  React.useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        setStatus(data.raw_status || data.status);
      } catch (err) {
        console.error("Ошибка получения профиля:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  if (loading) return <div>Загрузка...</div>;

  switch (status) {
    case "company":
      return <CompanyProfilePage />;
    case "employee":
      return <EmployerProfilePage />;
    default:
      return <ProfilePage />;
  }
};

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/contacts" element={<ContactPage />} />
        <Route path="/company/:id" element={<CompanyPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/registration" element={<RegisterPage />} />
        <Route path="/email_confirmation" element={<EmailConfirmationPage />} />
        <Route path="/phone_confirmation" element={<PhoneConfirmationPage />} />
        <Route path="/password-reset" element={<PasswordResetRequestPage />} />
        <Route path="/confirm_email/:uid/:token" element={<ConfirmEmailPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/orders/:orderId/review" element={<ReviewFormPage />} />
        <Route
          path="/password-reset-confirm/:uid/:token"
          element={<PasswordResetConfirmPage />}
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <ProfileRouter />
            </PrivateRoute>
          }
        />
      </Routes>
      <AiChatWidget />
      <Footer />
    </div>
  );
}

export default App;
