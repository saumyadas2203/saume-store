
import { useEffect, useMemo, useState } from "react";
import {
  Search, ShoppingBag, ShoppingCart, Plus, Minus, Trash2, X,
  Star, ArrowUpRight, Menu, ArrowLeft, Mail, Phone, Truck,
  ShieldCheck, Heart
} from "lucide-react";

import Auth from "./Auth.jsx";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const pages = [
  ["shop", "Shop"],
  ["story", "Our story"],
  ["contact", "Contact"],
  ["shipping", "Shipping & returns"],
  ["faqs", "FAQs"],
  ["privacy", "Privacy policy"],
  ["terms", "Terms"],
];

const emptyAddress = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
};

export default function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("saume-token") || "");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saume-user") || "null");
    } catch {
      return null;
    }
  });
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("saume-cart") || "[]");
    } catch {
      return [];
    }
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState("home");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [faqOpen, setFaqOpen] = useState(0);
  const [contactSent, setContactSent] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [orderConfirmation, setOrderConfirmation] = useState("");
  const [shippingAddress, setShippingAddress] = useState(emptyAddress);

  useEffect(() => {
    localStorage.setItem("saume-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
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

        if (!response.ok) throw new Error("Product API error");

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            "We couldn't load the collection. Check your backend URL and database connection."
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadProducts();
    return () => controller.abort();
  }, [search, category]);

  const categories = useMemo(
    () => ["All", "Accessories", "Electronics", "Fashion", "Home", "Lifestyle", "Stationery"],
    []
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  function navigate(next) {
    setPage(next);
    setMobileMenu(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addToCart(product) {
    if ((product.stock ?? 0) < 1) return;

    setCart((current) => {
      const found = current.find((item) => item._id === product._id);

      if (found) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setOrderConfirmation("");
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
                Math.min(item.stock ?? 1, item.quantity + delta)
              ),
            }
          : item
      )
    );
  }

  function removeFromCart(id) {
    setCart((current) => current.filter((item) => item._id !== id));
  }

  function handleAuthSuccess(data) {
    if (!data?.token) {
      setCheckoutMessage("Login succeeded but no token was returned. Please try again.");
      return;
    }

    localStorage.setItem("saume-token", data.token);
    localStorage.setItem("saume-user", JSON.stringify(data.user || null));
    setToken(data.token);
    setCurrentUser(data.user || null);
    setAuthOpen(false);
    setCheckoutMessage("You are signed in. Click Place COD order again to complete your order.");
  }

  function handleLogout() {
    localStorage.removeItem("saume-token");
    localStorage.removeItem("saume-user");
    setToken("");
    setCurrentUser(null);
    setCheckoutMessage("");
  }

  async function placeCodOrder(event) {
    event.preventDefault();
    setCheckoutMessage("");
    if (!token) {
      setCheckoutMessage("Please sign in before placing your COD order.");
      setAuthOpen(true);
      return;
    }
    setOrderConfirmation("");

    if (!cart.length) {
      setCheckoutMessage("Your bag is empty.");
      return;
    }

    const { fullName, phone, address, city, state, pincode } = shippingAddress;

    if (![fullName, phone, address, city, state, pincode].every((value) => value.trim())) {
      setCheckoutMessage("Please fill in every delivery field.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setCheckoutMessage("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(pincode.trim())) {
      setCheckoutMessage("Enter a valid 6-digit PIN code.");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity,
          })),
          shippingAddress: {
            fullName: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: pincode.trim(),
          },
          paymentMethod: "COD",
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "We couldn't place your order. Please try again.");
      }

      const orderId = data.order?._id || data._id || "";

      setCart([]);
      setCheckoutOpen(false);
      setShippingAddress(emptyAddress);
      setCheckoutMessage("");

      setOrderConfirmation(
        orderId
          ? `Order placed! Your order number is ${orderId}. Pay by cash on delivery.`
          : "Your order has been placed. Pay by cash on delivery."
      );
    } catch (err) {
      setCheckoutMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  const ProductGrid = ({ items }) => (
    <div className="product-grid">
      {items.map((product, index) => (
        <article className="product-card" key={product._id}>
          <div className="product-image-wrap">
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src =
                  "https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=900&q=80";
              }}
            />
            {index === 0 && <span className="product-tag">CURATED PICK</span>}
            <button
              className="quick-add"
              onClick={() => addToCart(product)}
              disabled={!product.stock}
              aria-label={`Add ${product.name} to bag`}
            >
              <Plus size={19} />
            </button>
          </div>

          <div className="product-meta">
            <span>{product.category}</span>
            <span className="rating">
              <Star size={13} fill="currentColor" />
              {Number(product.rating || 4.5).toFixed(1)}
            </span>
          </div>

          <h3>{product.name}</h3>
          <p className="product-description">{product.description}</p>

          <div className="product-bottom">
            <strong>{money(product.price)}</strong>
            <button
              onClick={() => addToCart(product)}
              disabled={!product.stock}
            >
              {product.stock ? "Add to bag" : "Sold out"}
              <ArrowUpRight size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );

  const Home = () => (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="eyebrow-dot" /> THE EVERYDAY EDIT
          </p>
          <h1>
            Little finds.
            <br />
            <em>Lovely living.</em>
          </h1>
          <p className="hero-description">
            Thoughtful everyday essentials, accessories and little upgrades
            to make your routine feel more like you.
          </p>
          <button className="primary-button" onClick={() => navigate("shop")}>
            Discover the collection <ArrowUpRight size={17} />
          </button>
          <div className="hero-note">
            <span className="avatar-stack">
              <i>✿</i><i>☼</i><i>✳</i>
            </span>
            <span>Considered finds for everyday moments</span>
          </div>
        </div>

        <div className="hero-art">
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1300&q=85"
            alt="Thoughtfully arranged everyday lifestyle products"
          />
          <div className="floating-note">
            <span>✳</span>
            <div><b>A little more joy,</b><br />in the everyday.</div>
          </div>
          <div className="hero-stamp">CURATED<br />WITH CARE</div>
        </div>
      </section>

      <section className="shop-section" id="featured">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE GOOD STUFF</p>
            <h2>Find your <em>favourite.</em></h2>
          </div>
          <button className="text-link" onClick={() => navigate("shop")}>
            Shop all <ArrowUpRight size={15} />
          </button>
        </div>

        {loading ? (
          <div className="state-message">Finding good things for you…</div>
        ) : error ? (
          <div className="state-message error">{error}</div>
        ) : products.length ? (
          <ProductGrid items={products.slice(0, 4)} />
        ) : (
          <div className="state-message">
            Your collection is being prepared. Add products to your catalogue.
          </div>
        )}

        <div className="center-action">
          <button className="primary-button" onClick={() => navigate("shop")}>
            Explore all products <ArrowUpRight size={16} />
          </button>
        </div>
      </section>

      <section className="promise-row">
        <div>
          <Truck />
          <b>Shipping information</b>
          <span>Clear delivery details</span>
          <button onClick={() => navigate("shipping")}>Learn more</button>
        </div>
        <div>
          <ShieldCheck />
          <b>Shop with confidence</b>
          <span>Transparent store policies</span>
          <button onClick={() => navigate("faqs")}>Read FAQs</button>
        </div>
        <div>
          <Heart />
          <b>Thoughtfully selected</b>
          <span>Useful things, lovely details</span>
          <button onClick={() => navigate("story")}>Our story</button>
        </div>
      </section>

      <section className="story-section">
        <div className="story-symbol">✳</div>
        <p className="eyebrow">A SMALLER, HAPPIER KIND OF SHOPPING</p>
        <h2>Useful things.<br /><em>Thoughtfully picked.</em></h2>
        <p>
          We believe the little things can make an ordinary day feel special.
          Explore the collection and find something that fits your everyday.
        </p>
        <button className="text-link" onClick={() => navigate("story")}>
          Get to know SAUMÉ <ArrowUpRight size={15} />
        </button>
      </section>
    </main>
  );

  const Shop = () => (
    <main className="inner-page shop-page">
      <div className="page-intro">
        <p className="eyebrow">THE SAUMÉ COLLECTION</p>
        <h1>Shop the <em>everyday.</em></h1>
        <p>Useful favourites and considered little upgrades for your day-to-day.</p>
      </div>

      <div className="shop-tools">
        <div className="search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
          />
        </div>
        <span>{loading ? "Loading…" : `${products.length} items`}</span>
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

      {loading ? (
        <div className="state-message">Finding good things for you…</div>
      ) : error ? (
        <div className="state-message error">
          {error}
          <p>Check <code>VITE_API_URL</code> in the client environment.</p>
        </div>
      ) : products.length ? (
        <ProductGrid items={products} />
      ) : (
        <div className="state-message">No products found. Try another search or category.</div>
      )}
    </main>
  );

  const ContentPage = () => {
    const titles = {
      story: "A little more thoughtful.",
      contact: "We’re here to help.",
      shipping: "Shipping & returns",
      faqs: "A few helpful answers",
      privacy: "Privacy policy",
      terms: "Terms & conditions",
    };

    return (
      <main className="inner-page content-page">
        <button className="back-link" onClick={() => navigate("home")}>
          <ArrowLeft size={15} /> Back to home
        </button>

        <div className="page-intro">
          <p className="eyebrow">
            SAUMÉ · {pages.find(([id]) => id === page)?.[1]?.toUpperCase()}
          </p>
          <h1>{titles[page]}</h1>
        </div>

        {page === "story" && (
          <div className="prose">
            <p className="lead">Everyday things can make a day feel a little brighter.</p>
            <p>
              SAUMÉ is a place for discovering useful finds, considered accessories
              and small upgrades for everyday living. We want browsing to feel calm,
              product details to be clear, and choosing something for yourself to feel simple.
            </p>
            <p>
              Our collection is organised around the things people reach for in daily life.
              We aim to share honest descriptions and transparent store policies as the shop grows.
            </p>
            <p><b>Our promise:</b> thoughtful discovery, clear information and a shopping experience that respects your time.</p>
          </div>
        )}

        {page === "contact" && (
          <div className="contact-layout">
            <div className="contact-details">
              <p>Questions about a product or your shopping experience? Get in touch and we’ll do our best to help.</p>
              <a href="mailto:saumyadas2203@gmail.com">
                <Mail size={18} /> saumyadas2203@gmail.com
              </a>
              <a href="tel:+919341395857">
                <Phone size={18} /> +91 93413 95857
              </a>
              <p className="muted-note">
                For order-related support, include your order number when one has been issued.
              </p>
            </div>

            <form
              className="contact-form"
              onSubmit={(event) => {
                event.preventDefault();
                setContactSent(true);
              }}
            >
              <label>Your name<input required name="name" placeholder="Name" /></label>
              <label>Email address<input required type="email" name="email" placeholder="you@example.com" /></label>
              <label>How can we help?<textarea required name="message" rows="5" placeholder="Write your message…" /></label>
              <button className="primary-button" type="submit">
                Prepare message <ArrowUpRight size={16} />
              </button>
              {contactSent && (
                <p className="form-note">
                  This demo form does not send messages yet. Please email us directly.
                </p>
              )}
            </form>
          </div>
        )}

        {page === "shipping" && (
          <div className="prose">
            <h2>Shipping</h2>
            <p>
              Shipping timelines and charges should be confirmed at checkout before
              an order is placed. Publish delivery details only after confirming your actual policy.
            </p>
            <h2>Returns and exchanges</h2>
            <p>
              Please contact the store before sending any item back. Confirm your
              return window, eligibility rules, return shipping charges and refund timelines
              before accepting real orders.
            </p>
            <h2>Order support</h2>
            <p>Email <a href="mailto:saumyadas2203@gmail.com">saumyadas2203@gmail.com</a> for assistance.</p>
          </div>
        )}

        {page === "faqs" && (
          <div className="faq-list">
            {[
              ["How do I place an order?", "Add items to your bag, continue to checkout, and enter your delivery details. Cash on delivery is the available payment method."],
              ["Can I pay online?", "Online payments are not available. Choose cash on delivery at checkout."],
              ["How long does shipping take?", "Delivery timelines depend on your fulfilment arrangements. Confirm delivery estimates before publishing them."],
              ["Can I return a product?", "Check the store's published return policy for the return window, exclusions and refund process."],
              ["How can I contact SAUMÉ?", "Email saumyadas2203@gmail.com or call +91 93413 95857."],
            ].map(([question, answer], index) => (
              <div className="faq-item" key={question}>
                <button onClick={() => setFaqOpen(faqOpen === index ? -1 : index)}>
                  {question}<span>{faqOpen === index ? "−" : "+"}</span>
                </button>
                {faqOpen === index && <p>{answer}</p>}
              </div>
            ))}
          </div>
        )}

        {page === "privacy" && (
          <div className="prose">
            <p>
              This project stores shopping-bag data in your browser’s local storage.
              Delivery details are sent to the store backend when an order is placed.
              Cash on delivery is the configured payment method.
            </p>
            <h2>Information and use</h2>
            <p>
              Before launch, publish a policy explaining what information your site collects,
              why it is collected, how long it is retained and how customers can contact you
              about their information.
            </p>
            <h2>Contact</h2>
            <p>Privacy questions: <a href="mailto:saumyadas2203@gmail.com">saumyadas2203@gmail.com</a>.</p>
          </div>
        )}

        {page === "terms" && (
          <div className="prose">
            <p>This website is a starter project for catalogue browsing and checkout development.</p>
            <h2>Product listings</h2>
            <p>
              Verify product descriptions, prices and stock counts before accepting real orders.
            </p>
            <h2>Before launch</h2>
            <p>
              Publish accurate terms covering pricing, payment, cancellations, delivery,
              returns and customer support before using the store commercially.
            </p>
          </div>
        )}
      </main>
    );
  };

  return (
    <div className="app-shell">
      <div className="announcement">
        Thoughtful finds for everyday living <span>✳</span> Discover something lovely
      </div>

      <header className="header">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenu(!mobileMenu)}
          aria-label="Toggle navigation"
        >
          <Menu />
        </button>

        <button className="brand brand-button" onClick={() => navigate("home")}>
          <span className="brand-mark"><ShoppingBag size={20} /></span>
          SAUMÉ<span className="brand-light">store.</span>
        </button>

        <nav className={`nav-links ${mobileMenu ? "nav-open" : ""}`}>
          {[["home", "Home"], ["shop", "Shop"], ["story", "Our story"], ["contact", "Contact"]].map(([id, label]) => (
            <button
              key={id}
              className={page === id ? "nav-active" : ""}
              onClick={() => navigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        {currentUser ? (
          <button
            className="text-link"
            onClick={handleLogout}
            title={`Signed in as ${currentUser.email || currentUser.name || "customer"}`}
          >
            Sign out
          </button>
        ) : (
          <button className="text-link" onClick={() => setAuthOpen(true)}>
            Sign in
          </button>
        )}

        <button
          className="cart-button"
          onClick={() => setCartOpen(true)}
          aria-label="Open shopping bag"
        >
          <ShoppingCart size={19} /><span>Bag</span><b>{cartCount}</b>
        </button>
      </header>

      {page === "home" ? <Home /> : page === "shop" ? <Shop /> : <ContentPage />}

      <footer id="footer">
        <button className="brand brand-button" onClick={() => navigate("home")}>
          <span className="brand-mark"><ShoppingBag size={18} /></span>
          SAUMÉ<span className="brand-light">store.</span>
        </button>
        <div className="footer-links">
          {pages.map(([id, label]) => (
            <button key={id} onClick={() => navigate(id)}>{label}</button>
          ))}
        </div>
        <a href="mailto:saumyadas2203@gmail.com">saumyadas2203@gmail.com</a>
        <span>© {new Date().getFullYear()} SAUMÉ Store</span>
      </footer>

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading">
              <div>
                <p className="eyebrow">YOUR LITTLE FINDS</p>
                <h2>Your bag <span>({cartCount})</span></h2>
              </div>
              <button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag">
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <span><ShoppingBag size={30} /></span>
                {orderConfirmation ? (
                  <>
                    <h3>Thank you for your order!</h3>
                    <p className="checkout-success" role="status">{orderConfirmation}</p>
                  </>
                ) : (
                  <>
                    <h3>Your bag is waiting.</h3>
                    <p>Add something lovely to get started.</p>
                  </>
                )}
                <button
                  className="primary-button"
                  onClick={() => {
                    setCartOpen(false);
                    setOrderConfirmation("");
                  }}
                >
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
                            disabled={item.quantity >= (item.stock ?? 1)}
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

                {!checkoutOpen ? (
                  <div className="cart-summary">
                    <div><span>Subtotal</span><strong>{money(total)}</strong></div>
                    <p>Shipping charges, if any, will be confirmed by the store. Payment: Cash on delivery.</p>
                    {orderConfirmation && <p className="checkout-success" role="status">{orderConfirmation}</p>}
                    <button
                      className="checkout-button"
                      onClick={() => {
                        setCheckoutMessage("");
                        setCheckoutOpen(true);
                      }}
                    >
                      Continue to COD checkout <ArrowUpRight size={17} />
                    </button>
                    <button className="continue-button" onClick={() => setCartOpen(false)}>
                      Continue browsing
                    </button>
                  </div>
                ) : (
                  <form className="checkout-form" onSubmit={placeCodOrder}>
                    <div className="checkout-form-heading">
                      <button
                        type="button"
                        className="back-link"
                        onClick={() => {
                          setCheckoutOpen(false);
                          setCheckoutMessage("");
                        }}
                      >
                        <ArrowLeft size={15} /> Back to bag
                      </button>
                      <h3>Delivery details</h3>
                      <p>Pay in cash when your order arrives.</p>
                    </div>

                    <label>
                      Full name
                      <input
                        required
                        autoComplete="name"
                        value={shippingAddress.fullName}
                        onChange={(event) => setShippingAddress({ ...shippingAddress, fullName: event.target.value })}
                        placeholder="Name on delivery"
                      />
                    </label>

                    <label>
                      Mobile number
                      <input
                        required
                        inputMode="numeric"
                        maxLength={10}
                        autoComplete="tel"
                        value={shippingAddress.phone}
                        onChange={(event) => setShippingAddress({
                          ...shippingAddress,
                          phone: event.target.value.replace(/\D/g, "").slice(0, 10),
                        })}
                        placeholder="10-digit mobile number"
                      />
                    </label>

                    <label>
                      Full address
                      <textarea
                        required
                        rows="2"
                        autoComplete="street-address"
                        value={shippingAddress.address}
                        onChange={(event) => setShippingAddress({ ...shippingAddress, address: event.target.value })}
                        placeholder="House number, street, area"
                      />
                    </label>

                    <div className="checkout-fields-row">
                      <label>
                        City
                        <input
                          required
                          autoComplete="address-level2"
                          value={shippingAddress.city}
                          onChange={(event) => setShippingAddress({ ...shippingAddress, city: event.target.value })}
                          placeholder="City"
                        />
                      </label>
                      <label>
                        State
                        <input
                          required
                          autoComplete="address-level1"
                          value={shippingAddress.state}
                          onChange={(event) => setShippingAddress({ ...shippingAddress, state: event.target.value })}
                          placeholder="State"
                        />
                      </label>
                    </div>

                    <label>
                      PIN code
                      <input
                        required
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="postal-code"
                        value={shippingAddress.pincode}
                        onChange={(event) => setShippingAddress({
                          ...shippingAddress,
                          pincode: event.target.value.replace(/\D/g, "").slice(0, 6),
                        })}
                        placeholder="6-digit PIN code"
                      />
                    </label>

                    <div className="cod-summary">
                      <span>Cash on delivery</span><strong>{money(total)}</strong>
                    </div>

                    {checkoutMessage && <p className="checkout-error" role="alert">{checkoutMessage}</p>}

                    <button className="checkout-button" type="submit" disabled={checkoutLoading}>
                      {checkoutLoading ? "Placing order…" : `Place COD order · ${money(total)}`}
                    </button>
                  </form>
                )}
              </>
            )}
          </aside>
        </div>
      )}

      {authOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Sign in or create an account"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            overflowY: "auto",
            background: "#fff",
          }}
        >
          <button
            type="button"
            onClick={() => setAuthOpen(false)}
            aria-label="Close sign in"
            style={{
              position: "fixed",
              top: 16,
              right: 18,
              zIndex: 10001,
              border: "1px solid #ddd",
              borderRadius: 999,
              background: "#fff",
              padding: "10px 14px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            <X size={16} /> Close
          </button>
          <Auth onSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
}
