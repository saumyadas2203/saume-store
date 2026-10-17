
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  X,
  Star,
  ArrowUpRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headset,
  UserRound,
  Menu,
  Heart,
} from "lucide-react";
import "./styles.css";
import Auth from "./Auth.jsx";
import AdminDashboard from "./AdminDashboard.jsx";

const API = import.meta.env.VITE_API_URL;

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const categoryVisuals = {
  Accessories:
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
  Electronics:
    "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80",
  Fashion:
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80",
  Home:
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=500&q=80",
};

export default function App() {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("token"),
    user: JSON.parse(localStorage.getItem("user") || "null"),
  }));

  const [adminOpen, setAdminOpen] = useState(false);
  const [customerCareOpen, setCustomerCareOpen] = useState("");
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [orderConfirmation, setOrderConfirmation] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  function handleAuthSuccess(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setAuth({ token: data.token, user: data.user });
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuth({ token: null, user: null });
    setCart([]);
    setCartOpen(false);
    setAdminOpen(false);
  }

  useEffect(() => {
    if (!auth.token) {
      setWishlist([]);
      setWishlistProducts([]);
      return;
    }

    const controller = new AbortController();

    async function loadWishlist() {
      try {
        setWishlistLoading(true);
        const response = await fetch(`${API}/wishlist`, {
          headers: { Authorization: `Bearer ${auth.token}` },
          signal: controller.signal,
        });

        if (!response.ok) throw new Error("Could not load wishlist");

        const data = await response.json();
        setWishlistProducts(data);
        setWishlist(data.map((product) => product._id));
      } catch (err) {
        if (err.name !== "AbortError") {
          setWishlistMessage("Wishlist could not be loaded.");
        }
      } finally {
        if (!controller.signal.aborted) setWishlistLoading(false);
      }
    }

    loadWishlist();
    return () => controller.abort();
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token) {
      setLoading(false);
      setProducts([]);
      return;
    }

    const controller = new AbortController();

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        if (search.trim()) params.set("search", search.trim());
        if (category !== "All") params.set("category", category);

        const response = await fetch(`${API}/products?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("The product API returned an error.");
        }

        setProducts(await response.json());
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "Could not load products. Check that the backend and MongoDB are running."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [search, category, auth.token]);

const categories = ["All", "Fashion", "Home", "Accessories", "Electronics"];


  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  async function toggleWishlist(product) {
    if (!auth.token) return;

    const alreadySaved = wishlist.includes(product._id);
    setWishlistMessage("");

    try {
      const response = await fetch(`${API}/wishlist/${product._id}`, {
        method: alreadySaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Wishlist update failed");
      }

      setWishlist((current) =>
        alreadySaved
          ? current.filter((id) => id !== product._id)
          : [...current, product._id]
      );

      setWishlistProducts((current) =>
        alreadySaved
          ? current.filter((item) => item._id !== product._id)
          : current.some((item) => item._id === product._id)
            ? current
            : [...current, product]
      );

      setWishlistMessage(
        alreadySaved ? "Removed from wishlist" : "Added to wishlist"
      );
    } catch (err) {
      setWishlistMessage(err.message || "Could not update wishlist");
    }
  }

  function addToCart(product) {
    if (Number(product.stock) <= 0) {
      window.alert("This product is out of stock.");
      return;
    }

    setCart((current) => {
      const found = current.find((item) => item._id === product._id);

      if (found) {
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, Number(item.stock)),
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setCartOpen(true);
  }

  function changeQuantity(id, delta) {
    setCart((current) =>
      current.map((item) =>
        item._id === id
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(Number(item.stock), item.quantity + delta)
              ),
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item._id !== id));
  }

  function updateShippingAddress(event) {
    const { name, value } = event.target;
    setShippingAddress((current) => ({ ...current, [name]: value }));
  }

  function placeCodOrder(event) {
    event.preventDefault();
    setCheckoutMessage("");
    setOrderConfirmation("");

    if (!auth.token) {
      setCheckoutMessage("Please log in again before continuing.");
      return;
    }

    if (cart.length === 0) {
      setCheckoutMessage("Your cart is empty.");
      return;
    }

    setCheckoutLoading(true);
    const demoConfirmation =
      "Order Placed Successfully! (Demo only — no real order was created. Your cart and stock are unchanged.)";
    setOrderConfirmation(demoConfirmation);
    window.alert(demoConfirmation);
    setCheckoutOpen(false);
    setCartOpen(false);
    setCheckoutMessage("");
    setCheckoutLoading(false);
  }

  if (!auth.token) {
    return <Auth onSuccess={handleAuthSuccess} />;
  }

  if (adminOpen && auth.user?.role === "admin") {
    return (
      <AdminDashboard
        token={auth.token}
        onBack={() => setAdminOpen(false)}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="top-strip">
        <div className="page-container top-strip-inner">
          <span className="welcome-copy"><strong>Welcome to SAUMÉ Store</strong><small>EVERYDAY ESSENTIALS, THOUGHTFULLY PICKED.</small></span>
          <div>
            <a href="/story.html">About us</a>
            <span className="top-divider">|</span>
            <a href="#footer">Help &amp; support</a>
          </div>
        </div>
      </div>

      <header className="header">
        <div className="page-container header-main">
          <a className="brand" href="#" aria-label="SAUMÉ Store home">
            <span className="brand-mark"><ShoppingBag size={22} /></span>
            <span>SAUMÉ<span className="brand-light">store.</span></span>
          </a>

          <div className="header-search search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for products..."
              aria-label="Search products"
            />
            <button
              aria-label="Search"
              onClick={() =>
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              <ArrowUpRight size={17} />
            </button>
          </div>

          <div className="header-actions">
            <a className="account-link" href="#footer">
              <UserRound size={18} />
              <span>{auth.user?.name || "My Account"}</span>
            </a>

            {auth.user?.role === "admin" && (
              <button className="account-link" onClick={() => setAdminOpen(true)}>
                Admin Dashboard
              </button>
            )}

            <button
              className="cart-button"
              onClick={() => setCartOpen(true)}
              aria-label="Open shopping cart"
            >
              <ShoppingCart size={19} />
              <span>Cart</span>
              <b>{cartCount}</b>
            </button>

            <button className="account-link" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="main-nav">
          <div className="page-container nav-inner">
            <a className="category-menu" href="#categories">
              <Menu size={17} /> All Categories
            </a>
            <div className="nav-links">
              <a className="selected" href="#">Home</a>
              <a href="#shop">Shop</a>
              <a href="#shop">Shop Detail</a>
              <a href="/story.html">Pages</a>
              <a href="#footer">Contact</a>
            </div>
            <span className="nav-promo">Everyday finds, better prices</span>
          </div>
        </nav>
      </header>

      <main className="page-container">
        {orderConfirmation && (
          <div
            role="status"
            style={{
              margin: "18px 0",
              padding: "14px 16px",
              borderRadius: "10px",
              border: "1px solid #a7d7b5",
              background: "#effaf2",
              color: "#176b35",
            }}
          >
            <strong>{orderConfirmation}</strong>
            <button
              type="button"
              onClick={() => setOrderConfirmation("")}
              aria-label="Dismiss order confirmation"
              style={{ float: "right", border: 0, background: "transparent", cursor: "pointer", color: "inherit" }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <section className="hero-layout">
          <div className="hero-banner">
            <img
              src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1500&q=85"
              alt="Fashion collection"
            />
            <div className="hero-overlay"></div>
            <div className="hero-copy">
              <p className="eyebrow">THE EVERYDAY EDIT</p>
              <h1>Find your<br /><em>everyday style.</em></h1>
              <p>Fresh finds for your home, wardrobe and everything in between.</p>
              <a className="primary-button" href="#shop">
                Shop collection <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-pagination">
              <span className="active"></span><span></span><span></span>
            </div>
          </div>

          <div className="offer-stack">
            <article className="offer-card offer-one">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=700&q=80"
                alt="Clothing store"
              />
              <div>
                <span>UP TO 25% OFF</span>
                <h3>Special offer</h3>
                <a href="#shop">Shop now <ArrowUpRight size={14} /></a>
              </div>
            </article>
            <article className="offer-card offer-two">
              <img
                src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=700&q=80"
                alt="Desk essentials"
              />
              <div>
                <span>SMALL THINGS, BIG JOY</span>
                <h3>Home favourites</h3>
                <a href="#shop">Shop now <ArrowUpRight size={14} /></a>
              </div>
            </article>
          </div>
        </section>

        <section className="benefits-row" aria-label="Store benefits">
          <div className="benefit">
            <span className="benefit-icon"><ShieldCheck size={23} /></span>
            <div><b>Quality products</b><small>Picked with care</small></div>
          </div>
          <div className="benefit">
            <span className="benefit-icon"><Truck size={23} /></span>
            <div><b>Free shipping</b><small>On orders over ₹2,000</small></div>
          </div>
          <div className="benefit">
            <span className="benefit-icon"><RotateCcw size={22} /></span>
            <div><b>14-day returns</b><small>Easy and hassle-free</small></div>
          </div>
          <div className="benefit">
            <span className="benefit-icon"><Headset size={23} /></span>
            <div><b>Friendly support</b><small>Here when you need us</small></div>
          </div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading compact-heading">
            <div>
              <p className="eyebrow">BROWSE YOUR FAVOURITES</p>
              <h2>Shop by <em>category</em></h2>
            </div>
            <a className="text-link" href="#shop">
              View all products <ArrowUpRight size={16} />
            </a>
          </div>

          <div className="category-grid">
            {["Accessories", "Electronics", "Fashion", "Home"].map((item) => (
              <button
                className="category-card"
                key={item}
                onClick={() => {
                  setCategory(item);
                  document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <img src={categoryVisuals[item]} alt="" loading="lazy" />
                <span className="category-card-shade"></span>
                <span className="category-card-label">
                  <b>{item}</b>
                  <small>Explore collection <ArrowUpRight size={13} /></small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="shop-section" id="shop">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE GOOD STUFF</p>
              <h2>Recent <em>products</em></h2>
            </div>

            <div className="shop-tools">
              <div className="search-box mobile-search">
                <Search size={18} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  aria-label="Search products"
                />
              </div>
              <div className="category-row">
                {categories.map((item) => (
                  <button
                    key={item}
                    className={`category-pill ${category === item ? "active" : ""}`}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="wishlist-toolbar">
            <button
              className="wishlist-toggle"
              onClick={() => setWishlistOpen((open) => !open)}
              aria-expanded={wishlistOpen}
            >
              <Heart size={17} /> My Wishlist ({wishlist.length})
            </button>
            {wishlistMessage && (
              <span className="wishlist-status" role="status">{wishlistMessage}</span>
            )}
          </div>

          {wishlistOpen && (
            <section className="wishlist-panel" aria-label="My Wishlist">
              <div className="wishlist-panel-heading">
                <h3>My Wishlist</h3>
                <button className="icon-button" onClick={() => setWishlistOpen(false)} aria-label="Close wishlist">
                  <X size={18} />
                </button>
              </div>
              {wishlistLoading ? (
                <p className="wishlist-empty">Loading wishlist...</p>
              ) : wishlistProducts.length === 0 ? (
                <p className="wishlist-empty">Your wishlist is empty. Tap the heart on a product to save it.</p>
              ) : (
                <div className="wishlist-items">
                  {wishlistProducts.map((product) => (
                    <article className="wishlist-item" key={product._id}>
                      <img src={product.image} alt={product.name} />
                      <div className="wishlist-item-info">
                        <strong>{product.name}</strong>
                        <p>{money(product.price)}</p>
                        <div className="wishlist-item-actions">
                          <button onClick={() => addToCart(product)}>Add to cart</button>
                          <button onClick={() => toggleWishlist(product)}>Remove</button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {loading ? (
            <div className="state-message">Finding good things for you…</div>
          ) : error ? (
            <div className="state-message error">
              {error}<br />
              <small>Run the server setup steps in README.md.</small>
            </div>
          ) : products.length === 0 ? (
            <div className="state-message">No products found. Try another search.</div>
          ) : (
            <div className="product-grid product-slider">
              {products.map((product, index) => (
                <article className="product-card" key={product._id}>
                  <div className="product-image-wrap">
                    <img src={product.image} alt={product.name} loading="lazy" />
                    {index === 0 && <span className="product-tag">POPULAR PICK</span>}
                    <button
                      className={`wishlist-button ${wishlist.includes(product._id) ? "active" : ""}`}
                      onClick={() => toggleWishlist(product)}
                      aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                      title={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <Heart size={18} fill={wishlist.includes(product._id) ? "currentColor" : "none"} />
                    </button>
                    <button
                      className="quick-add"
                      onClick={() => addToCart(product)}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="product-card-content">
                    <div className="product-meta">
                      <span>{product.category}</span>
                      <span className="rating">
                        <Star size={13} fill="currentColor" />
                        {product.rating ?? "New"}
                      </span>
                    </div>
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <div className="product-bottom">
                      <strong>{money(product.price)}</strong>
                      <button onClick={() => addToCart(product)}>
                        Add to cart <ArrowUpRight size={15} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="story-section" id="story">
          <div className="story-symbol">✳</div>
          <p className="eyebrow">A SMALLER, HAPPIER KIND OF SHOPPING</p>
          <h2>Useful things.<br /><em>Thoughtfully picked.</em></h2>
          <p>
            We believe the little things can make an ordinary day feel special.
            Find your next everyday favourite here.
          </p>
          <a className="primary-button" href="#shop">
            Discover the collection <ArrowUpRight size={17} />
          </a>
        </section>
      </main>

      <footer id="footer">
        <div className="page-container footer-main">
          <div className="footer-brand-col">
            <a className="brand" href="#">
              <span className="brand-mark"><ShoppingBag size={20} /></span>
              <span>SAUMÉ<span className="brand-light">store.</span></span>
            </a>
            <p>Everyday essentials, thoughtfully picked for you.</p>
          </div>

          <div className="footer-col">
            <b>Quick links</b>
            <a href="#shop">Shop all</a>
            <a href="#categories">Categories</a>
            

<a href="/story.html">
  Our story
</a>


          </div>

          <div className="footer-col">
            <b>Customer care</b>
            <a href="#footer" onClick={(e) => { e.preventDefault(); setCustomerCareOpen("contact"); }}>Contact us</a>
            <a href="#footer" onClick={(e) => { e.preventDefault(); setCustomerCareOpen("shipping"); }}>Shipping &amp; returns</a>
            <a href="#footer" onClick={(e) => { e.preventDefault(); setCustomerCareOpen("faqs"); }}>FAQs</a>
          </div>

          <div className="footer-col newsletter">
            <b>Stay in the loop</b>
            <p>New finds and little offers, now and then.</p>
            <div>
              <input placeholder="Your email address" aria-label="Your email address" />
              <button aria-label="Subscribe"><ArrowUpRight size={17} /></button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="page-container">
            <span>© 2026 SAUMÉ Store · Mini MERN learning project</span>
            <span>Made with care, for everyday life.</span>
          </div>
        </div>
      </footer>

      {customerCareOpen && (
        <div
          onClick={() => setCustomerCareOpen("")}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,.78)", backdropFilter: "blur(7px)",
            display: "grid", placeItems: "center", padding: "20px"
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="care-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative", width: "min(100%, 520px)",
              maxHeight: "85vh", overflowY: "auto",
              background: "linear-gradient(145deg,#191611,#0e0d0b)",
              color: "#f6eddd", border: "1px solid rgba(217,184,120,.65)",
              padding: "36px 30px", boxShadow: "0 25px 90px rgba(0,0,0,.6)"
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setCustomerCareOpen("")}
              style={{
                position: "absolute", top: 12, right: 14,
                background: "transparent", border: "1px solid #8d744b",
                color: "#e2c48b", fontSize: 22, width: 36, height: 36,
                cursor: "pointer"
              }}
            >×</button>

            <p style={{
              color: "#d9b878", letterSpacing: "3px",
              fontSize: 11, textTransform: "uppercase"
            }}>SAUMÉ · CUSTOMER CARE</p>

            <h2 id="care-title" style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 32, fontWeight: 500, margin: "8px 0 22px",
              color: "#f0d7a5"
            }}>
              {customerCareOpen === "contact" ? "Contact us" :
               customerCareOpen === "shipping" ? "Shipping & Returns" : "Frequently Asked Questions"}
            </h2>

            {customerCareOpen === "contact" && (
              <div style={{ lineHeight: 1.9 }}>
                <p>We're here to help with your SAUMÉ shopping experience.</p>
                <p style={{ color: "#d9b878" }}>Need help with an order?</p>
                <p>Please contact the store owner through the official contact details provided for your store.</p>
                <p style={{ fontSize: 13, color: "#bdb3a2" }}>A customer-care email or phone number can be added here once you choose which details to publish.</p>
              </div>
            )}

            {customerCareOpen === "shipping" && (
              <div style={{ lineHeight: 1.9 }}>
                <h3 style={{ color: "#d9b878" }}>Shipping</h3>
                <p>Free shipping is advertised on orders over ₹2,000. Shipping charges and delivery estimates should be confirmed at checkout.</p>
                <h3 style={{ color: "#d9b878", marginTop: 22 }}>Returns</h3>
                <p>The store advertises 14-day returns. Please contact the store owner to confirm eligibility and the return process before sending an item back.</p>
              </div>
            )}

            {customerCareOpen === "faqs" && (
              <div style={{ lineHeight: 1.8 }}>
                <details style={{ borderBottom: "1px solid #51432d", padding: "13px 0" }}>
                  <summary style={{ cursor: "pointer", color: "#e5ca96" }}>How can I place an order?</summary>
                  <p>Choose a product, add it to your cart, and continue to checkout.</p>
                </details>
                <details style={{ borderBottom: "1px solid #51432d", padding: "13px 0" }}>
                  <summary style={{ cursor: "pointer", color: "#e5ca96" }}>What payment option is available?</summary>
                  <p>Cash on Delivery is shown in the checkout flow. Confirm the order details before proceeding.</p>
                </details>
                <details style={{ borderBottom: "1px solid #51432d", padding: "13px 0" }}>
                  <summary style={{ cursor: "pointer", color: "#e5ca96" }}>Can I return a product?</summary>
                  <p>The store advertises 14-day returns. Contact the store owner to confirm the applicable conditions.</p>
                </details>
                <details style={{ borderBottom: "1px solid #51432d", padding: "13px 0" }}>
                  <summary style={{ cursor: "pointer", color: "#e5ca96" }}>How do I get help?</summary>
                  <p>Use the Contact us section for store support details.</p>
                </details>
              </div>
            )}
          </section>
        </div>
      )}
      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside
            className={`cart-drawer${checkoutOpen ? " checkout-active" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-heading">
              <div>
                <p className="eyebrow">YOUR LITTLE FINDS</p>
                <h2>Your cart <span>({cartCount})</span></h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close cart">
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span><ShoppingBag size={30} /></span>
                <h3>Your cart is empty.</h3>
                <p>Add something lovely to get started.</p>
                <button className="primary-button" onClick={() => setCartOpen(false)}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item._id}>
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <strong>{money(item.price)}</strong>
                        <div className="quantity-control">
                          <button onClick={() => changeQuantity(item._id, -1)} aria-label="Decrease quantity">
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => changeQuantity(item._id, 1)}
                            disabled={item.quantity >= Number(item.stock)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                      <button className="remove-button" onClick={() => removeFromCart(item._id)} aria-label={`Remove ${item.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div><span>Subtotal</span><strong>{money(total)}</strong></div>
                  <p>Shipping and taxes calculated at checkout.</p>
                  {!checkoutOpen ? (
                    <>
                      <button
                        className="checkout-button"
                        onClick={() => {
                          setCheckoutMessage("");
                          setCheckoutOpen(true);
                          setShippingAddress((current) => ({
                            ...current,
                            fullName: current.fullName || auth.user?.name || "",
                          }));
                        }}
                      >
                        Checkout · {money(total)} <ArrowUpRight size={17} />
                      </button>
                      <button className="continue-button" onClick={() => setCartOpen(false)}>
                        Continue browsing
                      </button>
                    </>
                  ) : (
                    <form
                      className="checkout-form"
                      onSubmit={placeCodOrder}
                      style={{
                        marginTop: "18px",
                        paddingTop: "18px",
                        borderTop: "1px solid var(--border, #dedbd4)",
                        display: "grid",
                        gap: "10px",
                      }}
                    >
                      <div>
                        <p className="eyebrow">CASH ON DELIVERY</p>
                        <h3 style={{ margin: "4px 0 6px" }}>Delivery details</h3>
                        <p style={{ margin: 0, fontSize: "13px" }}>
                          Pay in cash when your order arrives.
                        </p>
                      </div>
                      {[
                        ["fullName", "Full name", "text"],
                        ["phone", "Phone number", "tel"],
                        ["address", "Full delivery address", "text"],
                        ["city", "City", "text"],
                        ["state", "State", "text"],
                        ["pincode", "PIN code", "text"],
                      ].map(([name, label, type]) => (
                        <label key={name} style={{ display: "grid", gap: "5px", fontSize: "13px" }}>
                          <span>{label}</span>
                          <input
                            name={name}
                            type={type}
                            value={shippingAddress[name]}
                            onChange={updateShippingAddress}
                            required
                            autoComplete={
                              name === "fullName" ? "name" :
                              name === "phone" ? "tel" :
                              name === "address" ? "street-address" :
                              name === "city" ? "address-level2" :
                              name === "state" ? "address-level1" :
                              "postal-code"
                            }
                            maxLength={name === "phone" ? 15 : name === "pincode" ? 10 : 200}
                            style={{
                              width: "100%",
                              boxSizing: "border-box",
                              padding: "11px 12px",
                              border: "1px solid var(--border, #dedbd4)",
                              borderRadius: "8px",
                              background: "var(--surface, #fff)",
                              color: "inherit",
                              font: "inherit",
                            }}
                          />
                        </label>
                      ))}
                      {checkoutMessage && (
                        <p role="alert" style={{ color: "#b42318", fontSize: "13px", margin: "4px 0" }}>
                          {checkoutMessage}
                        </p>
                      )}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="continue-button"
                          onClick={() => {
                            setCheckoutOpen(false);
                            setCheckoutMessage("");
                          }}
                          disabled={checkoutLoading}
                        >
                          Back
                        </button>
                        <button type="submit" className="checkout-button" disabled={checkoutLoading}>
                          {checkoutLoading ? "Placing order…" : `Place COD order · ${money(total)}`}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}



