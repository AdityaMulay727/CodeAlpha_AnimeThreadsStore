# Anime Threads — Anime T-Shirts & Pants Store

A full-stack e-commerce store (Task 1, CodeAlpha Full Stack Development internship) for anime-themed t-shirts and pants — built with Node.js/Express on the backend and vanilla HTML/CSS/JavaScript on the frontend.

## 🔗 Live Demo

👉 https://codealpha-animethreadsstore.onrender.com

> Hosted on Render's free tier — the app may take ~50 seconds to wake up on first load if it's been inactive.

## Features

- **Product listing** — browse all products with category filter (T-Shirts / Pants) and search
- **Product details page** — size selector, quantity picker, live stock count
- **Shopping cart** — add, update, and remove items with a live running total
- **Order processing** — checkout with shipping address and payment method, plus order history
- **User registration/login** — secure password hashing (bcrypt) with session-based authentication
- **Database** — lightweight JSON file storage for products, users, and orders (no setup required)

## Tech stack

- **Backend:** Node.js, Express, bcrypt, express-session
- **Database:** JSON file store (`data/*.json`)
- **Frontend:** vanilla HTML/CSS/JavaScript

## Project structure
anime-store/
├── server.js              # Express app and routes
├── data/
│   ├── products.json      # Product catalog
│   ├── users.json         # Registered users
│   └── orders.json        # Placed orders
└── public/
├── index.html          # Homepage / product listing
├── product.html        # Product detail page
├── cart.html           # Shopping cart
├── login.html           # Login page
├── register.html        # Registration page
├── orders.html          # Order history
├── css/style.css
└── js/api.js

## Running it locally

The server starts on **http://localhost:3000** and serves both the API and the frontend, so just open that URL in your browser — no separate frontend server needed.

## How to use it

1. Browse products on the homepage, filter by category, or search.
2. Click a product to view details, choose a size and quantity.
3. Add items to your cart and review the total.
4. Register an account (or log in if you already have one).
5. Checkout with your shipping address and payment method to place an order.
6. View your past orders on the Orders page.

## Notes for submission

- This repo is named `CodeAlpha_AnimeThreadsStore` per the internship's GitHub naming convention.
- `data/` files are seeded with sample anime product data; user/order data is created as people interact with the live demo.
- The internship instructions ask interns to share a short video walkthrough on LinkedIn with the repo link, and to submit through the official form.

## 🙏 Acknowledgment

Thank you **CodeAlpha** for this incredible opportunity to learn full stack development through real-world projects!

---

**Connect with me:**

- LinkedIn: [Aditya Kanifnath Mulay](https://www.linkedin.com/in/aditya-kanifnath-mulay-49558734a/)
- GitHub: [@AdityaMulay727](https://github.com/AdityaMulay727)

CodeAlpha Full Stack Development internship — Task 1.
