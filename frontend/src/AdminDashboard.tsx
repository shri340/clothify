
import { useState } from "react";
import "./AdminDashboard.css";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://clothify-backend-api.onrender.com"
).replace(/\/+$/, "");

type Order = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  itemsJson: string;
  total: number;
  createdAt: string | null;
};

function formatPrice(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function AdminDashboard() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState("");

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const basicToken = btoa(`${username}:${password}`);
    const authorization = `Basic ${basicToken}`;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/orders`,
        {
          method: "GET",
          headers: {
            Authorization: authorization,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        throw new Error("Invalid admin credentials or access denied.");
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}.`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected order format.");
      }

      setOrders(data as Order[]);
      setCredentials(authorization);
      setAuthenticated(true);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the admin service."
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshOrders() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/orders`,
        {
          headers: {
            Authorization: credentials,
            Accept: "application/json",
          },
          cache: "no-store",
        }
      );

      if (response.status === 401 || response.status === 403) {
        logout();
        throw new Error("Your session was rejected. Please log in again.");
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}.`);
      }

      const data: unknown = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected order format.");
      }

      setOrders(data as Order[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to refresh orders."
      );
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthenticated(false);
    setCredentials("");
    setOrders([]);
    setUsername("");
    setPassword("");
    setError("");
  }

  if (!authenticated) {
    return (
      <main className="admin-page">
        <section className="admin-login-card">
          <a className="admin-brand" href="/">
            CLOTHIFY<span>.</span>
          </a>

          <p className="admin-eyebrow">PRIVATE MANAGEMENT</p>
          <h1>Admin sign in</h1>
          <p className="admin-muted">
            Sign in to access customer orders.
          </p>

          <form onSubmit={login} className="admin-login-form">
            <label htmlFor="admin-username">Username</label>
            <input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              required
            />

            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="admin-primary-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "VERIFYING..." : "SIGN IN"}
            </button>
          </form>

          <a className="admin-back-link" href="/">
            ← Back to store
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page admin-dashboard">
      <header className="admin-topbar">
        <a className="admin-brand" href="/">
          CLOTHIFY<span>.</span>
        </a>

        <div className="admin-topbar-actions">
          <span className="admin-role">ADMIN</span>
          <button
            className="admin-secondary-button"
            onClick={refreshOrders}
            disabled={loading}
          >
            {loading ? "LOADING..." : "REFRESH"}
          </button>
          <button className="admin-logout-button" onClick={logout}>
            LOG OUT
          </button>
        </div>
      </header>

      <section className="admin-content">
        <p className="admin-eyebrow">STORE MANAGEMENT</p>
        <h1>Orders</h1>
        <p className="admin-muted">
          Review orders saved by the Clothify checkout.
        </p>

        {error && (
          <p className="admin-error" role="alert">
            {error}
          </p>
        )}

        <section className="admin-stats">
          <article className="admin-stat-card">
            <span>Total orders</span>
            <strong>{orders.length}</strong>
          </article>

          <article className="admin-stat-card">
            <span>Total order value</span>
            <strong>
              {formatPrice(
                orders.reduce((sum, order) => sum + order.total, 0)
              )}
            </strong>
          </article>
        </section>

        {loading && orders.length === 0 ? (
          <p className="admin-empty">Loading orders...</p>
        ) : orders.length === 0 ? (
          <section className="admin-empty">
            <h2>No orders yet</h2>
            <p>New customer orders will appear here.</p>
          </section>
        ) : (
          <section className="admin-order-list">
            {orders.map((order) => (
              <article className="admin-order-card" key={order.id}>
                <div className="admin-order-heading">
                  <div>
                    <span className="admin-order-label">ORDER</span>
                    <h2>#{order.id}</h2>
                  </div>

                  <strong className="admin-order-total">
                    {formatPrice(order.total)}
                  </strong>
                </div>

                <div className="admin-order-details">
                  <p>
                    <span>Customer</span>
                    <strong>{order.customerName}</strong>
                  </p>
                  <p>
                    <span>Phone</span>
                    <strong>{order.phone}</strong>
                  </p>
                  <p>
                    <span>Delivery address</span>
                    <strong>{order.address}</strong>
                  </p>
                  <p>
                    <span>Order date</span>
                    <strong>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString()
                        : "Not available"}
                    </strong>
                  </p>
                </div>

                <details className="admin-order-items">
                  <summary>View purchased items</summary>
                  <pre>{order.itemsJson}</pre>
                </details>
              </article>
            ))}
          </section>
        )}

        <a className="admin-back-link" href="/">
          ← Return to storefront
        </a>
      </section>
    </main>
  );
}

export default AdminDashboard;
