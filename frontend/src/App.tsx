
import { useEffect, useState } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
    return savedCart ? JSON.parse(savedCart) as CartItem[] : [];
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
const [customerName, setCustomerName] = useState("");
const [phone, setPhone] = useState("");
const [address, setAddress] = useState("");
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load products");
        return response.json();
      })
      .then((data: Product[]) => setProducts(data))
      .catch(() =>
        setError("Unable to load products. Check that the backend is running.")
      )
      .finally(() => setLoading(false));
  }, []);
    useEffect(() => {
    localStorage.setItem("clothify-cart", JSON.stringify(cart));
  }, [cart]);

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

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="/">CLOTHIFY<span>.</span></a>

        <nav>
          <a href="#products">Shop</a>
          <a href="#about">About</a>
        </nav>

        <button
          className="cart-trigger"
          onClick={() => setCartOpen(true)}
        >
          Bag ({totalItems})
        </button>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">YOUR STYLE, YOUR STORY</p>
          <h1>Wear what<br />moves you.</h1>
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
          {error && <p className="error">{error}</p>}

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
                    <button onClick={() => addToCart(product)}>
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
        <div className="checkout-page">
          <button
            className="back-button"
            onClick={() => setCheckoutOpen(false)}
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
  Order total: <strong>{formatPrice(subtotal)}</strong>
</p>
              <button
                className="checkout-button"
                onClick={() => {
                  setCart([]);
                  setCheckoutOpen(false);
                  setOrderPlaced(false);
                }}
              >
                CONTINUE SHOPPING
              </button>
            </section>
          ) : (
            <div className="checkout-layout">
              <section className="checkout-card">
                {orderPlaced && (
  <div className="checkout-card">
    <p className="eyebrow">ORDER CONFIRMED</p>
    <h2>Thank you, {customerName}!</h2>
    <p>Your order has been saved successfully.</p>
    {orderId !== null && (
      <p>Your order number is #{orderId}</p>
    )}
    <button
      type="button"
      className="checkout-button"
      onClick={() => {
        setCheckoutOpen(false);
        setCartOpen(false);
        setOrderPlaced(false);
        setOrderId(null);
        setCart([]);
      }}
    >
      CONTINUE SHOPPING
    </button>
  </div>
)}
                <p className="eyebrow">CLOTHIFY CHECKOUT</p>
                <h1>Almost yours.</h1>
                <p>Enter your delivery details to review your order.</p>

                <form
                 
onSubmit={async (event) => {
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
        customerName,
        phone,
        address,
        items: cart.map((item) => ({
          id: item.product.id,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "Could not place order.");
    }

    setOrderId(data.orderId);
    setOrderPlaced(true);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not connect to the server. Please try again."
    );
  } finally {
    setSubmittingOrder(false);
  }
}}

                >
                  <label htmlFor="customerName">Full name</label>
                  <input
                    id="customerName"
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    required
                    minLength={2}
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
                            onClick={() => changeQuantity(product.id, -1)}
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>
                          <span>{quantity}</span>
                          <button
                            onClick={() => changeQuantity(product.id, 1)}
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <button
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
                    className="checkout-button"
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                      setOrderPlaced(false);
                    }}
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
