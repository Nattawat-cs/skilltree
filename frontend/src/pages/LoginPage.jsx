import { useState } from "react";
import "./LoginPage.css";

/* ---------- Compass icon (replaces the "O" in COMPASS) ---------- */
function CompassIcon({ size = 56 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 56"
      aria-hidden="true"
      className="cl-compass"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="28" cy="28" r="26" fill="currentColor" />
      <path
        d="M37 18 L31 30 L19 38 L25 26 Z"
        fill="#ffffff"
        stroke="#ffffff"
        strokeLinejoin="round"
      />
      <path d="M37 18 L31 30 L28 27 Z" fill="#b8d8bd" />
      <circle cx="28" cy="28" r="1.8" fill="#ffffff" />
    </svg>
  );
}

/* ---------- Login page ---------- */
export default function LoginPage({ onSubmit }) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Student ID ต้องเป็นตัวเลขเท่านั้น (ช่องว่างไม่ถือว่า error จนกว่าจะกด submit)
  // คำนวณจากค่าที่พิมพ์ จึงหายเองทันทีเมื่อแก้เป็นตัวเลขล้วน
  const isStudentIdInvalid = studentId !== "" && !/^\d+$/.test(studentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isStudentIdInvalid) return; // บล็อกการ submit ถ้ามีตัวอักษรปนอยู่

    if (!studentId.trim() || !password) {
      setError("Please enter your Student ID and password.");
      return;
    }

    try {
      setLoading(true);
      // ต่อ API จริงของคุณที่นี่ผ่าน prop onSubmit
      if (onSubmit) await onSubmit({ studentId: studentId.trim(), password });
    } catch (err) {
      setError(err?.message || "Login failed. Check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cl-page">
      <header className="cl-header">
        <h1 className="cl-logo" aria-label="CSTU Compass">
          <span>CSTU C</span>
          <CompassIcon />
          <span>MPASS</span>
        </h1>
        <div className="cl-header-rule" />
      </header>

      <main className="cl-main">
        <form className="cl-card" onSubmit={handleSubmit} noValidate>
          <h2 className="cl-title">Log In</h2>
          <p className="cl-subtitle">
            Enter your Student ID and password to continue.
          </p>
          <hr className="cl-divider" />

          <label className="cl-label" htmlFor="studentId">
            Student ID
          </label>
          <input
            id="studentId"
            className={`cl-input${isStudentIdInvalid ? " cl-input--error" : ""}`}
            type="text"
            inputMode="numeric"
            autoComplete="username"
            placeholder="Enter Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            aria-invalid={isStudentIdInvalid}
            aria-describedby={isStudentIdInvalid ? "studentId-error" : undefined}
          />
          {isStudentIdInvalid && (
            <p id="studentId-error" className="cl-field-error" role="alert">
              Student ID must contain numbers only.
            </p>
          )}

          <div className="cl-label-row">
            <label className="cl-label" htmlFor="password">
              Password
            </label>
            <a className="cl-forgot" href="/forgot-password">
              Forgot password?
            </a>
          </div>
          <input
            id="password"
            className="cl-input"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <p className="cl-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="cl-button"
            type="submit"
            disabled={loading || isStudentIdInvalid}
          >
            {loading ? "Logging in…" : "Log In"}
          </button>
        </form>
      </main>
    </div>
  );
}