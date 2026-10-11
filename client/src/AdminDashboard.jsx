import { useState } from "react";

const API = import.meta.env.VITE_API_URL;

export default function AdminDashboard({ token, onBack }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "1",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not add product");
      }

      setMessage("Product added successfully!");
      setMessageType("success");

      setForm({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "1",
      });
    } catch (error) {
      setMessage(error.message || "Something went wrong");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-topbar">
        <button className="admin-back" onClick={onBack}>
          <span>←</span> Back to Store
        </button>

        <span className="admin-brand">
          SAUMÉ<span>.</span>
        </span>
      </div>

      <section className="admin-layout">
        <div className="admin-heading">
          <div className="admin-eyebrow">
            <span className="admin-dot" />
            STORE MANAGEMENT
          </div>

          <h1>Admin Dashboard</h1>

          <p>
            Add new arrivals and keep your store collection up to date.
          </p>
        </div>

        <div className="admin-card">
          <div className="admin-card-heading">
            <div className="admin-icon">✦</div>
            <div>
              <h2>Add a product</h2>
              <p>Enter the details below to list a new item.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="admin-field">
              <label htmlFor="product-name">Product name *</label>
              <input
                id="product-name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Classic everyday shirt"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-description">Description</label>
              <textarea
                id="product-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                rows="4"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="product-price">Price (₹) *</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="999"
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="product-stock">Stock quantity</label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="product-category">Category *</label>
              <input
                id="product-category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="e.g. Clothing, Home, Accessories"
                required
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-image">Product image URL *</label>
              <input
                id="product-image"
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                placeholder="https://example.com/product.jpg"
                required
              />
              <small>Paste a direct, publicly accessible image URL.</small>
            </div>

            {message && (
              <div
                className={`admin-message ${messageType}`}
                role="status"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="admin-submit"
              disabled={loading}
            >
              {loading ? "Adding product..." : "Add Product  →"}
            </button>
          </form>
        </div>

        <p className="admin-footer">
          SAUMÉ STORE <span>·</span> THOUGHTFULLY PICKED, EVERYDAY
        </p>
      </section>

      <style>{`
        .admin-page {
          min-height: 100vh;
          box-sizing: border-box;
          padding: 28px clamp(18px, 5vw, 76px) 35px;
          color: #f7f1e5;
          background:
            radial-gradient(ellipse at 50% 0%, #302510 0%, transparent 48%),
            #0b0b0a;
          font-family: Arial, Helvetica, sans-serif;
        }

        .admin-page * {
          box-sizing: border-box;
        }

        .admin-topbar {
          max-width: 1100px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 24px;
          border-bottom: 1px solid #3a301b;
        }

        .admin-back {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: 11px 16px;
          border: 1px solid #6d5725;
          border-radius: 30px;
          color: #f1d27a;
          background: #17140e;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }

        .admin-back:hover {
          background: #e6c65f;
          color: #17130a;
        }

        .admin-brand {
          color: #f1d27a;
          font-size: 25px;
          font-weight: 800;
          letter-spacing: 4px;
        }

        .admin-brand span {
          color: #fff6df;
        }

        .admin-layout {
          width: 100%;
          max-width: 760px;
          margin: 54px auto 0;
        }

        .admin-heading {
          margin-bottom: 28px;
          text-align: center;
        }

        .admin-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: #e7c66a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 3px;
        }

        .admin-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #e7c66a;
          box-shadow: 0 0 12px #e7c66a66;
        }

        .admin-heading h1 {
          margin: 16px 0 12px;
          color: #fff8e9;
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(32px, 5vw, 46px);
          font-weight: 500;
          letter-spacing: -1px;
        }

        .admin-heading p {
          margin: 0;
          color: #aaa397;
          font-size: 15px;
          line-height: 1.7;
        }

        .admin-card {
          padding: clamp(22px, 4vw, 38px);
          border: 1px solid #4b3b1d;
          border-radius: 18px;
          background: linear-gradient(145deg, #171510, #10100e);
          box-shadow: 0 20px 65px #00000045;
        }

        .admin-card-heading {
          display: flex;
          align-items: center;
          gap: 15px;
          padding-bottom: 24px;
          margin-bottom: 26px;
          border-bottom: 1px solid #30291b;
        }

        .admin-icon {
          display: grid;
          place-items: center;
          flex-shrink: 0;
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: #302714;
          color: #efd174;
          font-size: 24px;
        }

        .admin-card-heading h2 {
          margin: 0 0 7px;
          color: #f8f0df;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 24px;
          font-weight: 500;
        }

        .admin-card-heading p {
          margin: 0;
          color: #a9a194;
          font-size: 13px;
          line-height: 1.5;
        }

        .admin-form {
          display: grid;
          gap: 21px;
        }

        .admin-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .admin-field label {
          color: #e8d9b8;
          font-size: 13px;
          font-weight: 600;
        }

        .admin-field input,
        .admin-field textarea {
          display: block;
          width: 100%;
          min-width: 0;
          padding: 14px 15px;
          border: 1px solid #423824;
          border-radius: 9px;
          outline: none;
          color: #fff7e7;
          background: #0d0d0c;
          font-family: inherit;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .admin-field input {
          height: 48px;
        }

        .admin-field textarea {
          min-height: 105px;
          resize: vertical;
          line-height: 1.6;
        }

        .admin-field input::placeholder,
        .admin-field textarea::placeholder {
          color: #716b60;
        }

        .admin-field input:focus,
        .admin-field textarea:focus {
          border-color: #d8b653;
          box-shadow: 0 0 0 3px #d8b65318;
        }

        .admin-field small {
          color: #8f8779;
          font-size: 12px;
          line-height: 1.5;
        }

        .admin-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .admin-submit {
          width: 100%;
          min-height: 51px;
          margin-top: 3px;
          border: 1px solid #f0d276;
          border-radius: 9px;
          color: #171208;
          background: linear-gradient(110deg, #f3dc8b, #cda83e);
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: filter 0.2s, transform 0.2s;
        }

        .admin-submit:hover:not(:disabled) {
          filter: brightness(1.08);
          transform: translateY(-1px);
        }

        .admin-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .admin-message {
          padding: 13px 15px;
          border-radius: 8px;
          font-size: 14px;
          line-height: 1.5;
        }

        .admin-message.success {
          border: 1px solid #456a44;
          color: #b8e5ae;
          background: #172417;
        }

        .admin-message.error {
          border: 1px solid #7b3f37;
          color: #ffb6a9;
          background: #291613;
        }

        .admin-footer {
          margin: 30px 0 0;
          color: #817867;
          text-align: center;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .admin-footer span {
          padding: 0 7px;
          color: #d9b956;
        }

        @media (max-width: 560px) {
          .admin-page {
            padding: 18px 14px 26px;
          }

          .admin-topbar {
            padding-bottom: 18px;
          }

          .admin-brand {
            font-size: 19px;
            letter-spacing: 2px;
          }

          .admin-layout {
            margin-top: 35px;
          }

          .admin-heading p {
            font-size: 14px;
          }

          .admin-form-row {
            grid-template-columns: 1fr;
            gap: 21px;
          }

          .admin-card {
            border-radius: 13px;
          }
        }
      `}</style>
    </main>
  );
}
