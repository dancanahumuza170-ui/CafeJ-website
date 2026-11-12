# Cafe J — Restaurant Ordering Website

A complete front-end demo of a café ordering website: browse the menu, search dishes,
build a cart, place orders, book tables, leave reviews — plus staff and kitchen portals
for order management, pricing, and records. Pure HTML, CSS, and vanilla JavaScript —
no build step, no dependencies.

## Run it

Open `index.html` directly, or serve the folder with any static server:

```bash
python -m http.server 8080
# then visit http://localhost:8080/
```

## Demo accounts

| Role | Credentials |
|------|-------------|
| Customer | `diane01@gmail.com` or `james02@gmail.com`, password `demo1234` |
| Staff | username `staff`, password `staff123` |
| Kitchen | username `chef`, password `chef123` |

## Features

- **Customer**: menu with categories/cuisines/offers, search (name, description, category, cuisine), favorites, cart with promo codes (try `TASTY30`), delivery/pickup, checkout, order tracking, table reservations, reviews, newsletter
- **Staff portal**: order board, menu item CRUD with live price/offer editing, records (orders, payments, reservations, subscribers), sales, team management
- **Kitchen portal**: cook queue, stock/sold-out toggling
- **Persistence**: cart, orders, reservations, reviews, subscribers and accounts are saved to `localStorage` (`cafe_state_v1`, `cafe_users_v1`) and survive reloads
- **URL routing**: views are reflected in the hash (`#menu`, `#orders`, …) — deep links and the Back button work
- **Dark mode**: follows `prefers-color-scheme`
- Responsive layout, UGX pricing, ACC-style order status flow

## Structure

```
CafeJ-website/
├── index.html   # shell, views are rendered by app.js
├── style.css    # all styling incl. dark mode
├── app.js       # state, rendering, persistence, routing
└── images/      # menu, cuisine, and promo photos
```

## Notes

This is a **front-end demo**: authentication is client-side (lightly hashed passwords in
`localStorage`) and there is no server. A real deployment needs a backend for accounts,
orders, and payments.
