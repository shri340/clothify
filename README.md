# CLOTHIFY — Your Style, Your Story

**A Full-Stack Fashion E-Commerce Platform**

Clothify is a modern fashion e-commerce web application built to deliver a simple, intuitive, and engaging online shopping experience. The platform brings together curated fashion collections, product browsing, product filtering, wishlist management, clothing-size selection, shopping bag management, and order processing through a full-stack architecture.

**Live Website:** https://clothify-qjfd.onrender.com

## About the Project

Clothify aims to make everyday fashion shopping convenient through a clean user interface and a structured backend system. Customers can explore men's and women's collections, discover footwear, select product sizes, manage their wishlist and shopping bag, and submit delivery details through checkout.

The application combines a responsive frontend with REST API integration, backend validation, security configurations, and database-backed order persistence.

## Key Features

- **Men's and Women's Collections** — Explore a range of clothing products for different styles.
- **Footwear Collection** — Browse footwear alongside apparel.
- **Product Catalog** — View product names, categories, images, and prices.
- **Advanced Product Filtering** — Refine product browsing using available product filters.
- **Wishlist Management** — Save and manage favorite products.
- **Size Selection** — Choose from XS, S, M, L, XL, and XXL for supported clothing products, with product-specific size validation on the backend.
- **Shopping Bag Management** — Add products, update quantities, remove items, and review subtotals.
- **Checkout Experience** — Enter customer and delivery information through a dedicated checkout interface.
- **Order Processing** — Submit order details to the backend for validation and persistence.
- **Order Confirmation** — Display an order reference and calculated total after successful submission.
- **Database Integration** — Store order records using PostgreSQL.
- **Backend Price Validation** — Calculate order totals using server-side product prices rather than trusting frontend-submitted prices.
- **Input Validation** — Validate customer details, product IDs, quantities, and product sizes.
- **Duplicate Item Protection** — Reject duplicate product IDs within a single order.
- **Modern User Interface** — A product-focused shopping experience built with React, TypeScript, and custom CSS.

*The current checkout is a demonstration flow and does not process online payments.*

## Technology Stack

| Technology | Purpose |
|---|---|
| React | Frontend user interface |
| TypeScript | Type-safe frontend development |
| Vite | Frontend development and build tooling |
| CSS | Styling and visual presentation |
| Java | Backend application development |
| Spring Boot | REST API and application services |
| Spring Security | API security and authorization |
| Spring Data JPA / Hibernate | Database persistence |
| PostgreSQL | Relational data storage |
| Maven | Backend build management |
| Git and GitHub | Version control and source collaboration |
| Render | Application deployment |

## System Architecture

Clothify follows a client-server architecture in which the frontend communicates with the backend through REST APIs.

```text
                CLOTHIFY
                    |
                    v
          React + TypeScript
                    |
                    v
               REST API
                    |
                    v
          Java Spring Boot
                    |
             +------+------+
             |             |
             v             v
       Spring Security  Order Services
             |             |
             +------+------+
                    |
                    v
          Spring Data JPA
                    |
                    v
              PostgreSQL
```

### Frontend

The frontend provides the customer-facing shopping experience, including:

- Product presentation and collections.
- Product filtering and wishlist operations.
- Size selection.
- Shopping bag and quantity management.
- Checkout forms.
- Order confirmation.

It communicates with the backend using REST API requests and JSON data.

### Backend

The Spring Boot backend exposes REST endpoints for product retrieval and order submission.

It handles:

- Product information retrieval.
- Order creation and processing.
- Customer information validation.
- Product ID and quantity validation.
- Product-specific size validation.
- Server-side order total calculation.
- Duplicate product ID rejection.
- Order persistence.

Spring Security provides authentication and role-based authorization for protected admin endpoints.

### Database

PostgreSQL provides persistent storage for customer order records, including customer details, delivery information, order items, calculated totals, and other entity fields.

Spring Data JPA and Hibernate handle database persistence.

## API Endpoints

