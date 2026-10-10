
import { useState } from "react";
import "./Auth.css";

const API = "http://localhost:5000/api/auth";

export default function Auth({ onSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API}/${isSignup ? "signup" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            isSignup ? { name, email, password } : { email, password }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      onSuccess(data);
    } catch (err) {
      setError(err.message || "Unable to connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <aside className="auth-art">
          <div className="art-top">
            <span className="brand-mark">L.</span>
            <span className="art-label">EST. WITH STYLE</span>
          </div>

          <div className="landscape">
            <div className="girl-glow" />
            <img
              className="shopping-girl"
              src="/shopping-girl.png"
              alt="Stylish woman carrying shopping bags"
            />
            <div className="girl-sparkle sparkle-one">✦</div>
            <div className="girl-sparkle sparkle-two">✧</div>
            <div className="girl-sparkle sparkle-three">✦</div>
          </div>

          <div className="art-caption">
            <span className="eyebrow">A LITTLE SOMETHING SPECIAL</span>
            <h2>
              Your world.
              <br />
              <em>Your style.</em>
            </h2>
            <p>Discover everyday finds made for you.</p>
          </div>

          <div className="art-footer">
            <span>SAUMÉ STORE</span>
            <span>EVERYDAY FINDS © 2026</span>
          </div>
        </aside>

        <section className="auth-form-panel">
          <div className="mobile-brand">SAUMÉ STORE</div>

          <div className="form-heading">
            <span className="eyebrow">
              {isSignup ? "JOIN OUR WORLD" : "WELCOME BACK"}
            </span>
            <h1>
              {isSignup ? "Create an account" : "Sign in to SAUMÉ Store"}
            </h1>
            <p>
              {isSignup
                ? "Create your account and discover something lovely."
                : "Your next favourite find is waiting for you."}
            </p>
          </div>

          <form className="store-form" onSubmit={handleSubmit}>
            {isSignup && (
              <label>
                Full name
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
            )}

            <label>
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button
              className="auth-submit"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "PLEASE WAIT..."
                : isSignup
                  ? "CREATE ACCOUNT  ↗"
                  : "SIGN IN  ↗"}
            </button>
          </form>

          <div className="form-switch">
            <span>
              {isSignup
                ? "Already have an account?"
                : "New to SAUMÉ Store?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
            >
              {isSignup ? "Sign in" : "Create account"}
            </button>
          </div>

          <div className="form-bottom">
            <span>✦</span> A LITTLE STYLE, EVERY DAY
          </div>
        </section>
      </section>
    </main>
  );
}