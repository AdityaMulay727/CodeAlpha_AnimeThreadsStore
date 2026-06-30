# Anime Threads — Task 1: Simple E-commerce Store

A full-stack anime-themed e-commerce store (T-shirts + Pants) built with **HTML/CSS/JavaScript** frontend and an **Express.js (Node.js)** backend.

## Features (matches the task brief)
- Product listing with category filter (T-Shirt / Pants) and search
- Product details page with size selection, quantity picker, stock display
- Shopping cart (add / update qty / remove / view total) — stored server-side per session
- User registration & login (passwords hashed with bcrypt)
- Order processing / checkout with shipping address + payment method, "My Orders" history
- Simple JSON-file database for products, users, and orders (no external DB required)

## Tech Stack
- Frontend: vanilla HTML, CSS, JavaScript (fetch API)
- Backend: Express.js (Node.js)
- Auth: express-session + bcryptjs
- "Database": JSON files in `/data` (products.json, users.json, orders.json)

## How to Run

1. Make sure you have **Node.js** installed (v16+).
2. Open a terminal in this folder and install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open your browser at:
   ```
   http://localhost:3000
   ```

## Project Structure
```
anime-store/
├── server.js              # Express server + all API routes
├── package.json
├── data/
│   ├── products.json      # 12 anime t-shirts & pants (pre-loaded)
│   ├── users.json          # created automatically on first run
│   └── orders.json         # created automatically on first run
└── public/
    ├── index.html          # product listing + filters/search
    ├── product.html        # product detail page
    ├── cart.html           # cart + checkout modal
    ├── login.html
    ├── register.html
    ├── orders.html         # order history
    ├── css/style.css
    └── js/api.js           # shared fetch helper + navbar
```

## API Endpoints
| Method | Route | Description |
|---|---|---|
| GET | /api/products | List products (supports ?category= & ?q=) |
| GET | /api/products/:id | Single product detail |
| POST | /api/register | Create account |
| POST | /api/login | Log in |
| POST | /api/logout | Log out |
| GET | /api/me | Current logged-in user |
| GET | /api/cart | View cart |
| POST | /api/cart/add | Add item to cart |
| POST | /api/cart/update | Update item quantity |
| POST | /api/cart/remove | Remove item |
| POST | /api/orders | Place order (requires login) |
| GET | /api/orders | View your order history (requires login) |

## Notes / Next Steps (optional improvements)
- Swap the JSON file storage for a real database (MongoDB/PostgreSQL) if you need persistence at scale.
- Add product image upload instead of using placeholder Unsplash URLs.
- Add an admin panel to add/edit products and update order status.
