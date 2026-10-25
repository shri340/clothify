import { useEffect, useRef, useState } from "react";
import AdminDashboard from "./AdminDashboard";
import "./App.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://clothify-backend-api.onrender.com"
).replace(/\/+$/, "");

const PRODUCT_LOAD_TIMEOUT_MS = 60000;

type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
};

type CollectionFilter = "All" | "Men" | "Women";

type ClothingSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

const CLOTHING_SIZES: ClothingSize[] = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

type CartItem = {
  product: Product;
  quantity: number;
  size: ClothingSize;
};

function App() {
  if (window.location.pathname === "/admin") {
    return <AdminDashboard />;
  }

  return <Storefront />;
}

function Storefront() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCollection, setActiveCollection] =
    useState<CollectionFilter>("All");

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("clothify-cart");

      if (!savedCart) return [];

      const parsed = JSON.parse(savedCart) as Array<
        Partial<CartItem> & {
          product: Product;
          quantity: number;
        }
      >;

      return parsed
        .filter(
          (item) =>
            item.product &&
            typeof item.product.id === "number" &&
            typeof item.product.name === "string" &&
            typeof item.product.price === "number" &&
            typeof item.quantity === "number"
        )
        .map((item) => ({
          product: item.product,
          quantity: Math.max(1, item.quantity),
          size: CLOTHING_SIZES.includes(item.size as ClothingSize)
            ? (item.size as ClothingSize)
            : "M",
        }));
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [selectedDetailProduct, setSelectedDetailProduct] =
    useState<Product | null>(null);

  const [selectedSize, setSelectedSize] =
    useState<ClothingSize>("M");

  const checkoutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isCurrentRequest = true;
    let timedOut = false;

    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, PRODUCT_LOAD_TIMEOUT_MS);

    const loadProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            `The products service returned HTTP ${response.status}.`
          );
        }

        const data: unknown = await response.json();
        let productList: unknown;

        if (Array.isArray(data)) {
          productList = data;
        } else if (
          typeof data === "object" &&
          data !== null &&
          "products" in data
        ) {
          productList = data.products;
        } else if (
          typeof data === "object" &&
          data !== null &&
          "data" in data &&
          Array.isArray(data.data)
        ) {
          productList = data.data;
        } else {
          throw new Error(
            "The products service returned an unexpected response."
          );
        }

        if (!Array.isArray(productList)) {
          throw new Error(
            "The products service did not return a product list."
          );
        }

        const validProducts = productList.filter(
          (item): item is Product =>
            typeof item === "object" &&
            item !== null &&
            typeof item.id === "number" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            typeof item.category === "string" &&
            typeof item.image === "string"
        );

        if (productList.length > 0 && validProducts.length === 0) {
          throw new Error(
            "Products were received, but their data format is invalid."
          );
        }

        if (isCurrentRequest) {
          setProducts(validProducts);
          setError("");
        }
      } catch (err: unknown) {
        if (!isCurrentRequest) return;

        if (err instanceof Error && err.name === "AbortError") {
          setError(
            timedOut
              ? "The products service is responding slowly. Please try again."
              : "The product request was cancelled. Please try again."
          );
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load products. Check your connection and try again."
          );
        }
      } finally {
        window.clearTimeout(timeoutId);

        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };

    void loadProducts();

    return () => {
      isCurrentRequest = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [loadAttempt]);

  // Save the shopping bag between page refreshes.
  useEffect(() => {
    try {
      localStorage.setItem("clothify-cart", JSON.stringify(cart));
    } catch {
      // The current shopping session continues if storage is unavailable.
    }
  }, [cart]);

  // Scroll to checkout when it opens.
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

  // Filter products using the existing category field.
  const filteredProducts = products.filter((product) => {
    const category = product.category.toLowerCase();

    if (activeCollection === "All") {
      return true;
    }

    if (activeCollection === "Men") {
      return category.includes("men") && !category.includes("women");
    }

    return category.includes("women");
  });

  const openProductDetails = (product: Product) => {
    setSelectedDetailProduct(product);
  };

  const closeProductDetails = () => {
    setSelectedDetailProduct(null);
  };

  const openSizeSelector = (product: Product) => {
    setSelectedDetailProduct(null);
    setSelectedProduct(product);
    setSelectedSize("M");
  };

  const addToCart = (product: Product, size: ClothingSize) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existing) {
        return current.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1, size }];
    });

    setSelectedProduct(null);
    setCartOpen(true);
  };

  const changeQuantity = (
    id: number,
    size: ClothingSize,
    amount: number
  ) => {
    setCart((current) =>
      current
        .map((item) =>
          item.product.id === id && item.size === size
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id: number, size: ClothingSize) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.product.id === id && item.size === size)
      )
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
    // Submit customer and size information to the backend.
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
          name: customerName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          items: cart.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
            size: item.size,
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

      setOrderId(
        typeof data.orderId === "number" ? data.orderId : null
      );

      setConfirmedTotal(
        typeof data.total === "number" ? data.total : subtotal
      );

      setOrderPlaced(true);
      setCart([]);
    } catch (err: unknown) {
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

        <nav aria-label="Main navigation">
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

            <span>
              {loading
                ? "Loading..."
                : `${filteredProducts.length} products`}
            </span>
          </div>

          <div
            className="collection-filters"
            aria-label="Product collections"
          >
            {(["All", "Men", "Women"] as CollectionFilter[]).map(
              (collection) => (
                <button
                  key={collection}
                  type="button"
                  className={`collection-filter${
                    activeCollection === collection ? " active" : ""
                  }`}
                  aria-pressed={activeCollection === collection}
                  onClick={() => setActiveCollection(collection)}
                >
                  {collection === "All" ? "All Products" : collection}
                </button>
              )
            )}
          </div>

          {loading && (
            <div
              className="product-grid"
              aria-label="Loading products"
              aria-busy="true"
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div className="product-skeleton" key={index}>
                  <div className="skeleton-image" />

                  <div className="skeleton-info">
                    <div className="skeleton-line skeleton-title" />
                    <div className="skeleton-line skeleton-price" />
                    <div className="skeleton-line skeleton-button" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !checkoutOpen && (
            <div className="error" role="alert">
              <p>{error}</p>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setProducts([]);
                  setLoadAttempt((attempt) => attempt + 1);
                }}
              >
                {loading ? "LOADING..." : "TRY AGAIN"}
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <p role="status">
              No products found in this collection yet.
            </p>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <button
                    type="button"
                    className="product-detail-trigger"
                    onClick={() => openProductDetails(product)}
                    aria-label={`View details for ${product.name}`}
                  >
                    <div className="product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />

                      <span className="category">
                        {product.category}
                      </span>
                    </div>

                    <div className="product-info">
                      <h3>{product.name}</h3>

                      <p className="price">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </button>

                  <div className="product-card-actions">
                    <button
                      type="button"
                      onClick={() => openProductDetails(product)}
                    >
                      VIEW DETAILS
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
            {/* Product details modal */}
      {selectedDetailProduct && (
        <div
          className="cart-backdrop product-detail-backdrop"
          onClick={closeProductDetails}
        >
          <section
            className="product-detail-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-cart product-detail-close"
              onClick={closeProductDetails}
              aria-label="Close product details"
            >
              ×
            </button>

            <div className="product-detail-layout">
              <div className="product-detail-image">
                <img
                  src={selectedDetailProduct.image}
                  alt={selectedDetailProduct.name}
                />
              </div>

              <div className="product-detail-content">
                <p className="eyebrow">THE CLOTHIFY EDIT</p>

                <p className="product-detail-category">
                  {selectedDetailProduct.category}
                </p>

                <h2 id="product-detail-title">
                  {selectedDetailProduct.name}
                </h2>

                <p className="product-detail-price">
                  {formatPrice(selectedDetailProduct.price)}
                </p>

                <div className="product-detail-divider" />

                <p className="product-detail-description">
                  Discover your next everyday favourite. Explore this
                  piece from the CLOTHIFY collection and choose your
                  preferred size before adding it to your bag.
                </p>

                <div className="product-detail-information">
                  <div>
                    <span>Collection</span>
                    <strong>{selectedDetailProduct.category}</strong>
                  </div>

                  <div>
                    <span>Product ID</span>
                    <strong>#{selectedDetailProduct.id}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className="checkout-button product-detail-size-button"
                  onClick={() =>
                    openSizeSelector(selectedDetailProduct)
                  }
                >
                  CHOOSE SIZE
                </button>

                <p className="product-detail-note">
                  Select your size in the next step before adding
                  this item to your shopping bag.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Checkout */}
      {checkoutOpen && (
        <div className="checkout-page" ref={checkoutRef}>
          <div className="checkout-scroll-hint" role="status">
            <span aria-hidden="true">↓</span>
            <strong>You're almost there!</strong>
            <span>
              Complete your delivery details below to place your order.
            </span>
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
                Order total:{" "}
                <strong>{formatPrice(confirmedTotal)}</strong>
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

                <p>
                  Enter your delivery details to complete your order.
                </p>

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
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
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
                    {submittingOrder
                      ? "SAVING ORDER..."
                      : "PLACE ORDER"}
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

                {cart.map(({ product, quantity, size }) => (
                  <div
                    className="summary-item"
                    key={`${product.id}-${size}`}
                  >
                    <span>
                      {product.name} · Size {size} × {quantity}
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
            {/* Size selection popup */}
      {selectedProduct && (
        <div
          className="cart-backdrop size-modal-backdrop"
          onClick={() => setSelectedProduct(null)}
        >
          <section
            className="checkout-card size-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="size-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="close-cart size-modal-close"
              onClick={() => setSelectedProduct(null)}
              aria-label="Close size selector"
            >
              ×
            </button>

            <p className="eyebrow">CLOTHIFY FIT GUIDE</p>
            <h2 id="size-modal-title">Choose your size</h2>
            <p>{selectedProduct.name}</p>
            <p className="price">
              {formatPrice(selectedProduct.price)}
            </p>

            <div className="size-options" aria-label="Available sizes">
              {CLOTHING_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={`size-option${
                    selectedSize === size ? " selected" : ""
                  }`}
                  aria-pressed={selectedSize === size}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="checkout-button"
              onClick={() => addToCart(selectedProduct, selectedSize)}
            >
              ADD TO BAG · {selectedSize}
            </button>
          </section>
        </div>
      )}

      {/* Shopping bag */}
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
                  {cart.map(({ product, quantity, size }) => (
                    <article
                      className="cart-item"
                      key={`${product.id}-${size}`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                      />

                      <div className="cart-item-details">
                        <h3>{product.name}</h3>

                        <p>
                          {formatPrice(product.price)} · Size {size}
                        </p>

                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(product.id, size, -1)
                            }
                            aria-label={`Decrease ${product.name} quantity`}
                          >
                            −
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            onClick={() =>
                              changeQuantity(product.id, size, 1)
                            }
                            aria-label={`Increase ${product.name} quantity`}
                          >
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="remove-item"
                          onClick={() =>
                            removeFromCart(product.id, size)
                          }
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

                  <p>
                    Shipping and taxes calculated at checkout.
                  </p>

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