| HTTP Method | Endpoint | Description |
|---|---|---|
| GET | `/api/products` | Retrieve product catalog |
| GET | `/api/products/{id}` | Retrieve a product by ID, if supported |
| POST | `/api/orders` | Submit and create an order |

**Security:** Product retrieval and customer order submission are publicly accessible. Admin endpoints require the ADMIN role.

## Backend Security and Validation

Security and validation are handled on the backend rather than relying only on frontend checks.

Implemented protections include:

- Restricted CORS origins for the deployed frontend and local development frontend.
- Stateless Spring Security configuration.
- Role-based authorization for admin endpoints.
- HTTP Basic authentication.
- Customer name validation (2–200 characters).
- Phone number validation (exactly 10 digits).
- Address validation (10–1000 characters).
- Maximum 50 line items per order.
- Quantity restrictions (1–100 per line item).
- Product ID validation against the backend catalog.
- Product-specific size validation.
- Duplicate product ID rejection.
- Server-side product pricing and total calculation.

*Note: CORS controls browser-based cross-origin access; it is not a replacement for API authentication or rate limiting.*

## Project Highlights

- Full-stack integration between a React frontend and Java backend.
- RESTful communication using JSON.
- Responsive and interactive shopping interface.
- Product filtering and wishlist functionality.
- Backend-controlled order calculations.
- Server-side validation of submitted order details.
- Product-size-aware shopping cart functionality.
- Database-backed order persistence.
- Spring Security integration.
- Local and production frontend-to-backend communication.
- Successful backend build and test execution.
- End-to-end checkout verification, including PostgreSQL order persistence.

## Local Installation and Setup

### Prerequisites

- Java JDK
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/shri340/clothify.git
cd clothify
```

### 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE clothify;
```

### 3. Configure Backend Environment Variables

Set the following environment variables:

```text
DB_URL=jdbc:postgresql://localhost:5432/clothify
DB_USERNAME=postgres
DB_PASSWORD=your_postgresql_password

CLOTHIFY_ADMIN_USERNAME=your_admin_username
CLOTHIFY_ADMIN_PASSWORD=your_secure_admin_password
```

Use your own credentials. Never commit passwords or secret environment variables to GitHub.

The administrator password must be at least 12 characters long.

### 4. Start the Backend

Navigate to the backend directory:

```bash
cd backend
```

On Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080
```

### 5. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

Start the development server:

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

## Testing and Verification

Backend tests can be executed using Maven:

```powershell
.\mvnw.cmd test
```

The backend test suite completed successfully during the latest development verification.

The following functionality was also manually verified:

- Product API response.
- Local frontend-to-backend communication.
- CORS configuration for local development.
- Customer checkout validation.
- Order placement.
- Duplicate product protection.
- PostgreSQL order persistence.
- Production website product loading.
- Successful production checkout and order submission.

## Deployment

Clothify is deployed using Render.

| Component | Deployment |
|---|---|
| Frontend | Render |
| Backend | Render |
| Database | PostgreSQL |

**Live Frontend:** https://clothify-qjfd.onrender.com

**Backend API:** https://clothify-backend-api.onrender.com

The frontend communicates with the deployed backend through the configured API base URL.

Production credentials and database configuration are maintained through environment variables rather than hardcoded secrets.

## Future Scope

Clothify can be extended with:

- Customer registration, authentication, and profiles.
- Order history and shipment tracking.
- Inventory and stock availability management.
- Secure payment gateway integration.
- Shipping and tax calculation.
- Product reviews and ratings.
- Email order notifications.
- Enhanced admin dashboard and product management.
- API rate limiting and abuse protection.
- Automated integration and security testing.
- Improved accessibility and performance optimization.

## Project Vision

Clothify is an evolving full-stack project focused on combining practical software engineering with a modern fashion-shopping experience.

From responsive product browsing and wishlist management to backend order validation and PostgreSQL persistence, the project demonstrates the integration of frontend development, backend engineering, database management, and application security.

Its modular architecture provides a foundation for further development into a more complete e-commerce platform.

---

**CLOTHIFY — Your Style, Your Story.**

*Built with React, TypeScript, Java Spring Boot, Spring Security, and PostgreSQL.*
