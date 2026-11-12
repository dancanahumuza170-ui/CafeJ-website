(function () {
  var TODAY = (function () { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); })();
  var state = {
    role: "customer", view: "home", cat: "All", q: "", cuisine: "", favs: [], promoOn: false, promoMsg: "", loginRole: "staff", chefView: "kitchen",
    user: 1, authTab: "in", authErr: "", aEmail: "", promoCode: "",
    cart: {}, slot: "ASAP", note: "", method: "mtn", phone: "0775873839", checkErr: "",
    lastOrder: null, staffView: "orders", processing: false, fulfil: "pickup", dArea: "", dAddr: ""
  };
  var menu = [
    { id: 101, name: "Chicken Burger", cat: "Fast food", price: 50000, avail: true, desc: "Grilled chicken, lettuce, tomato, house sauce" },
    { id: 102, name: "Veggie Pizza", cat: "Pizza", price: 30000, avail: false, desc: "Peppers, onion, mushroom, mozzarella" },
    { id: 103, name: "Caesar Salad", cat: "Healthy", price: 35000, avail: true, desc: "Romaine, parmesan, croutons, grilled chicken" },
    { id: 104, name: "Beef Burger", cat: "Fast food", price: 45000, avail: true, desc: "Beef patty, cheddar, pickles, onion" },
    { id: 105, name: "Margherita Pizza", cat: "Pizza", price: 38000, avail: true, desc: "Tomato, mozzarella, fresh basil" },
    { id: 106, name: "Grilled Tilapia", cat: "Healthy", price: 42000, avail: true, desc: "Whole tilapia, steamed greens, lemon butter" },
    { id: 107, name: "Fruit Smoothie", cat: "Drinks", price: 20000, avail: true, desc: "Mango, passion fruit and banana" },
    { id: 108, name: "Cappuccino", cat: "Drinks", price: 12000, avail: true, desc: "Double shot, steamed milk" },
    { id: 109, name: "Chocolate Brownie", cat: "Dessert", price: 15000, avail: true, desc: "Warm brownie with vanilla ice cream" },
    { id: 110, name: "Chips and Wings", cat: "Fast food", price: 32000, avail: true, desc: "Crispy chips with six spicy wings" }
  ];
  var customers = [
    { id: 1, name: "Diane", email: "diane01@gmail.com", phone: "0775873839", address: "Seeta", pw: hpw("diane01@gmail.com", "demo1234") },
    { id: 2, name: "James", email: "james02@gmail.com", phone: "0701547182", address: "Nalya", pw: hpw("james02@gmail.com", "demo1234") }
  ];
  var orders = [
    { id: 5001, cid: 1, date: TODAY, slot: "ASAP", items: [{ id: 101, qty: 1 }, { id: 107, qty: 1 }], status: "Completed", total: 70000, note: "" },
    { id: 5002, cid: 2, date: TODAY, slot: "13:00", items: [{ id: 107, qty: 2 }], status: "Pending", total: 48000, note: "No ice please", type: "delivery", area: "Nalya", addr: "Plot 12, Nalya Road", fee: 8000 }
  ];
  var payments = [
    { id: 9001, oid: 5001, method: "Credit card", amount: 70000, date: TODAY, status: "Paid" },
    { id: 9002, oid: 5002, method: "Mobile money", amount: 48000, date: TODAY, status: "Paid" }
  ];
  var nextOrder = 5003, nextPay = 9003, nextCust = 3, nextItem = 111;
  var slots = ["ASAP", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00"];
  var cats = ["All", "Fast food", "Pizza", "Healthy", "Drinks", "Dessert"];
  var flow = ["Pending", "Preparing", "Ready", "Completed"];

  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ugx(n) { return "UGX " + Number(n).toLocaleString("en-US"); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0]; }
  function cartCount() { return Object.keys(state.cart).reduce(function (a, k) { return a + state.cart[k]; }, 0); }
  function cartTotal() { return Object.keys(state.cart).reduce(function (a, k) { return a + state.cart[k] * priceOf(byId(menu, +k)); }, 0); }
  function user() { return byId(customers, state.user); }
  function payOf(oid) { return payments.filter(function (p) { return p.oid === oid; })[0]; }
  function pill(s) { return '<span class="pill ' + s.replace(/ /g, "-") + '">' + s + "</span>"; }
  function itemsText(o) { return o.items.map(function (i) { return i.qty + " × " + byId(menu, i.id).name; }); }
  var toastTimer;
  function toast(msg) { var t = $("#toast"); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600); }

  /* ---------- website additions: images, delivery, home page ---------- */
  // Edit delivery areas and fees here (UGX). Orders at or above FREE_DELIVERY_ABOVE get free delivery.
  var ZONES = [["Ntinda", 4000], ["Nakawa", 4000], ["Bukoto", 5000], ["Kireka", 6000], ["Seeta", 8000], ["Nalya", 8000]];
  var FREE_DELIVERY_ABOVE = 100000;
  // Sample menu additions (cuisine, ratings and offers are editable; ratings are sample values, replace with real ones).
  menu.push(
    { id: 111, name: "Spicy Zinger Burger", cat: "Fast food", price: 33000, avail: true, desc: "Crispy spicy chicken fillet, lettuce, zinger sauce", sub: "Crispy chicken burger", cuisine: "American" },
    { id: 112, name: "Grilled Chicken with Veggies", cat: "Healthy", price: 48000, avail: true, desc: "Grilled chicken breast with roasted vegetables", sub: "Healthy choice", badge: "Bestseller", rating: "4.8" },
    { id: 113, name: "Paneer Butter Masala", cat: "Mains", price: 42500, avail: true, desc: "Paneer in creamy tomato butter gravy, served with naan", sub: "with Naan", badge: "Bestseller", rating: "4.9", cuisine: "Indian" },
    { id: 114, name: "Sushi Platter", cat: "Mains", price: 52000, avail: true, desc: "12 pieces of assorted rolls and nigiri", sub: "12 Pieces", off: 10, rating: "4.6", cuisine: "Japanese" },
    { id: 115, name: "Chocolate Lava Cake", cat: "Dessert", price: 26000, avail: true, desc: "Warm molten chocolate cake with vanilla ice cream", sub: "with Ice Cream", off: 20, rating: "4.8" },
    { id: 116, name: "Veg Chow Mein", cat: "Mains", price: 30000, avail: true, desc: "Stir-fried noodles with crunchy vegetables", cuisine: "Chinese" },
    { id: 117, name: "Beef Tacos", cat: "Mains", price: 32000, avail: true, desc: "Three soft tacos with beef, salsa and lime", cuisine: "Mexican" },
    { id: 118, name: "Family Combo Meal", cat: "Fast food", price: 120000, avail: true, desc: "2 burgers, large chips, 4 wings and 4 drinks", sub: "Feeds 4" }
  );
  nextItem = 119; cats.push("Mains");
  [[102, "Italian"], [105, "Italian"]].forEach(function (x) { byId(menu, x[0]).cuisine = x[1]; });
  var m5 = byId(menu, 105); m5.off = 10; m5.rating = "4.7"; m5.sub = "Classic Delight";
  var POPULAR = [112, 105, 113, 114, 115], SLIDES = [111, 105, 112], slideIdx = 0;
  var reservations = [], nextRes = 1, reviews = [], subscribers = [];
  var flowD = ["Pending", "Preparing", "Ready", "Out for delivery", "Completed"];

  /* ---------- persistence: cart, favorites, orders, reservations, reviews, subscribers ---------- */
  var STORE_KEY = "cafe_state_v1";
  function saveState() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        cart: state.cart, favs: state.favs, customers: customers, orders: orders, payments: payments,
        reservations: reservations, reviews: reviews, subscribers: subscribers,
        nextOrder: nextOrder, nextPay: nextPay, nextCust: nextCust, nextRes: nextRes, nextItem: nextItem
      }));
    } catch (e) {}
  }
  // Load saved data only when it exists; otherwise the seed data above stays the default.
  function loadState() {
    var s = null;
    try { s = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) { return; }
    if (!s) return;
    if (s.cart) state.cart = s.cart;
    if (s.favs) state.favs = s.favs;
    if (s.customers && s.customers.length) customers = s.customers;
    if (s.orders && s.orders.length) orders = s.orders;
    if (s.payments && s.payments.length) payments = s.payments;
    if (s.reservations) reservations = s.reservations;
    if (s.reviews) reviews = s.reviews;
    if (s.subscribers) subscribers = s.subscribers;
    if (s.nextOrder) nextOrder = s.nextOrder;
    if (s.nextPay) nextPay = s.nextPay;
    if (s.nextCust) nextCust = s.nextCust;
    if (s.nextRes) nextRes = s.nextRes;
    if (s.nextItem) nextItem = s.nextItem;
  }
  function zoneFee(n) { var z = ZONES.filter(function (x) { return x[0] === n; })[0]; return z ? z[1] : 0; }
  function isDel(o) { return o.type === "delivery"; }
  function fl(o) { return isDel(o) ? flowD : flow; }
  function deliveryFee() { return state.fulfil === "delivery" && state.dArea && cartTotal() < FREE_DELIVERY_ABOVE ? zoneFee(state.dArea) : 0; }
  function discount() { var u = user(); if (!state.promoOn || !u) return 0; if (orders.some(function (o) { return o.cid === u.id && o.status !== "Cancelled"; })) return 0; return Math.round(cartTotal() * 0.3); }
  function grand() { return cartTotal() - discount() + deliveryFee(); }
  function priceOf(m) { return m.off ? Math.round(m.price * (100 - m.off) / 100 / 500) * 500 : m.price; }
  function priceHtml(m) { return m.off ? '<span class="price">' + ugx(priceOf(m)) + ' <s class="hint">' + ugx(m.price) + "</s></span>" : '<span class="price">' + ugx(m.price) + "</span>"; }
  function tagHtml(m) { return m.off ? '<span class="tagpill">' + m.off + "% OFF</span>" : m.badge ? '<span class="tagpill best">' + esc(m.badge) + "</span>" : ""; }
  function heart(m) { return '<button class="heart' + (state.favs.indexOf(m.id) > -1 ? " on" : "") + '" data-act="fav" data-id="' + m.id + '" aria-label="Save ' + esc(m.name) + '">' + ic("heart") + "</button>"; }
  function head(t, s) { return '<div class="page-head"><div><h2>' + t + "</h2>" + (s ? '<p class="sub">' + s + "</p>" : "") + "</div></div>"; }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  // Each menu item looks for images/menu/<item-name>.jpg, e.g. images/menu/chicken-burger.jpg
  function imgOf(m) { return m.img || "images/menu/" + slug(m.name) + ".jpg"; }
  // IMAGE SPACE: shows a dashed placeholder until a real file exists at src, then the photo covers it.
  // Each dish looks for images/menu/<dish-name>.jpg, e.g. images/menu/chicken-burger.jpg
  // Photos are your own files in the images folder (see images/README.txt). IMG_LINKS stays empty by
  // default (nothing is loaded from the internet); add { "<label>": "<url>" } to try a remote image
  // first and fall back to the local file through data-l in imgErr().
  var IMG_LINKS = {};
  function imgBox(src, label, cls, eager) { var r = IMG_LINKS[label] || ""; return '<div class="media ' + (cls || "") + '" data-ph="' + esc(src) + '"><img src="' + esc(r || src) + '" data-l="' + (r ? esc(src) : "") + '" alt="' + esc(label) + '" loading="' + (eager ? "eager" : "lazy") + '" referrerpolicy="no-referrer" onerror="imgErr(this)"></div>'; }
  function delInfo(o) { if (!isDel(o)) return ""; var c = byId(customers, o.cid); return '<div class="hint">' + esc(o.addr) + ", " + esc(o.area) + (c ? " · " + esc(c.phone) : "") + "</div>"; }
  function nextLabel(o) { var f = fl(o), n = f[f.indexOf(o.status) + 1]; return n === "Out for delivery" ? "Send out for delivery" : n === "Completed" ? (isDel(o) ? "Mark delivered" : "Mark collected") : "Mark " + n.toLowerCase(); }
  function fulfilPanel() {
    var d = state.fulfil === "delivery";
    return '<div class="panel stack"><h3>Pickup or delivery</h3><div class="two">' +
      [["pickup", "Pickup", "Collect at the café counter"], ["delivery", "Delivery", "Brought to your door"]].map(function (x) { return '<label class="radio"><input type="radio" name="fm" value="' + x[0] + '"' + (state.fulfil === x[0] ? " checked" : "") + '> <span><b>' + x[1] + '</b><br><span class="hint">' + x[2] + "</span></span></label>"; }).join("") + "</div>" +
      (d ? '<div class="two"><label class="f">Delivery area<select class="in" id="dArea"><option value="">Choose your area</option>' + ZONES.map(function (z) { return '<option value="' + z[0] + '"' + (state.dArea === z[0] ? " selected" : "") + ">" + z[0] + " (" + ugx(z[1]) + ")</option>"; }).join("") + '</select></label><label class="f">Street, house or landmark<input class="in" id="dAddr" value="' + esc(state.dAddr) + '" placeholder="e.g. Plot 12, near the market"></label></div><p class="hint">Free delivery on orders of ' + ugx(FREE_DELIVERY_ABOVE) + " or more.</p>" : "") + "</div>";
  }
  function totals() {
    var f = deliveryFee(), d = state.fulfil === "delivery";
    return '<div class="line"><span>Subtotal</span><span class="num">' + ugx(cartTotal()) + "</span></div>" + (discount() ? '<div class="line"><span>Discount (TASTY30)</span><span class="num">−' + ugx(discount()) + "</span></div>" : "") + (d ? '<div class="line"><span>Delivery fee</span><span class="num">' + (state.dArea ? (f ? ugx(f) : "Free") : "Choose area") + "</span></div>" : "") + '<div class="total"><span>Total</span><span class="num">' + ugx(grand()) + "</span></div>";
  }
  function deliveryPanel() { return '<div class="panel">' + table("Delivery fees", ["Area", "Fee"], ZONES.map(function (z) { return [esc(z[0]), ugx(z[1])]; })) + '<p class="hint" style="margin-top:8px">Free delivery on orders of ' + ugx(FREE_DELIVERY_ABOVE) + " or more. Pickup is always free.</p></div>"; }
  function promoBox() {
    if (state.promoOn && discount() > 0) return '<p class="hint">Code TASTY30 applied. <button class="link" data-act="promooff">Remove</button></p>';
    return '<div style="display:flex;gap:8px;margin-top:10px"><input class="in" id="promo" placeholder="Promo code" aria-label="Promo code" value="' + esc(state.promoCode) + '" style="flex:1"><button class="btn sm" data-act="promo">Apply</button></div>' + (state.promoMsg ? '<p class="err">' + state.promoMsg + "</p>" : "");
  }
  function popularHtml() {
    return POPULAR.map(function (id) {
      var m = byId(menu, id); if (!m) return "";
      var qty = state.cart[id] || 0;
      return '<article class="dish">' + tagHtml(m) + heart(m) + imgBox(imgOf(m), m.name, "round") + '<div><h3>' + esc(m.name) + '</h3><small class="hint">' + esc(m.sub || m.cat) + '</small></div><div class="row2"><div><b class="num">' + ugx(priceOf(m)) + "</b>" + (m.rating ? ' <span class="star">' + ic("star") + m.rating + "</span>" : "") + "</div>" + (m.avail ? '<button class="addbtn" data-act="inc" data-id="' + id + '" aria-label="Add ' + esc(m.name) + '">' + (qty ? qty : "+") + "</button>" : '<span class="pill Unavailable">Sold out</span>') + "</div></article>";
    }).join("");
  }
  function heroUpdate() {
    var m = byId(menu, SLIDES[slideIdx]); if (!m) return;
    $("#heroMedia").innerHTML = imgBox(imgOf(m), m.name, "hero-img", true);
    $("#heroCard").innerHTML = "<b>" + esc(m.name) + '</b><small class="hint">' + esc(m.sub || m.desc) + '</small><span class="price num">' + ugx(priceOf(m)) + "</span>";
    $("#heroDots").innerHTML = SLIDES.map(function (_, i) { return '<i class="' + (i === slideIdx ? "on" : "") + '"></i>'; }).join("");
  }
  function viewCategories() {
    return head("Categories", "Pick a category to see its dishes.") + '<div class="cuisines">' + cats.slice(1).map(function (c, i) { var n = menu.filter(function (m) { return m.cat === c; }).length; return '<button class="c' + (i % 5 + 1) + '" data-act="cat" data-v="' + c + '" data-go="menu"><b>' + c + "</b><small>" + n + " dishes</small></button>"; }).join("") + "</div>";
  }
  function viewOffers() {
    var d = menu.filter(function (m) { return m.off; });
    return head("Offers", "Save on your next order.") + '<div class="promos"><div class="promo green"><div><span class="tag">FIRST ORDER</span><h3>30% OFF</h3><p>Use code <b>TASTY30</b> at checkout on your first order.</p><button class="btn dark" data-act="tab" data-v="menu">Order Now →</button></div></div><div class="promo orange"><div><span class="tag" style="color:var(--orange)">FREE DELIVERY</span><h3 style="color:var(--orange)">Over ' + ugx(FREE_DELIVERY_ABOVE) + "</h3><p>Delivery is free when you spend enough.</p><button class=\"btn primary\" data-act=\"combo\">Add the Family Combo</button></div></div></div>" +
      '<div class="sec-head"><h2>Discounted dishes</h2></div>' + listGrid(d, "No discounted dishes right now.");
  }
  function viewFavs() { return head("Favorites", "Dishes you saved with the heart.") + listGrid(menu.filter(function (m) { return state.favs.indexOf(m.id) > -1; }), "Tap the heart on a dish to save it here."); }
  function viewReserve() {
    var u = user();
    return head("Reservations", "Request a table at the café. Staff will confirm.") + '<form class="panel stack" style="max-width:520px" id="resForm"><div class="two"><label class="f">Name<input class="in" id="rsName" required value="' + esc(u ? u.name : "") + '"></label><label class="f">Phone<input class="in" id="rsPhone" required value="' + esc(u ? u.phone : "") + '"></label></div><div class="two"><label class="f">Date<input class="in" id="rsDate" type="date" min="' + TODAY + '" required></label><label class="f">Time<select class="in" id="rsTime">' + ["12:00", "13:00", "14:00", "15:00", "16:00", "18:00", "19:00"].map(function (t) { return "<option>" + t + "</option>"; }).join("") + '</select></label></div><label class="f">Guests<input class="in" id="rsGuests" type="number" min="1" max="12" value="2"></label><button class="btn primary" type="submit">Request a table</button></form>' +
      (reservations.length ? '<div style="margin-top:16px">' + table("Requests from this browser", ["Name", "Date", "Time", "Guests", "Status"], reservations.map(function (r) { return [esc(r.name), r.date, r.time, r.guests, pill(r.status)]; })) + "</div>" : "");
  }
  function viewReviews() {
    var u = user(), avg = reviews.length ? (reviews.reduce(function (a, r) { return a + r.stars; }, 0) / reviews.length).toFixed(1) : "";
    return head("Reviews", reviews.length ? avg + " out of 5 from " + reviews.length + " review" + (reviews.length > 1 ? "s" : "") : "Tell us how we did.") +
      (u ? '<form class="panel stack" style="max-width:520px" id="revForm"><label class="f">Rating<select class="in" id="rvStars"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Okay</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option></select></label><label class="f">Your review<input class="in" id="rvText" required placeholder="What did you order? How was it?"></label><button class="btn primary" type="submit">Post review</button></form>' : '<div class="panel">Sign in to write a review. <button class="btn sm primary" data-act="tab" data-v="account">Sign in</button></div>') +
      '<div class="stack" style="margin-top:14px">' + (reviews.slice().reverse().map(function (r) { return '<div class="panel"><b>' + esc(r.name) + '</b> <span class="star">' + ic("star").repeat(r.stars) + '</span><div class="hint">' + r.date + "</div><p style=\"margin:6px 0 0\">" + esc(r.text) + "</p></div>"; }).join("") || '<div class="empty">No reviews yet. Be the first.</div>') + "</div>";
  }
  function viewSupport() {
    var faq = [["How do I track my order?", "Open Orders in the menu on the left. The tracker updates as the kitchen works on it."], ["How does delivery work?", "Choose Delivery at checkout, pick your area and enter your address. Fees are in the table below."], ["Which payment methods do you accept?", "Mobile money and credit or debit card."], ["Can I cancel an order?", "Yes, while it is still Pending. Open Orders and choose Cancel; a refund request goes to staff."], ["How do I use a promo code?", "Add items, open your cart and enter the code. TASTY30 gives 30% off a first order."]];
    return head("Support", "We are here to help.") + '<div class="panel stack" style="max-width:640px"><div><b>Contact</b><div class="hint">Phone: 07XX XXX XXX · Email: hello@example.com</div></div></div>' +
      '<div class="sec-head"><h2>FAQs</h2></div><div class="stack" style="max-width:640px">' + faq.map(function (f) { return '<details class="panel"><summary><b>' + f[0] + "</b></summary><p class=\"sub\" style=\"margin:8px 0 0\">" + f[1] + "</p></details>"; }).join("") + '</div><div class="sec-head"><h2>Delivery fees</h2></div>' + deliveryPanel();
  }
  /* ---------- staff and kitchen accounts ---------- */
  // FRONT-END DEMO ONLY: accounts live in this browser (localStorage) and passwords are only lightly hashed.
  // A real launch needs a server with proper password hashing and sessions.
  function hpw(u, p) { var s = "cafe:" + u.toLowerCase() + ":" + p, h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); }
  var staffUsers = [{ id: 1, role: "staff", name: "Cafe J Manager", username: "staff", hash: hpw("staff", "staff123"), active: true }, { id: 2, role: "chef", name: "Head Chef", username: "chef", hash: hpw("chef", "chef123"), active: true, rights: { cook: true, stock: false } }], nextUid = 3;
  try { var sv = JSON.parse(localStorage.getItem("cafe_users_v1") || "null"); if (sv && sv.users && sv.users.length) { staffUsers = sv.users; nextUid = sv.next; } } catch (e) {}
  function saveUsers() { try { localStorage.setItem("cafe_users_v1", JSON.stringify({ users: staffUsers, next: nextUid })); } catch (e) {} }
  var session = null; try { session = JSON.parse(sessionStorage.getItem("cafe_session") || "null"); } catch (e) {}
  function me() { return session ? byId(staffUsers, session.uid) : null; }
  function setSession(u) { session = u ? { uid: u.id } : null; try { if (u) sessionStorage.setItem("cafe_session", JSON.stringify(session)); else sessionStorage.removeItem("cafe_session"); } catch (e) {} }
  function can(r) { var u = me(); return !!u && u.active && (u.role === "staff" || !!(u.rights && u.rights[r])); }
  (function () { var u = me(); if (u && u.active) state.role = u.role; else setSession(null); })();
  function viewLogin() {
    var k = state.loginRole === "chef";
    return head(k ? "Kitchen login" : "Staff login", k ? "For kitchen accounts created by staff." : "For café staff only.") + '<form class="panel stack" style="max-width:420px" id="loginForm"><label class="f">Username<input class="in" id="lUser" autocomplete="username" required value="' + esc(state.lUser || "") + '"></label><label class="f">Password<input class="in" id="lPass" type="password" autocomplete="current-password" required></label>' + (state.authErr ? '<p class="err">' + state.authErr + "</p>" : "") + '<button class="btn primary" type="submit">Log in</button><p class="hint">Contact admin.</p></form>';
  }
  function viewTeam() {
    var kit = staffUsers.filter(function (u) { return u.role === "chef"; });
    var rows = kit.map(function (u) {
      var r = u.rights || {};
      return [esc(u.name), '<span class="mono">' + esc(u.username) + "</span>", u.active ? '<span class="pill Paid">Active</span>' : '<span class="pill Cancelled">Disabled</span>',
        '<label class="check"><input type="checkbox" data-kr="cook" data-id="' + u.id + '"' + (r.cook ? " checked" : "") + '> Cook orders</label><label class="check"><input type="checkbox" data-kr="stock" data-id="' + u.id + '"' + (r.stock ? " checked" : "") + '> Manage stock</label>',
        '<button class="btn sm" data-act="kactive" data-id="' + u.id + '">' + (u.active ? "Disable access" : "Enable access") + '</button> <button class="btn sm" data-act="kreset" data-id="' + u.id + '">Reset password</button> <button class="btn danger sm" data-act="kdel" data-id="' + u.id + '">Delete</button>'];
    });
    return head("Team", "Create kitchen accounts and choose what each person can do.") + table("Kitchen accounts", ["Name", "Username", "Access", "Rights", "Actions"], rows) +
      '<form class="panel" id="addKitchen" style="margin-top:16px"><h3>Create a kitchen account</h3><div class="two" style="margin-bottom:10px"><label class="f">Full name<input class="in" id="kName" required></label><label class="f">Username<input class="in" id="kUser" required autocomplete="off"></label></div><div class="two" style="margin-bottom:10px"><label class="f">Password (6+ characters)<input class="in" id="kPass" type="password" minlength="6" required autocomplete="new-password"></label><div class="f">Rights<label class="check"><input type="checkbox" id="kCook" checked> Cook orders</label><label class="check"><input type="checkbox" id="kStock"> Manage stock</label></div></div>' + (state.authErr ? '<p class="err">' + state.authErr + "</p>" : "") + '<button class="btn primary" type="submit">Create account</button></form>' +
      '<form class="panel" id="pwForm" style="margin-top:16px;max-width:420px"><h3>Change my staff password</h3><label class="f">New password (6+ characters)<input class="in" id="myPass" type="password" minlength="6" required autocomplete="new-password"></label><button class="btn" type="submit" style="margin-top:10px">Update password</button></form>';
  }
  function viewChefStock() {
    return head("Stock", "Mark dishes sold out or available. Prices are managed by staff.") + '<div class="tbl-wrap"><table><thead><tr><th>Item</th><th>Availability</th></tr></thead><tbody>' + menu.map(function (m) { return "<tr><td>" + esc(m.name) + '</td><td><button class="btn sm" data-act="toggle" data-id="' + m.id + '">' + (m.avail ? "Available · mark sold out" : "Sold out · mark available") + "</button></td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function recordsExtra() {
    return table("Table reservations", ["Name", "Phone", "Date", "Time", "Guests", "Status", ""], reservations.map(function (r) { return [esc(r.name), esc(r.phone), r.date, r.time, r.guests, pill(r.status), r.status === "Requested" ? '<button class="btn sm" data-act="rconfirm" data-id="' + r.id + '">Confirm</button>' : ""]; })) +
      table("Newsletter subscribers", ["Email"], subscribers.map(function (e) { return [esc(e)]; }));
  }

  /* ---------- chrome ---------- */
  var ICONS = {"home": "<path d=\"M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "menu": "<path d=\"M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10\"/>", "grid": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>", "tag": "<path d=\"M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\"/>", "cal": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/>", "clip": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 4h6v3H9zM9 12h6M9 16h6\"/>", "star": "<path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/>", "help": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01\"/>", "heart": "<path d=\"M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z\"/>", "cart": "<circle cx=\"9\" cy=\"20\" r=\"1.4\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\"/><path d=\"M2 3h3l2.5 12h11l2-8H6\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c1-4 4-6 8-6s7 2 8 6\"/>", "db": "<ellipse cx=\"12\" cy=\"6\" rx=\"8\" ry=\"3\"/><path d=\"M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/>", "chart": "<path d=\"M4 20V10M10 20V4M16 20v-8M22 20H2\"/>", "team": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 20c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5M17 5a3.5 3.5 0 0 1 0 7M18 14.8c2.2.7 3.5 2.4 4 5.2\"/>", "flame": "<path d=\"M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z\"/>", "box": "<path d=\"M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10\"/>", "truck": "<path d=\"M2 6h11v10H2zM13 9h4l4 4v3h-8\"/><circle cx=\"7\" cy=\"18\" r=\"1.8\"/><circle cx=\"17\" cy=\"18\" r=\"1.8\"/>", "refresh": "<path d=\"M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5\"/>", "shield": "<path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"/><path d=\"M9 12l2 2 4-4\"/>", "headset": "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"/><rect x=\"3\" y=\"14\" width=\"4\" height=\"6\" rx=\"1\"/><rect x=\"17\" y=\"14\" width=\"4\" height=\"6\" rx=\"1\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-4-4\"/>"};
  function ic(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; }
  var NAV = [["home", "Home", "home"], ["menu", "Menu", "menu"], ["categories", "Categories", "grid"], ["offers", "Offers", "tag"], ["reservations", "Reservations", "cal"], ["orders", "Orders", "clip"], ["reviews", "Reviews", "star"], ["support", "Support", "help"]];
  function renderChrome() {
    var cust = state.role === "customer", onHome = cust && state.view === "home", u = me(), cc = cartCount(), top = "";
    $("#homeView").hidden = !onHome; $("#siteFoot").hidden = !cust; $("#sidePromo").hidden = !cust; $("#gsearch").hidden = !cust;
    if (cust) top += '<button class="ticon" data-act="tab" data-v="favs"><span class="i">' + ic("heart") + '</span>Favorites</button><button class="ticon" data-act="tab" data-v="cart"><span class="i">' + ic("cart") + '</span>Cart' + (cc ? '<span class="badge">' + cc + "</span>" : "") + '</button><button class="ticon" data-act="tab" data-v="account"><span class="i">' + ic("user") + '</span>' + (user() ? esc(user().name.split(" ")[0]) : "Account") + "</button>";
    if (u && u.active) {
      top += cust ? '<button class="btn sm primary" data-act="role" data-v="' + u.role + '">' + (u.role === "staff" ? "Staff portal" : "Kitchen portal") + "</button>" : '<span class="hint">' + esc(u.name) + " · " + (u.role === "staff" ? "Staff" : "Kitchen") + '</span><button class="btn sm" data-act="role" data-v="customer">← Website</button>';
      top += '<button class="btn sm solid-dark" data-act="logout">Sign out</button>';
    } else top += '<button class="btn sm primary" data-act="login" data-v="staff">Staff login</button><button class="btn sm solid-dark" data-act="login" data-v="chef">Kitchen login</button>';
    $("#topActions").innerHTML = top;
    var t, cur;
    if (state.role === "chef") { t = [["kitchen", "Kitchen", "flame"]]; if (can("stock")) t.push(["stock", "Stock", "box"]); cur = state.chefView; }
    else if (cust) { t = NAV; cur = state.view; }
    else { var pend = orders.filter(function (o) { return o.status === "Pending"; }).length; t = [["orders", "Order board" + (pend ? '<span class="badge">' + pend + "</span>" : ""), "clip"], ["items", "Menu items", "menu"], ["records", "Records", "db"], ["sales", "Sales", "chart"], ["team", "Team", "team"]]; cur = state.staffView; }
    $("#tabs").innerHTML = t.map(function (x) { return '<button data-act="tab" data-v="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : "") + '><span class="i">' + ic(x[2]) + "</span>" + x[1] + "</button>"; }).join("");
  }

  /* ---------- customer: menu ---------- */
  function itemCard(m) {
    var qty = state.cart[m.id] || 0;
    var ctl = !m.avail ? '<span class="pill Unavailable">Sold out</span>' :
      qty ? '<span class="step"><button data-act="dec" data-id="' + m.id + '" aria-label="Remove one ' + esc(m.name) + '">−</button><span>' + qty + '</span><button data-act="inc" data-id="' + m.id + '" aria-label="Add one ' + esc(m.name) + '">+</button></span>' :
      '<button class="btn sm primary" data-act="inc" data-id="' + m.id + '">Add</button>';
    return '<article class="item' + (m.avail ? "" : " off") + '">' + tagHtml(m) + heart(m) + imgBox(imgOf(m), m.name) + '<div><div class="cat">' + esc(m.cat) + "</div><h3>" + esc(m.name) + "</h3><p>" + esc(m.desc) + '</p></div><div class="item-foot">' + priceHtml(m) + ctl + "</div></article>";
  }
  function listGrid(list, msg) { return list.length ? '<div class="grid">' + list.map(itemCard).join("") + "</div>" : '<div class="empty">' + (msg || "No items match. Try another category or search.") + "</div>"; }
  function menuGrid() {
    var q = state.q.toLowerCase();
    return listGrid(menu.filter(function (m) { return (state.cat === "All" || m.cat === state.cat) && (!state.cuisine || m.cuisine === state.cuisine) && (!q || (m.name + " " + (m.desc || "") + " " + m.cat + " " + (m.cuisine || "")).toLowerCase().indexOf(q) > -1); }));
  }
  function miniCart() {
    var keys = Object.keys(state.cart);
    if (!keys.length) return '<div class="panel"><h3>Your order</h3><div class="empty">Your cart is empty. Add something from the menu.</div></div>';
    return '<div class="panel"><h3>Your order</h3>' + keys.map(function (k) { var m = byId(menu, +k); return '<div class="line"><span>' + state.cart[k] + " × " + esc(m.name) + '</span><span class="num">' + ugx(state.cart[k] * priceOf(m)) + "</span></div>"; }).join("") +
      '<div class="total"><span>Total</span><span class="num">' + ugx(cartTotal()) + '</span></div><button class="btn primary" style="width:100%;margin-top:12px" data-act="tab" data-v="cart">Review and pay</button></div>';
  }
  function viewMenu() {
    return '<div class="page-head"><div><h2>Today\'s menu</h2><p class="sub">Prices and availability are updated by staff in real time.</p></div>' +
      '</div>' +
      (state.cuisine ? '<p class="hint">Showing ' + esc(state.cuisine) + ' dishes. <button class="link" data-act="clearcuisine">Show all</button></p>' : "") + '<div class="chips" style="margin-bottom:14px">' + cats.map(function (c) { return '<button class="chip" data-act="cat" data-v="' + c + '" aria-pressed="' + (state.cat === c) + '">' + c + "</button>"; }).join("") + "</div>" +
      '<div class="split"><div id="menuGrid">' + menuGrid() + "</div><div id=\"miniCart\">" + miniCart() + "</div></div>";
  }

  /* ---------- customer: cart + checkout ---------- */
  function viewCart() {
    var keys = Object.keys(state.cart);
    if (!keys.length) return '<div class="page-head"><h2>Cart</h2></div><div class="panel empty">Nothing here yet.<br><br><button class="btn primary" data-act="tab" data-v="menu">Browse the menu</button></div>';
    var u = user();
    var lines = keys.map(function (k) {
      var m = byId(menu, +k);
      return '<div class="line"><div><b>' + esc(m.name) + '</b><div class="hint">' + ugx(priceOf(m)) + ' each</div></div><div style="display:flex;gap:12px;align-items:center"><span class="step"><button data-act="dec" data-id="' + m.id + '" aria-label="Remove one">−</button><span>' + state.cart[k] + '</span><button data-act="inc" data-id="' + m.id + '" aria-label="Add one">+</button></span><span class="num" style="min-width:90px;text-align:right">' + ugx(state.cart[k] * priceOf(m)) + "</span></div></div>";
    }).join("");
    var pm = [["mtn", "MTN Mobile Money"], ["airtel", "Airtel Money"], ["card", "Credit or debit card"]];
    var phoneField = state.method === "card" ? '<p class="hint">Card details are entered on the payment provider\'s page in the real system.</p>' :
      '<label class="f">Mobile money number<input class="in mono" id="phone" inputmode="tel" value="' + esc(state.phone) + '" placeholder="07XXXXXXXX"></label>';
    return '<div class="page-head"><div><h2>Cart and checkout</h2><p class="sub">Choose pickup at the café counter, or delivery to your door.</p></div></div><div class="split"><div class="stack">' +
      '<div class="panel"><h3>Items</h3>' + lines + totals() + promoBox() + "</div>" +
      fulfilPanel() + '<div class="panel"><h3>Schedule</h3><div class="two"><label class="f">' + (state.fulfil === "delivery" ? "Delivery" : "Pickup") + ' time<select class="in" id="slot">' + slots.map(function (s) { return '<option value="' + s + '"' + (state.slot === s ? " selected" : "") + ">" + (s === "ASAP" ? "As soon as possible" : "Today at " + s) + "</option>"; }).join("") + '</select></label>' +
      '<label class="f">Note to the kitchen<input class="in" id="note" value="' + esc(state.note) + '" placeholder="e.g. no onions"></label></div></div></div>' +
      '<div class="panel stack"><h3>Payment</h3>' + pm.map(function (p) { return '<label class="radio"><input type="radio" name="pm" value="' + p[0] + '"' + (state.method === p[0] ? " checked" : "") + "> " + p[1] + "</label>"; }).join("") + phoneField +
      (u ? '<p class="hint">Ordering as <b>' + esc(u.name) + "</b> (" + esc(u.email) + ")</p>" : '<p class="err">Sign in or register to place an order.</p>') +
      (state.checkErr ? '<p class="err">' + state.checkErr + "</p>" : "") +
      '<button class="btn primary" data-act="place">' + (u ? "Pay " + ugx(grand()) : "Sign in to continue") + "</button></div></div>";
  }
  function tracker(o) {
    if (o.status === "Cancelled") return '<div class="track"><div style="border-top-color:var(--bad);color:var(--bad)">Cancelled</div></div>';
    var idx = fl(o).indexOf(o.status), names = isDel(o) ? ["Received", "Preparing", "Ready", "On the way", "Delivered"] : ["Received", "Preparing", "Ready", "Collected"];
    return '<div class="track">' + names.map(function (n, i) { return '<div class="' + (i <= idx ? "done" : "") + '">' + n + "</div>"; }).join("") + "</div>";
  }
  function viewConfirm() {
    var o = state.lastOrder;
    if (!o) return '<div class="panel empty">No recent order to show.<br><br><button class="btn primary" data-act="tab" data-v="orders">View my orders</button></div>';
    return '<div class="panel stack" style="max-width:560px;margin:0 auto"><h2>Order placed</h2><p class="sub">Your confirmation number is <b class="mono">#' + o.id + "</b>. Payment of " + ugx(o.total) + " was received.</p>" + tracker(o) +
      '<div><b>' + (isDel(o) ? "Delivery to " + esc(o.addr) + ", " + esc(o.area) + "." : "Pickup:") + '</b> ' + (o.slot === "ASAP" ? "As soon as possible" : "Today at " + o.slot) + "</div><ul style=\"margin:0;padding-left:18px\">" + itemsText(o).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul><div class="actions"><button class="btn primary" data-act="tab" data-v="orders">Track my order</button><button class="btn" data-act="tab" data-v="menu">Order more</button></div></div>';
  }

  /* ---------- customer: orders + account ---------- */
  function viewOrders() {
    var u = user();
    if (!u) return '<div class="panel empty">Sign in to see your orders.<br><br><button class="btn primary" data-act="tab" data-v="account">Sign in</button></div>';
    var mine = orders.filter(function (o) { return o.cid === u.id; }).sort(function (a, b) { return b.id - a.id; });
    if (!mine.length) return '<div class="page-head"><h2>My orders</h2></div><div class="panel empty">No orders yet.</div>';
    return '<div class="page-head"><div><h2>My orders</h2><p class="sub">Status updates as the kitchen works on your order.</p></div></div><div class="stack">' + mine.map(function (o) {
      var p = payOf(o.id);
      return '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><b class="mono">#' + o.id + "</b><span>" + pill(o.status) + (p ? " " + pill(p.status) : "") + "</span></div>" + tracker(o) +
        '<div class="hint">' + o.date + (isDel(o) ? " · delivery to " + esc(o.area) + " · " : " · pickup ") + (o.slot === "ASAP" ? "as soon as possible" : o.slot) + '</div><ul style="margin:6px 0;padding-left:18px">' + itemsText(o).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul><div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap"><b class="num">' + ugx(o.total) + "</b>" +
        (o.status === "Pending" ? '<button class="btn danger sm" data-act="cancel" data-id="' + o.id + '">Cancel and request refund</button>' : "") + "</div>" +
        (p && p.status === "Refund pending" ? '<p class="hint">Refund of ' + ugx(p.amount) + " to your " + p.method.toLowerCase() + " is being processed by staff.</p>" : "") + "</div>";
    }).join("") + "</div>";
  }
  function viewAccount() {
    var u = user();
    if (u) return '<div class="page-head"><h2>Account</h2></div><div class="panel stack" style="max-width:480px"><div><b>' + esc(u.name) + '</b><div class="hint">' + esc(u.email) + " · " + esc(u.phone) + " · " + esc(u.address) + '</div></div><button class="btn" data-act="signout">Sign out</button></div>';
    var reg = state.authTab === "reg";
    return '<div class="page-head"><h2>' + (reg ? "Create an account" : "Sign in") + '</h2></div><form class="panel stack" style="max-width:480px" id="authForm"><div class="seg" style="justify-self:start"><button type="button" data-act="authtab" data-v="in" aria-pressed="' + !reg + '">Sign in</button><button type="button" data-act="authtab" data-v="reg" aria-pressed="' + reg + '">Register</button></div>' +
      (reg ? '<label class="f">Full name<input class="in" id="rName" required></label><div class="two"><label class="f">Phone<input class="in" id="rPhone" inputmode="tel" required></label><label class="f">Delivery area<input class="in" id="rAddr" placeholder="e.g. Nakawa"></label></div>' : "") +
      '<label class="f">Email<input class="in" id="aEmail" type="email" required value="' + esc(state.aEmail || (reg ? "" : "diane01@gmail.com")) + '"></label><label class="f">Password<input class="in" id="aPass" type="password" required value="' + (reg ? "" : "demo1234") + '"></label>' +
      (state.authErr ? '<p class="err">' + state.authErr + "</p>" : "") + '<button class="btn primary" type="submit">' + (reg ? "Register" : "Sign in") + "</button>" + (reg ? "" : '<p class="hint">Demo accounts: diane01@gmail.com or james02@gmail.com, password demo1234.</p>') + "</form>";
  }

  /* ---------- staff ---------- */
  function ticket(o) {
    var c = byId(customers, o.cid), p = payOf(o.id), acts = "";
    if (o.status === "Pending" || o.status === "Preparing" || o.status === "Ready" || o.status === "Out for delivery") acts += '<button class="btn primary sm" data-act="advance" data-id="' + o.id + '">' + nextLabel(o) + "</button>";
    if (o.status === "Pending") acts += '<button class="btn danger sm" data-act="staffcancel" data-id="' + o.id + '">Cancel</button>';
    if (p && p.status === "Refund pending") acts += '<button class="btn sm" data-act="refund" data-id="' + o.id + '">Process refund</button>';
    return '<div class="ticket"><div class="row"><b class="mono">#' + o.id + "</b><span>" + (p ? pill(p.status) : "") + '</span></div><div>' + esc(c ? c.name : "Guest") + ' · <span class="hint">' + (isDel(o) ? "delivery " : "pickup ") + (o.slot === "ASAP" ? "ASAP" : o.slot) + "</span></div>" + delInfo(o) + "<ul>" + itemsText(o).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" + (o.note ? '<div class="hint">Note: ' + esc(o.note) + "</div>" : "") + '<div class="row"><b class="num">' + ugx(o.total) + '</b></div><div class="actions">' + acts + "</div></div>";
  }
  function viewStaffOrders() {
    var cols = [["Pending", ["Pending"]], ["Preparing", ["Preparing"]], ["Ready", ["Ready"]], ["Out for delivery", ["Out for delivery"]], ["Done", ["Completed", "Cancelled"]]];
    return '<div class="page-head"><div><h2>Order board</h2><p class="sub">New orders from customers appear here instantly. Place one from the Customer view to try it.</p></div></div><div class="board">' + cols.map(function (c) {
      var list = orders.filter(function (o) { return c[1].indexOf(o.status) > -1; }).sort(function (a, b) { return b.id - a.id; });
      return '<section class="col"><h3><span>' + c[0] + '</span><span class="mono">' + list.length + "</span></h3>" + (list.map(ticket).join("") || '<div class="hint" style="padding:6px">Nothing here</div>') + "</section>";
    }).join("") + "</div>";
  }
  function viewStaffItems() {
    return '<div class="page-head"><div><h2>Menu items</h2><p class="sub">Changes show on the customer menu straight away.</p></div></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Item</th><th>Category</th><th>Price (UGX)</th><th>Offer %</th><th>Availability</th></tr></thead><tbody>' + menu.map(function (m) {
        return '<tr><td class="mono">' + m.id + "</td><td>" + esc(m.name) + "</td><td>" + esc(m.cat) + '</td><td><input class="in mono" style="width:110px;padding:4px 8px" type="number" min="0" step="500" data-price="' + m.id + '" value="' + m.price + '" aria-label="Price of ' + esc(m.name) + '"></td><td><input class="in mono" style="width:70px;padding:4px 8px" type="number" min="0" max="90" data-off="' + m.id + '" value="' + (m.off || 0) + '" aria-label="Offer percent for ' + esc(m.name) + '"></td><td><button class="btn sm" data-act="toggle" data-id="' + m.id + '">' + (m.avail ? "Available · mark sold out" : "Sold out · mark available") + "</button></td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<form class="panel" id="addItem" style="margin-top:16px"><h3>Add a menu item</h3><div class="two" style="margin-bottom:10px"><label class="f">Name<input class="in" id="nName" required></label><label class="f">Category<select class="in" id="nCat">' + cats.slice(1).map(function (c) { return "<option>" + c + "</option>"; }).join("") + '</select></label></div><div class="two" style="margin-bottom:10px"><label class="f">Price (UGX)<input class="in" id="nPrice" type="number" min="0" step="500" required></label><label class="f">Short description<input class="in" id="nDesc"></label></div><button class="btn primary" type="submit">Add to menu</button></form>';
  }
  function table(title, head, rows) {
    return '<div class="tbl-title">' + title + '</div><div class="tbl-wrap"><table><thead><tr>' + head.map(function (h) { return "<th>" + h + "</th>"; }).join("") + "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  function viewRecords() {
    return '<div class="page-head"><div><h2>Records</h2><p class="sub">The four database tables from the system design, filled by what happens in this prototype.</p></div></div>' +
      table("Customers", ["Customer ID", "Name", "Email", "Phone", "Address"], customers.map(function (c) { return ['<span class="mono">' + c.id + "</span>", esc(c.name), esc(c.email), esc(c.phone), esc(c.address)]; })) +
      table("Menu item", ["Item ID", "Item name", "Category", "Price", "Availability"], menu.map(function (m) { return ['<span class="mono">' + m.id + "</span>", esc(m.name), esc(m.cat), m.price.toLocaleString("en-US"), m.avail ? "Yes" : "No"]; })) +
      table("Order", ["Order ID", "Customer ID", "Order date", "Type", "Delivery area", "Delivery fee", "Status", "Total amount"], orders.map(function (o) { return ['<span class="mono">' + o.id + "</span>", o.cid, o.date, isDel(o) ? "Delivery" : "Pickup", isDel(o) ? esc(o.area) : "-", (o.fee || 0).toLocaleString("en-US"), pill(o.status), o.total.toLocaleString("en-US")]; })) +
      table("Payments", ["Payment ID", "Order ID", "Payment method", "Amount", "Payment date", "Status"], payments.map(function (p) { return ['<span class="mono">' + p.id + "</span>", p.oid, p.method, p.amount.toLocaleString("en-US"), p.date, pill(p.status)]; })) + recordsExtra();
  }
  function viewSales() {
    var paid = payments.filter(function (p) { return p.status === "Paid"; });
    var rev = paid.reduce(function (a, p) { return a + p.amount; }, 0);
    var refunds = payments.filter(function (p) { return p.status === "Refund pending" || p.status === "Refunded"; }).reduce(function (a, p) { return a + p.amount; }, 0);
    var live = orders.filter(function (o) { return o.status !== "Completed" && o.status !== "Cancelled"; }).length;
    var counts = {};
    orders.forEach(function (o) { if (o.status === "Cancelled") return; o.items.forEach(function (i) { var n = byId(menu, i.id).name; counts[n] = (counts[n] || 0) + i.qty; }); });
    var top = Object.keys(counts).map(function (k) { return [k, counts[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 6);
    var max = top.length ? top[0][1] : 1;
    return '<div class="page-head"><div><h2>Sales overview</h2><p class="sub">All orders placed in this browser</p></div></div>' +
      '<div class="stats"><div class="stat"><b>' + ugx(rev) + "</b><span>Payments received</span></div><div class=\"stat\"><b>" + orders.length + '</b><span>Orders placed</span></div><div class="stat"><b>' + live + '</b><span>Orders in progress</span></div><div class="stat"><b>' + orders.filter(isDel).length + '</b><span>Delivery orders</span></div><div class="stat"><b>' + ugx(refunds) + "</b><span>Refunds requested or paid</span></div></div>" +
      '<div class="panel"><h3>Most ordered items</h3>' + (top.map(function (t) { return '<div class="bar"><span>' + esc(t[0]) + '</span><i style="width:' + Math.round(t[1] / max * 100) + '%"></i><em>' + t[1] + "</em></div>"; }).join("") || '<div class="hint">No orders yet.</div>') + "</div>";
  }

  /* ---------- chef ---------- */
  function slotKey(o) { return o.slot === "ASAP" ? "00:00" : o.slot; }
  function byPickup(a, b) { return slotKey(a) < slotKey(b) ? -1 : slotKey(a) > slotKey(b) ? 1 : a.id - b.id; }
  function kitchenCard(o) {
    var start = o.status === "Pending";
    return '<div class="kt"><div class="row"><b class="mono">#' + o.id + '</b><span class="when">' + (isDel(o) ? "Delivery · " : "Pickup · ") + (o.slot === "ASAP" ? "ASAP" : o.slot) + '</span></div><ul>' +
      o.items.map(function (i) { return '<li><b>' + i.qty + ' ×</b> ' + esc(byId(menu, i.id).name) + '</li>'; }).join("") + '</ul>' +
      (o.note ? '<div class="knote">Note: ' + esc(o.note) + '</div>' : "") +
      (can("cook") ? '<button class="btn primary" data-act="advance" data-id="' + o.id + '">' + (start ? "Start cooking" : "Mark ready") + '</button>' : '<div class="hint">View only. Ask staff for cooking rights.</div>') + "</div>";
  }
  function viewChef() {
    var todo = orders.filter(function (o) { return o.status === "Pending"; }).sort(byPickup);
    var cooking = orders.filter(function (o) { return o.status === "Preparing"; }).sort(byPickup);
    var ready = orders.filter(function (o) { return o.status === "Ready"; }).length;
    return '<div class="page-head"><div><h2>Kitchen</h2><p class="sub">Cook in the order shown. ' + ready + ' ready for pickup. New orders appear here when customers pay.</p></div></div>' +
      '<div class="board"><section class="col"><h3><span>To cook</span><span class="mono">' + todo.length + '</span></h3>' + (todo.map(kitchenCard).join("") || '<div class="hint" style="padding:6px">No new orders</div>') + '</section>' +
      '<section class="col"><h3><span>Cooking now</span><span class="mono">' + cooking.length + '</span></h3>' + (cooking.map(kitchenCard).join("") || '<div class="hint" style="padding:6px">Nothing on the stove</div>') + '</section></div>';
  }

  /* ---------- render ---------- */
  // Every customer view render() can draw; also used by hash routing to validate a #view in the URL.
  var VIEW_MAP = { home: function () { return ""; }, menu: viewMenu, categories: viewCategories, offers: viewOffers, favs: viewFavs, reservations: viewReserve, reviews: viewReviews, support: viewSupport, cart: viewCart, orders: viewOrders, account: viewAccount, confirm: viewConfirm, login: viewLogin };
  // Customer content views (login is a staff form, so it is deliberately not in this list).
  var CUSTOMER_VIEWS = ["home", "menu", "categories", "offers", "favs", "reservations", "reviews", "support", "cart", "orders", "account", "confirm"];
  var overlayFocus = null;
  function render() {
    var u = me(); if (state.role !== "customer" && (!u || !u.active || u.role !== state.role)) { state.role = "customer"; setSession(null); }
    renderChrome();
    var v;
    if (state.role === "chef") v = (state.chefView === "stock" && can("stock") ? viewChefStock : viewChef)();
    else if (state.role === "customer") v = (VIEW_MAP[state.view] || viewMenu)();
    else v = ({ orders: viewStaffOrders, items: viewStaffItems, records: viewRecords, sales: viewSales, team: viewTeam }[state.staffView] || viewStaffOrders)();
    var prevFocus = document.activeElement;
    $("#app").innerHTML = v; $("#app").hidden = state.role === "customer" && state.view === "home";
    $("#popular").innerHTML = popularHtml();
    [].forEach.call(document.querySelectorAll("[data-count]"), function (el) { var n = menu.filter(function (m) { return m.cuisine === el.dataset.count; }).length; el.textContent = n + (n === 1 ? " dish" : " dishes"); });
    // Hash routing: keep the URL in step with the customer view. Setting the same hash is a no-op,
    // so this never loops with the hashchange listener below.
    if (state.role === "customer" && location.hash !== "#" + state.view) location.hash = state.view;
    var L = $("#layer"), wasOpen = !!L.querySelector(".overlay");
    L.innerHTML = state.processing ? '<div class="overlay" role="alertdialog" aria-modal="true" aria-label="Waiting for payment" tabindex="-1"><div class="modal" style="text-align:center"><div class="spin"></div><h3>Waiting for payment approval</h3><p class="hint">' + (state.method === "card" ? "Contacting your card issuer…" : "Approve the prompt on " + esc(state.phone) + " to pay " + ugx(grand()) + ".") + "</p></div></div>" : "";
    var ov = L.querySelector(".overlay");
    if (ov) { if (!wasOpen) overlayFocus = prevFocus; ov.focus(); }
    else if (wasOpen && overlayFocus) { try { if (overlayFocus.isConnected) overlayFocus.focus(); } catch (e) {} overlayFocus = null; }
  }
  function refreshMenuParts() { var g = $("#menuGrid"); if (g) { g.innerHTML = menuGrid(); $("#miniCart").innerHTML = miniCart(); } $("#popular").innerHTML = popularHtml(); renderChrome(); }

  /* ---------- actions ---------- */
  function setCart(id, d) {
    var m = byId(menu, id); if (!m || !m.avail) return;
    var n = (state.cart[id] || 0) + d;
    if (n <= 0) delete state.cart[id]; else state.cart[id] = n;
    saveState();
    if (state.view === "cart" || state.view === "favs" || state.view === "offers") render(); else refreshMenuParts();
  }
  function placeOrder() {
    var u = user();
    if (!u) { state.view = "account"; state.authTab = "in"; render(); return; }
    if (state.method !== "card" && !/^0\d{9}$/.test(state.phone.replace(/\s/g, ""))) { state.checkErr = "Enter a 10-digit mobile money number starting with 0."; render(); return; }
    if (state.fulfil === "delivery" && (!state.dArea || !state.dAddr.trim())) { state.checkErr = "Choose your delivery area and enter your address."; render(); return; }
    state.checkErr = ""; state.processing = true; render();
    setTimeout(function () {
      var items = Object.keys(state.cart).map(function (k) { return { id: +k, qty: state.cart[k] }; });
      var o = { id: nextOrder++, cid: u.id, date: TODAY, slot: state.slot, items: items, status: "Pending", total: grand(), note: state.note, type: state.fulfil, area: state.fulfil === "delivery" ? state.dArea : "", addr: state.fulfil === "delivery" ? state.dAddr.trim() : "", fee: deliveryFee() };
      orders.push(o);
      payments.push({ id: nextPay++, oid: o.id, method: state.method === "card" ? "Credit card" : "Mobile money", amount: o.total, date: TODAY, status: "Paid" });
      state.cart = {}; state.promoOn = false; state.promoMsg = ""; state.note = ""; state.slot = "ASAP"; state.lastOrder = o; state.processing = false; state.view = "confirm"; saveState(); render();
    }, 1800);
  }
  function cancelOrder(id, byStaff) {
    var o = byId(orders, id); if (!o || o.status !== "Pending") return;
    o.status = "Cancelled"; var p = payOf(id); if (p && p.status === "Paid") p.status = "Refund pending";
    saveState();
    toast(byStaff ? "Order cancelled. Refund is waiting to be processed." : "Order cancelled. Your refund request was sent to staff."); render();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var a = b.dataset.act, v = b.dataset.v, id = +b.dataset.id;
    if (a === "login") { state.loginRole = v; state.view = "login"; state.authErr = ""; state.lUser = ""; state.role = "customer"; render(); window.scrollTo(0, 0); }
    else if (a === "logout") { setSession(null); state.role = "customer"; state.view = "home"; render(); }
    else if (a === "fav") { var fi = state.favs.indexOf(id); if (fi > -1) state.favs.splice(fi, 1); else state.favs.push(id); saveState(); render(); }
    else if (a === "cuisine") { state.cuisine = v; state.cat = "All"; state.q = ""; $("#gq").value = ""; state.view = "menu"; render(); window.scrollTo(0, 0); }
    else if (a === "clearcuisine") { state.cuisine = ""; render(); }
    else if (a === "gosearch") { state.view = "menu"; state.cuisine = ""; render(); window.scrollTo(0, 0); }
    else if (a === "slide") { slideIdx = (slideIdx + (+v) + SLIDES.length) % SLIDES.length; heroUpdate(); }
    else if (a === "combo") { if (byId(menu, 118).avail) { setCart(118, 1); state.view = "cart"; render(); window.scrollTo(0, 0); } else toast("The family combo is sold out today."); }
    else if (a === "soon") toast("Coming soon.");
    else if (a === "promo") { var code = ($("#promo").value || "").trim().toUpperCase(); state.promoCode = code; var pu = user(); if (code !== "TASTY30") state.promoMsg = "That code is not valid."; else if (!pu) state.promoMsg = "Sign in first, then apply the code."; else if (orders.some(function (o) { return o.cid === pu.id && o.status !== "Cancelled"; })) state.promoMsg = "TASTY30 is for first orders only."; else { state.promoOn = true; state.promoMsg = ""; } render(); }
    else if (a === "promooff") { state.promoOn = false; render(); }
    else if (a === "kactive") { var ku = byId(staffUsers, id); ku.active = !ku.active; saveUsers(); state.authErr = ""; toast(ku.name + (ku.active ? " can log in again." : " can no longer log in.")); render(); }
    else if (a === "kreset") { var rp = window.prompt("New password for " + byId(staffUsers, id).name + " (6+ characters):"); state.authErr = ""; if (rp && rp.length >= 6) { var ru = byId(staffUsers, id); ru.hash = hpw(ru.username, rp); saveUsers(); toast("Password reset."); } else if (rp) toast("Password must be 6+ characters."); render(); }
    else if (a === "kdel") { var du = byId(staffUsers, id); if (window.confirm("Delete the account for " + du.name + "?")) { staffUsers = staffUsers.filter(function (x) { return x.id !== id; }); saveUsers(); render(); } }
    else if (a === "rconfirm") { reservations.filter(function (r) { return r.id === id; })[0].status = "Confirmed"; saveState(); render(); }
    else if (a === "role") { state.role = v; if (v === "customer" && CUSTOMER_VIEWS.indexOf(state.view) === -1) state.view = "menu"; render(); }
    else if (a === "tab") { if (v === "menu") { state.cuisine = ""; state.q = ""; $("#gq").value = ""; } if (state.role === "customer") state.view = v; else if (state.role === "chef") state.chefView = v; else state.staffView = v; state.checkErr = ""; render(); window.scrollTo(0, 0); }
    else if (a === "cat") { state.cat = v; state.cuisine = ""; if (b.dataset.go) state.view = b.dataset.go; render(); window.scrollTo(0, 0); }
    else if (a === "inc") setCart(id, 1);
    else if (a === "dec") setCart(id, -1);
    else if (a === "place") placeOrder();
    else if (a === "cancel") cancelOrder(id, false);
    else if (a === "staffcancel") cancelOrder(id, true);
    else if (a === "advance") { if (!can("cook")) { toast("Your account cannot update orders."); return; } var o = byId(orders, id); o.status = fl(o)[fl(o).indexOf(o.status) + 1]; saveState(); render(); }
    else if (a === "refund") { payOf(id).status = "Refunded"; saveState(); toast("Refund marked as sent."); render(); }
    else if (a === "toggle") { if (!can("stock")) { toast("Your account cannot change stock."); return; } var m = byId(menu, id); m.avail = !m.avail; if (!m.avail) delete state.cart[id]; saveState(); render(); }
    else if (a === "signout") { state.user = null; render(); }
    else if (a === "authtab") { state.authTab = v; state.authErr = ""; render(); }
  });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "gq") { state.q = t.value; state.cuisine = ""; if (state.view !== "menu") { state.view = "menu"; render(); } else { var gg = $("#menuGrid"); if (gg) gg.innerHTML = menuGrid(); } }
    else if (t.id === "phone") state.phone = t.value;
    else if (t.id === "promo") state.promoCode = t.value;
    else if (t.id === "dAddr") state.dAddr = t.value;
    else if (t.id === "note") state.note = t.value;
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "slot") state.slot = t.value;
    else if (t.name === "pm") { state.method = t.value; render(); }
    else if (t.name === "fm") { state.fulfil = t.value; render(); }
    else if (t.id === "dArea") { state.dArea = t.value; render(); }
    else if (t.dataset && t.dataset.off) { var mo = byId(menu, +t.dataset.off); mo.off = Math.min(90, Math.max(0, parseInt(t.value, 10) || 0)); toast(mo.name + (mo.off ? " now " + mo.off + "% off." : " offer removed.")); render(); }
    else if (t.dataset && t.dataset.kr) { var kk = byId(staffUsers, +t.dataset.id); kk.rights = kk.rights || {}; kk.rights[t.dataset.kr] = t.checked; saveUsers(); toast("Rights updated for " + kk.name + "."); }
    else if (t.dataset && t.dataset.price) { var m = byId(menu, +t.dataset.price), n = Math.max(0, parseInt(t.value, 10) || 0); m.price = n; toast(m.name + " is now " + ugx(n)); render(); }
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "loginForm") {
      var un = $("#lUser").value.trim().toLowerCase(), pw = $("#lPass").value; state.lUser = un;
      var lu = staffUsers.filter(function (x) { return x.username.toLowerCase() === un && x.role === state.loginRole; })[0];
      if (!lu || lu.hash !== hpw(lu.username, pw)) state.authErr = "Wrong username or password.";
      else if (!lu.active) state.authErr = "This account has been disabled. Ask a staff member.";
      else { setSession(lu); state.role = lu.role; state.staffView = "orders"; state.chefView = "kitchen"; state.authErr = ""; }
      render(); window.scrollTo(0, 0);
    } else if (e.target.id === "addKitchen") {
      var nu = $("#kUser").value.trim().toLowerCase();
      if (staffUsers.some(function (x) { return x.username.toLowerCase() === nu; })) { state.authErr = "That username is taken."; render(); return; }
      staffUsers.push({ id: nextUid++, role: "chef", name: $("#kName").value.trim(), username: nu, hash: hpw(nu, $("#kPass").value), active: true, rights: { cook: $("#kCook").checked, stock: $("#kStock").checked } });
      saveUsers(); state.authErr = ""; toast("Kitchen account created."); render();
    } else if (e.target.id === "pwForm") {
      var su = me(); state.authErr = "";
      if (!su) { toast("Your session ended. Please sign in again."); render(); return; }
      su.hash = hpw(su.username, $("#myPass").value); saveUsers(); toast("Your password was updated."); render();
    } else if (e.target.id === "resForm") {
      reservations.push({ id: nextRes++, name: $("#rsName").value.trim(), phone: $("#rsPhone").value.trim(), date: $("#rsDate").value, time: $("#rsTime").value, guests: $("#rsGuests").value, status: "Requested" });
      saveState(); toast("Table request sent. Staff will confirm."); render();
    } else if (e.target.id === "revForm") {
      reviews.push({ name: user().name, stars: +$("#rvStars").value, text: $("#rvText").value.trim(), date: TODAY }); saveState(); toast("Thanks for your review."); render();
    } else if (e.target.id === "newsForm") {
      var ne = $("#newsEmail").value.trim().toLowerCase();
      if (subscribers.some(function (x) { return String(x).toLowerCase() === ne; })) { toast("That email is already subscribed."); return; }
      subscribers.push(ne); e.target.reset(); saveState(); toast("Thanks for subscribing."); render();
    } else if (e.target.id === "authForm") {
      var email = $("#aEmail").value.trim().toLowerCase();
      state.aEmail = email;
      var found = customers.filter(function (c) { return c.email === email; })[0];
      if (state.authTab === "reg") {
        if (found) { state.authErr = "That email already has an account. Sign in instead."; render(); return; }
        var c = { id: nextCust++, name: $("#rName").value.trim(), email: email, phone: $("#rPhone").value.trim(), address: $("#rAddr").value.trim() || "Not given", pw: hpw(email, $("#aPass").value) };
        customers.push(c); state.user = c.id; state.phone = c.phone; state.authErr = ""; state.view = cartCount() ? "cart" : "menu"; saveState(); toast("Welcome, " + c.name + "."); render();
      } else {
        if (!found) { state.authErr = "No account with that email. Register to create one."; render(); return; }
        if (!found.pw) found.pw = hpw(found.email, $("#aPass").value); // migrate accounts saved before passwords existed
        if (found.pw !== hpw(found.email, $("#aPass").value)) { state.authErr = "Incorrect password."; render(); return; }
        state.user = found.id; state.phone = found.phone; state.authErr = ""; state.view = cartCount() ? "cart" : "menu"; render();
      }
    } else if (e.target.id === "addItem") {
      menu.push({ id: nextItem++, name: $("#nName").value.trim(), cat: $("#nCat").value, price: Math.max(0, parseInt($("#nPrice").value, 10) || 0), avail: true, desc: $("#nDesc").value.trim() || "Added by staff" });
      toast("Item added to the menu."); render();
    }
  });

  [].forEach.call(document.querySelectorAll("#homeView .media[data-ph], .side-promo .media[data-ph]"), function (m) { var i = m.querySelector("img"); if (i) i.src = m.dataset.ph; });
  loadState();
  // Hash routing: start on the view named by the URL when it is one we know; otherwise normalise the URL.
  var hv = (location.hash || "").replace(/^#/, "");
  if (VIEW_MAP[hv]) state.view = hv;
  try { history.replaceState(null, "", "#" + state.view); } catch (e) {}
  window.addEventListener("hashchange", function () {
    var v = (location.hash || "").replace(/^#/, "");
    if (state.role === "customer" && VIEW_MAP[v] && v !== state.view) { state.view = v; state.checkErr = ""; render(); }
  });
  heroUpdate();
  render();
})();
