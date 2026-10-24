# CLOTHIFY — Your Style, Your Story

**A Full-Stack Fashion E-Commerce Platform**

Clothify is a modern fashion e-commerce web application built to deliver a simple, intuitive, and engaging online shopping experience. The platform brings together curated fashion collections, product browsing, clothing-size selection, shopping bag management, and order processing through a full-stack architecture.

## About the Project

Clothify aims to make everyday fashion shopping convenient through a clean user interface and a structured backend system. Customers can explore men's and women's collections, discover footwear, select clothing sizes, manage their shopping bag, and submit delivery details through checkout.

The application combines a responsive frontend with REST API integration and database-backed order persistence.

## Key Features

- **Men's and Women's Collections** — Explore a range of clothing products for different styles.
- **Footwear Collection** — Browse footwear alongside apparel.
- **Product Catalog** — View product names, categories, images, and prices.
- **Size Selection** — Choose from XS, S, M, L, XL, and XXL for supported clothing products.
- **Shopping Bag Management** — Add products, update quantities, remove items, and review subtotals.
- **Checkout Experience** — Enter customer and delivery information through a dedicated checkout interface.
- **Order Processing** — Submit order details to the backend for validation and persistence.
- **Order Confirmation** — Display an order reference and calculated total after successful submission.
- **Database Integration** — Store order records using PostgreSQL.
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
                    v
          Spring Data JPA
                    |
                    v
              PostgreSQL
```

### Frontend

The frontend provides the customer-facing shopping experience, including product presentation, size selection, cart operations, checkout forms, and order confirmation.

### Backend

The Spring Boot backend exposes REST endpoints for product retrieval and order submission. It validates incoming order information, calculates order totals using server-side product pricing, and coordinates order persistence.

### Database

PostgreSQL provides persistent storage for customer order records, including delivery information, totals, order items, and creation timestamps.

## Project Highlights

- Full-stack integration between a React frontend and Java backend.
- RESTful communication using JSON.
- Server-side validation of submitted order details.
- Product-size-aware shopping cart functionality.
- Database-backed order persistence.
- Separation of frontend, backend, and database responsibilities.
- A foundation for extending the platform with additional e-commerce capabilities.

## Future Scope

Clothify can be extended with:

- Customer registration, authentication, and profiles.
- Product search, filtering, and sorting.
- Inventory and stock availability management.
- Order history and shipment tracking.
- Secure payment gateway integration.
- Shipping and tax calculation.
- Product reviews and ratings.
- Automated testing, monitoring, and improved accessibility.

## Project Vision

Clothify is an evolving full-stack project focused on combining practical software engineering with a modern fashion-shopping experience. Its architecture provides a foundation for further development into a more complete e-commerce platform.

---

**CLOTHIFY — Your Style, Your Story.**

*Built with React, TypeScript, Java Spring Boot, and PostgreSQL.*
