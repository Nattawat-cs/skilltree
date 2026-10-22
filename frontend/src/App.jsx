import { useState } from "react";
import "./App.css";
import LoginPage from "./pages/LoginPage";
import Home from "./pages/Homepage";

function App() {
  // เช็กว่าเคย login ไว้ไหม (รีเฟรชหน้าแล้วไม่ต้อง login ใหม่)
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem("isLoggedIn") === "true"
  );

  const handleLogin = async ({ studentId, password }) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: studentId, password }),
    });
    // LoginPage เอา error.message ไปแสดงใต้ฟอร์ม
    if (res.status === 401) throw new Error("Invalid Student ID or password.");
    if (res.status === 403) throw new Error("Only students can log in.");
    if (!res.ok) throw new Error("Login failed. Please try again later.");

    // เก็บข้อมูลนักศึกษาไว้ให้ Upperbar ใช้ (session จริงอยู่ใน cookie ที่ browser ถือเอง)
    localStorage.setItem("user", JSON.stringify(await res.json()));
    localStorage.setItem("isLoggedIn", "true");
    setIsLoggedIn(true);
  };

  // ปุ่ม Logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };

  return isLoggedIn ? (
    <Home onLogout={handleLogout} />
  ) : (
    <LoginPage onSubmit={handleLogin} />
  );
}

export default App;