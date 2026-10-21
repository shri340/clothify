
import { useEffect, useRef, useState } from "react";
import "./App.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://clothify-backend-api.onrender.com";

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
};

type CartItem = {
  product: Product;
  quantity: number;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("clothify-cart");
      return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const checkoutRef = useRef<HTMLDivElement>(null);

  // Load products from the backend.
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load products");
        }
        return response.json();
      })
      .then((data: Product[]) => setProducts(data))
      .catch(() => {
        setError("Unable to load products. Please try again later.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Save the shopping bag between page refreshes.
  useEffect(() => {
    localStorage.setItem("clothify-cart", JSON.stringify(cart));
  }, [cart]);

  // Automatically move customers to checkout when it opens.
  useEffect(() => {
    if (checkoutOpen) {
      const timer = window.setTimeout(() => {
        checkoutRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);

      return () => window.clearTimeout(timer);
    }
  }, [checkoutOpen]);

  const addToCart = (product: Product) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });

    setCartOpen(true);
  };

  const changeQuantity = (id: number, amount: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number) => {
    setCart((current) =>
      current.filter((item) => item.product.id !== id)
    );
  };

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN")}`;

  const openCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
    setOrderPlaced(false);
    setError("");
  };

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setOrderPlaced(false);
    setOrderId(null);
    setError("");
  };

  const handlePlaceOrder = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (submittingOrder || cart.length === 0) {
      return;
    }

    setSubmittingOrder(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: cart.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Could not place order (HTTP ${response.status}).`
        );
      }

      setOrderId(data.orderId);
      setConfirmedTotal(subtotal);
      setOrderPlaced(true);
      setCart([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the server. Please try again."
      );
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="/">
          CLOTHIFY<span>.</span>
        </a>

        <nav>
          <a href="#products">Shop</a>
          <a href="#about">About</a>
        </nav>

        <button
          type="button"
          className="cart-trigger"
          onClick={() => setCartOpen(true)}
        >
          Bag ({totalItems})
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR STYLE, YOUR STORY</p>
          <h1>
            Wear what
            <br />
            moves you.
          </h1>
          <p>Everyday essentials. Effortless style.</p>
          <a className="shop-button" href="#products">
            EXPLORE COLLECTION
          </a>
        </section>

        <section className="products-section" id="products">
          <div className="section-heading">
            <div>
              <p className="eyebrow">THE CLOTHIFY EDIT</p>
              <h2>Featured products</h2>
            </div>
            <span>{products.length} products</span>
          </div>

          {loading && <p>Loading your collection...</p>}
          {error && !checkoutOpen && (
            <p role="alert" className="error">
              {error}
            </p>
          )}

          {!loading && !error && (
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                    <span className="category">{product.category}</span>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="price">{formatPrice(product.price)}</p>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                    >
                      ADD TO BAG
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="about" id="about">
          <p className="eyebrow">MADE FOR EVERYDAY</p>
          <h2>Find your kind of style.</h2>
          <p>Discover pieces that feel like you.</p>
        </section>
      </main>

      <footer>© 2026 CLOTHIFY. YOUR STYLE, YOUR STORY.</footer>

      {checkoutOpen && (
        <div className="checkout-page" ref={checkoutRef}>
          <div className="checkout-scroll-hint" role="status">
            <span aria-hidden="true">↓</span>
            <strong>You're almost there!</strong>
            <span>Complete your delivery details below to place your order.</span>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={closeCheckout}
          >
            ← Back to shopping
          </button>

          {orderPlaced ? (
            <section className="checkout-card success-card">
              <p className="eyebrow">CLOTHIFY</p>
              <h1>Thank you, {customerName}!</h1>
              <p>Your order has been saved successfully.</p>

              {orderId !== null && (
                <p>
                  Order number: <strong>#{orderId}</strong>
                </p>
              )}

              <p>
                Order total: <strong>{formatPrice(confirmedTotal)}</strong>
              </p>

              <button
                type="button"
                className="checkout-button"
                onClick={() => {
                  setCheckoutOpen(false);
                  setOrderPlaced(false);
                  setOrderId(null);
                  setCustomerName("");
                  setPhone("");
                  setAddress("");
                  setConfirmedTotal(0);
                }}
              >
                CONTINUE SHOPPING
              </button>
            </section>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-card">
                <p className="eyebrow">CLOTHIFY CHECKOUT</p>
                <h1>Almost yours.</h1>
                <p>Enter your delivery details to complete your order.</p>

                <form onSubmit={handlePlaceOrder}>
                  <label htmlFor="customerName">Full name</label>
                  <input
                    id="customerName"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(event.target.value)
                    }
                    required
                    minLength={2}
                    maxLength={200}
                    autoComplete="name"
                  />

                  <label htmlFor="phone">Phone number</label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    pattern="[0-9]{10}"
                    title="Enter a 10-digit phone number"
                    autoComplete="tel"
                  />

                  <label htmlFor="address">Delivery address</label>
                  <textarea
                    id="address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    required
                    minLength={10}
                    maxLength={1000}
                    rows={4}
                    autoComplete="street-address"
                  />

                  <button
                    className="checkout-button"
                    type="submit"
                    disabled={submittingOrder || cart.length === 0}
                  >
                    {submittingOrder ? "SAVING ORDER..." : "PLACE ORDER"}
                  </button>
                </form>

                {error && (
                  <p role="alert" className="checkout-note">
                    {error}
                  </p>
                )}

                <p className="checkout-note">
                  Demo checkout only. No payment is processed.
                </p>
              </section>

              <aside className="checkout-card order-summary">
                <h2>Your order</h2>

                {cart.map(({ product, quantity }) => (
                  <div className="summary-item" key={product.id}>
                    <span>
                      {product.name} × {quantity}
                    </span>
                    <strong>
                      {formatPrice(product.price * quantity)}
                    </strong>
                  </div>
                ))}

                <div className="summary-total">
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>

                <p className="checkout-note">
                  Shipping and taxes are not included in this demo.
                </p>
              </aside>
            </div>
          )}
        </div>
      )}

      {cartOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="cart-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="cart-heading">
              <h2>Your bag ({totalItems})</h2>
              <button
                type="button"
                className="close-cart"
                onClick={() => setCartOpen(false)}
                aria-label="Close shopping bag"
              >
                ×
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <p>Your bag is waiting for something good.</p>
                <button
                  type="button"
                  className="continue-shopping"
                  onClick={() => setCartOpen(false)}
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(({ product, quantity }) => (
                    <article className="cart-item" key={product.id}>
                      <img src={product.image} alt={product.name} />

                      <div className="cart-item-details">
                        <h3>{product.name}</h3>
                        <p>{formatPrice(product.price)}</p>

                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(product.id, -1)
                            }
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span>{quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(product.id, 1)
                            }
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() => removeFromCart(product.id)}
                        >
                          Remove
                        </button>
                      </div>

                      <strong>
                        {formatPrice(product.price * quantity)}
                      </strong>
                    </article>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="subtotal">
                    <span>Subtotal</span>
                    <strong>{formatPrice(subtotal)}</strong>
                  </div>
                  <p>Shipping and taxes calculated at checkout.</p>
                  <button
                    type="button"
                    className="checkout-button"
                    onClick={openCheckout}
                  >
                    PROCEED TO CHECKOUT
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

export default App;
