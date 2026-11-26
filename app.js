(function () {
  var TODAY = new Date().toISOString().slice(0, 10);
  var state = {
    role: "customer", view: "home", cat: "All", q: "", cuisine: "", favs: [], promoOn: false, promoMsg: "", loginRole: "staff", chefView: "kitchen",
    user: null, authTab: "in", authErr: "",
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
    { id: 1, name: "Diane", email: "diane01@gmail.com", phone: "0775873839", address: "Seeta" },
    { id: 2, name: "James", email: "james02@gmail.com", phone: "0701547182", address: "Nalya" }
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
  // Photos are your own files in the images folder (see images/README.txt). Nothing is loaded from the internet.
  var IMG_LINKS = {};
  function imgBox(src, label, cls) { var r = IMG_LINKS[label] || ""; return '<div class="media ' + (cls || "") + '" data-ph="' + esc(src) + '"><img src="' + esc(r || src) + '" data-l="' + (r ? esc(src) : "") + '" alt="' + esc(label) + '" loading="lazy" referrerpolicy="no-referrer" onerror="imgErr(this)"></div>'; }
  function delInfo(o) { if (!isDel(o)) return ""; var c = byId(customers, o.cid); return '<div class="hint">' + esc(o.addr) + ", " + esc(o.area) + (c ? " · " + esc(c.phone) : "") + "</div>"; }
  function nextLabel(o) { var f = fl(o), n = f[f.indexOf(o.status) + 1]; return n === "Out for delivery" ? "Send out for delivery" : n === "Completed" ? (isDel(o) ? "Mark delivered" : "Mark collected") : "Mark " + n.toLowerCase(); }
  function fulfilPanel() {
    var d = state.fulfil === "delivery";
    return '<div class="panel stack"><h3>Pickup or delivery</h3><div class="two">' +
      [["pickup", "Pickup", "Collect at the café counter"], ["delivery", "Delivery", "Brought to your door"]].map(function (x) { return '<label class="radio"><input type="radio" name="fm" value="' + x[0] + '"' + (state.fulfil === x[0] ? " checked" : "") + '> <span><b>' + x[1] + '</b><br><span class="hint">' + x[2] + "</span></span></label>"; }).join("") + "</div>" +
      (d ? '<div class="two"><label class="f">Delivery area<select class="in" id="dArea"><option value="">Choose your area</option>' + ZONES.map(function (z) { return '<option value="' + z[0] + '"' + (state.dArea === z[0] ? " selected" : "") + ">" + z[0] + " (" + ugx(z[1]) + ")</option>"; }).join("") + '</select></label><label class="f">Street, house or landmark<input class="in" id="dAddr" data-f="address" maxlength="80" autocomplete="street-address" value="' + esc(state.dAddr) + '" placeholder="e.g. Plot 12, near the market"></label></div><p class="hint">Free delivery on orders of ' + ugx(FREE_DELIVERY_ABOVE) + " or more.</p>" : "") + "</div>";
  }
  function totals() {
    var f = deliveryFee(), d = state.fulfil === "delivery";
    return '<div class="line"><span>Subtotal</span><span class="num">' + ugx(cartTotal()) + "</span></div>" + (discount() ? '<div class="line"><span>Discount (TASTY30)</span><span class="num">−' + ugx(discount()) + "</span></div>" : "") + (d ? '<div class="line"><span>Delivery fee</span><span class="num">' + (state.dArea ? (f ? ugx(f) : "Free") : "Choose area") + "</span></div>" : "") + '<div class="total"><span>Total</span><span class="num">' + ugx(grand()) + "</span></div>";
  }
  function deliveryPanel() { return '<div class="panel">' + table("Delivery fees", ["Area", "Fee"], ZONES.map(function (z) { return [esc(z[0]), ugx(z[1])]; })) + '<p class="hint" style="margin-top:8px">Free delivery on orders of ' + ugx(FREE_DELIVERY_ABOVE) + " or more. Pickup is always free.</p></div>"; }
  function promoBox() {
    if (state.promoOn && discount() > 0) return '<p class="hint">Code TASTY30 applied. <button class="link" data-act="promooff">Remove</button></p>';
    return '<div style="display:flex;gap:8px;margin-top:10px"><input class="in" id="promo" data-f="promo" maxlength="12" placeholder="Promo code" aria-label="Promo code" style="flex:1"><button class="btn sm" data-act="promo">Apply</button></div>' + (state.promoMsg ? '<p class="err">' + state.promoMsg + "</p>" : "");
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
    $("#heroMedia").innerHTML = imgBox(imgOf(m), m.name, "hero-img");
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
  function payFields() {
    var pm = [["mtn", "MTN Mobile Money"], ["airtel", "Airtel Money"], ["card", "Credit or debit card"]];
    return pm.map(function (p) { return '<label class="radio"><input type="radio" name="pm" value="' + p[0] + '"' + (state.method === p[0] ? " checked" : "") + "> " + p[1] + "</label>"; }).join("") + (state.method === "card" ? '<p class="hint">Card details are entered on the payment provider\'s page in the real system.</p>' : '<label class="f">Mobile money number<input class="in mono" id="phone" data-f="momo" maxlength="10" inputmode="numeric" data-f="momo" maxlength="10" inputmode="numeric" value="' + esc(state.phone) + '" placeholder="07XXXXXXXX"></label>');
  }
  function viewReserve() {
    var u = user(), s = state.res || {};
    if (!u) return head("Reservations", "A table is reserved once you have paid the deposit.") + '<div class="panel">Sign in to reserve a table. <button class="btn sm primary" data-act="tab" data-v="account">Sign in or create an account</button></div>';
    var times = ["12:00", "13:00", "14:00", "15:00", "16:00", "18:00", "19:00"];
    return head("Reservations", "Your table is reserved only after you pay the deposit of " + ugx(RESERVATION_FEE) + ". Staff then confirm it.") + '<form novalidate class="panel stack" style="max-width:520px" id="resForm"><div class="two"><label class="f">Full name<input class="in" id="rsName" data-f="name" maxlength="60" required value="' + esc(s.rsName !== undefined ? s.rsName : u.name) + '"></label><label class="f">Phone<input class="in" id="rsPhone" data-f="phone" maxlength="13" inputmode="tel" required value="' + esc(s.rsPhone !== undefined ? s.rsPhone : u.phone) + '"></label></div><div class="two"><label class="f">Date<input class="in" id="rsDate" type="date" min="' + new Date().toISOString().slice(0, 10) + '" required value="' + esc(s.rsDate || "") + '"></label><label class="f">Time<select class="in" id="rsTime">' + times.map(function (t) { return "<option" + (s.rsTime === t ? " selected" : "") + ">" + t + "</option>"; }).join("") + '</select></label></div><label class="f">Guests<input class="in" id="rsGuests" type="number" min="1" max="12" required value="' + esc(s.rsGuests || "2") + '"></label><h3 style="margin:6px 0 0">Pay the deposit: ' + ugx(RESERVATION_FEE) + "</h3>" + payFields() + '<button class="btn primary" type="submit">Pay deposit and reserve</button></form>' +
      (reservations.length ? '<div style="margin-top:16px">' + table("Your reservations", ["Name", "Date", "Time", "Guests", "Deposit", "Status"], reservations.map(function (r) { return [esc(r.name), r.date, r.time, r.guests, ugx(r.deposit || 0), pill(r.status)]; })) + "</div>" : "");
  }
  function viewReviews() {
    var u = user(), avg = reviews.length ? (reviews.reduce(function (a, r) { return a + r.stars; }, 0) / reviews.length).toFixed(1) : "";
    return head("Reviews", reviews.length ? avg + " out of 5 from " + reviews.length + " review" + (reviews.length > 1 ? "s" : "") : "Tell us how we did.") +
      (u ? '<form novalidate class="panel stack" style="max-width:520px" id="revForm"><label class="f">Rating<select class="in" id="rvStars"><option value="5">5 - Excellent</option><option value="4">4 - Good</option><option value="3">3 - Okay</option><option value="2">2 - Poor</option><option value="1">1 - Bad</option></select></label><label class="f">Your review<input class="in" id="rvText" data-f="text" maxlength="500" required placeholder="What did you order? How was it?"></label><button class="btn primary" type="submit">Post review</button></form>' : '<div class="panel">Sign in to write a review. <button class="btn sm primary" data-act="tab" data-v="account">Sign in</button></div>') +
      '<div class="stack" style="margin-top:14px">' + (reviews.slice().reverse().map(function (r) { return '<div class="panel"><b>' + esc(r.name) + '</b> <span class="star">' + ic("star").repeat(r.stars) + '</span><div class="hint">' + r.date + "</div><p style=\"margin:6px 0 0\">" + esc(r.text) + "</p></div>"; }).join("") || '<div class="empty">No reviews yet. Be the first.</div>') + "</div>";
  }
  function viewSupport() {
    var faq = [["How do I track my order?", "Open Orders in the menu on the left. The tracker updates as the kitchen works on it."], ["How does delivery work?", "Choose Delivery at checkout, pick your area and enter your address. Fees are in the table below."], ["Which payment methods do you accept?", "Mobile money and credit or debit card."], ["How do I reserve a table?", "Open Reservations, choose the date, time and guests, and pay the deposit of " + ugx(RESERVATION_FEE) + ". Your table is reserved once the deposit is paid."], ["Can I cancel an order?", "Yes, while it is still Pending. Open Orders and choose Cancel; a refund request goes to staff."], ["How do I use a promo code?", "Add items, open your cart and enter the code. TASTY30 gives 30% off a first order."]];
    return head("Support", "We are here to help.") + '<div class="panel stack" style="max-width:640px"><div><b>Contact</b><div class="hint">Phone: 07XX XXX XXX · Email: hello@example.com</div></div></div>' +
      '<div class="sec-head"><h2>FAQs</h2></div><div class="stack" style="max-width:640px">' + faq.map(function (f) { return '<details class="panel"><summary><b>' + f[0] + "</b></summary><p class=\"sub\" style=\"margin:8px 0 0\">" + f[1] + "</p></details>"; }).join("") + '</div><div class="sec-head"><h2>Delivery fees</h2></div>' + deliveryPanel();
  }
  /* ---------- input rules: what each text box accepts ---------- */
  var RESERVATION_FEE = 10000; // deposit (UGX) paid when booking a table
  var RULES = {
    name:    { max: 60, filter: /[^\p{L}\s'’.-]/gu, test: /^\p{L}[\p{L}'’.-]+(?:\s+\p{L}[\p{L}'’.-]*)+$/u, msg: "Enter your full name: first and last name, letters only." },
    phone:   { max: 13, filter: /[^\d+]/g, test: /^(0\d{9}|\+256\d{9})$/, msg: "Enter a valid phone number, for example 0772123456 (numbers only)." },
    momo:    { max: 10, filter: /\D/g, test: /^07\d{8}$/, msg: "Mobile money number must be 10 digits starting with 07 (numbers only)." },
    email:   { max: 120, filter: /\s/g, lower: true, test: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, msg: "Enter a valid email address, for example name@example.com." },
    area:    { max: 40, filter: /[^\p{L}\s'’.-]/gu, test: /^\p{L}[\p{L}\s'’.-]{1,39}$/u, msg: "The delivery area can only contain letters." },
    address: { max: 80, filter: /[^\p{L}\p{N}\s,.'’#\/-]/gu, test: /^(?=.*\p{L}).{3,80}$/u, msg: "Enter a proper address, for example Plot 12, Nalya Road." },
    table:   { max: 3, filter: /\D/g, test: /^[1-9]\d{0,2}$/, msg: "Table number must be numbers only, for example 7." },
    user:    { max: 30, filter: /[^a-z0-9._-]/g, lower: true, test: /^[a-z0-9._-]{3,30}$/, msg: "Username: 3 to 30 letters, numbers, dot, dash or underscore." },
    dish:    { max: 60, filter: /[^\p{L}\p{N}\s&'’.,()-]/gu, test: /^\p{L}[\p{L}\p{N}\s&'’.,()-]{1,59}$/u, msg: "The dish name can only contain letters, numbers and common punctuation." },
    price:   { max: 7, filter: /\D/g, test: /^[1-9]\d{2,6}$/, msg: "Price must be a whole number in UGX (numbers only)." },
    promo:   { max: 12, filter: /[^A-Za-z0-9]/g, upper: true, test: /^[A-Z0-9]{3,12}$/, msg: "Promo codes only contain letters and numbers." },
    note:    { max: 150, filter: /[<>{}\[\]\\|^~`]/g, test: /^[\s\S]{0,150}$/ },
    text:    { max: 500, filter: /[<>]/g, test: /^\S[\s\S]{0,499}$/, msg: "Please write something first." },
    pass:    { max: 64, filter: null, test: function (v) { return v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v); }, msg: "Password needs at least 8 characters, with a letter and a number." }
  };
  function ruleTest(k, v) { var r = RULES[k], ok = typeof r.test === "function" ? r.test(v) : r.test.test(v); return ok ? "" : (r.msg || "Please check this field."); }
  function firstErr(list) { for (var i = 0; i < list.length; i++) { var e = ruleTest(list[i][0], list[i][1]); if (e) return e; } return ""; }
  function clean(v) { return String(v).trim().replace(/\s+/g, " "); }
  function applyRule(t) {
    var r = RULES[t.dataset.f]; if (!r) return; var v = t.value;
    if (r.lower) v = v.toLowerCase(); if (r.upper) v = v.toUpperCase(); if (r.filter) v = v.replace(r.filter, "");
    if (v.length > r.max) v = v.slice(0, r.max);
    if (v !== t.value) { var p = Math.max(0, (t.selectionStart || 1) - 1); t.value = v; try { t.setSelectionRange(p, p); } catch (e) {} }
  }
  function formErr(form, msg) {
    var p = form.querySelector("[data-err]");
    if (!msg) { if (p) p.remove(); return; }
    if (!p) { p = document.createElement("p"); p.className = "err"; p.setAttribute("data-err", "1"); p.setAttribute("role", "alert"); var b = form.querySelector("button[type=submit]"); form.insertBefore(p, b); }
    p.textContent = msg;
  }

  /* ---------- staff and kitchen accounts ---------- */
  // FRONT-END DEMO ONLY: accounts live in this browser (localStorage) and passwords are only lightly hashed.
  // A real launch needs a server with proper password hashing and sessions.
  function hpw(u, p) { var s = "cafe:" + u.toLowerCase() + ":" + p, h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (var i = 0; i < s.length; i++) { var c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); }
  var staffUsers = [
    { id: 1, role: "manager", name: "Cafe J Manager", username: "manager", hash: hpw("manager", "manager123"), active: true },
    { id: 2, role: "staff", name: "Front Desk", username: "staff", hash: hpw("staff", "staff123"), active: true },
    { id: 3, role: "chef", name: "Head Chef", username: "chef", hash: hpw("chef", "chef123"), active: true, rights: { cook: true, stock: false } }
  ], nextUid = 4;
  try { var sv = JSON.parse(localStorage.getItem("cafe_users_v2") || "null"); if (sv && sv.users && sv.users.length) { staffUsers = sv.users; nextUid = sv.next; } } catch (e) {}
  function saveUsers() { if (SERVER) return; try { localStorage.setItem("cafe_users_v2", JSON.stringify({ users: staffUsers, next: nextUid })); } catch (e) {} }
  var session = null; try { session = JSON.parse(sessionStorage.getItem("cafe_session") || "null"); } catch (e) {}
  function me() { return session ? byId(staffUsers, session.uid) : null; }
  function setSession(u) { session = u ? { uid: u.id } : null; try { if (u) sessionStorage.setItem("cafe_session", JSON.stringify(session)); else sessionStorage.removeItem("cafe_session"); } catch (e) {} }
  function portalOf(u) { return u.role === "chef" ? "chef" : "staff"; }
  function isMgr() { var u = me(); return !!u && u.active && u.role === "manager"; }
  function myId() { var u = me(); return u ? u.id : 0; }
  function roleLabel(u) { return u.role === "manager" ? "Manager" : u.role === "staff" ? "Staff" : "Chef"; }
  // Manager: everything. Staff: orders (send to kitchen, hand over), reservations, stock. Chef: only what the manager gives (pick/prepare, stock).
  function can(r) { var u = me(); if (!u || !u.active) return false; if (u.role === "manager") return true; if (u.role === "staff") return r === "stock" || r === "orders"; return !!(u.rights && u.rights[r]); }
  (function () { var u = me(); if (u && u.active) state.role = portalOf(u); else setSession(null); })();
  function viewLogin() {
    var k = state.loginRole === "chef";
    return head("Admin login", "For the café staff and kitchen team.") + '<form novalidate class="panel stack" style="max-width:420px" id="loginForm"><label class="f">Username<input class="in" id="lUser" data-f="user" maxlength="30" autocomplete="username" required value="' + esc(state.lUser || "") + '"></label><label class="f">Password<input class="in" id="lPass" type="password" autocomplete="current-password" required></label>' + (state.authErr ? '<p class="err">' + state.authErr + "</p>" : "") + '<button class="btn primary" type="submit">Log in</button>' + (k ? '<p class="hint">Contact admin.</p>' : '<p class="hint">Contact admin.</p>') + "</form>";
  }
  function viewTeam() {
    var list = staffUsers.filter(function (u) { return u.role !== "manager"; });
    var rows = list.map(function (u) {
      var r = u.rights || {};
      return [esc(u.name), '<span class="mono">' + esc(u.username) + "</span>", roleLabel(u), u.active ? '<span class="pill Paid">Active</span>' : '<span class="pill Cancelled">Disabled</span>',
        u.role === "chef" ? '<label class="radio"><input type="checkbox" data-kr="cook" data-id="' + u.id + '"' + (r.cook ? " checked" : "") + '> Pick and prepare orders</label><label class="radio"><input type="checkbox" data-kr="stock" data-id="' + u.id + '"' + (r.stock ? " checked" : "") + '> Manage stock</label>' : '<span class="hint">Send orders to the kitchen, hand over orders, reservations, stock</span>',
        '<button class="btn sm" data-act="kactive" data-id="' + u.id + '">' + (u.active ? "Disable access" : "Enable access") + '</button> <button class="btn sm" data-act="kreset" data-id="' + u.id + '">Reset password</button> <button class="btn danger sm" data-act="kdel" data-id="' + u.id + '">Delete</button>'];
    });
    return head("Team", "As manager you create staff and chef accounts and choose what each person can do.") + table("Staff and chef accounts", ["Name", "Username", "Role", "Access", "Rights", "Actions"], rows) +
      '<form novalidate class="panel" id="addKitchen" style="margin-top:16px"><h3>Create an account</h3><div class="two" style="margin-bottom:10px"><label class="f">Full name<input class="in" id="kName" data-f="name" maxlength="60" required autocomplete="off" placeholder="First and last name"></label><label class="f">Username<input class="in" id="kUser" data-f="user" maxlength="30" required autocomplete="off"></label></div><div class="two" style="margin-bottom:10px"><label class="f">Role<select class="in" id="kRole"><option value="chef">Chef</option><option value="staff">Staff</option></select></label><label class="f">Password (8+ characters, letters and numbers)<input class="in" id="kPass" type="password" data-f="pass" minlength="8" required autocomplete="new-password"></label></div><div class="f">Chef rights<label class="radio"><input type="checkbox" id="kCook" checked> Pick and prepare orders</label><label class="radio"><input type="checkbox" id="kStock"> Manage stock</label></div><button class="btn primary" type="submit" style="margin-top:10px">Create account</button></form>' +
      '<form novalidate class="panel" id="pwForm" style="margin-top:16px;max-width:420px"><h3>Change my password</h3><label class="f">New password (8+ characters, letters and numbers)<input class="in" id="myPass" type="password" data-f="pass" minlength="8" required autocomplete="new-password"></label><button class="btn" type="submit" style="margin-top:10px">Update password</button></form>';
  }
  function viewChefStock() {
    return head("Stock", "Mark dishes sold out or available. Prices are managed by staff.") + '<div class="tbl-wrap"><table><thead><tr><th>Item</th><th>Availability</th></tr></thead><tbody>' + menu.map(function (m) { return "<tr><td>" + esc(m.name) + '</td><td><button class="btn sm" data-act="toggle" data-id="' + m.id + '">' + (m.avail ? "Available · mark sold out" : "Sold out · mark available") + "</button></td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function recordsExtra() { return resTable() + table("Newsletter subscribers", ["Email"], subscribers.map(function (e) { return [esc(e)]; })); }

  /* ---------- live chat: guest <-> kitchen ---------- */
  // CONNECT LIVE CHAT ACROSS DEVICES: create a free Firebase Realtime Database (steps in CHAT-SETUP.txt) and paste its address
  // between the quotes, for example "https://cafej-default-rtdb.firebaseio.com". Left empty = demo mode (this browser only).
  var FIREBASE_URL = "";
  var chatCore = (function () {
    var KEY = "cafe_chats_v1", base = FIREBASE_URL.replace(/\/+$/, "");
    function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
    function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
    function walk(d, p, make) { var parts = p.split("/").filter(Boolean), o = d; for (var i = 0; i < parts.length; i++) { if (o[parts[i]] === undefined || o[parts[i]] === null) { if (!make) return undefined; o[parts[i]] = {}; } o = o[parts[i]]; } return o; }
    if (!base) return {
      live: false,
      read: function (p) { return Promise.resolve(walk(load(), p, false) || null); },
      push: function (p, v) { var d = load(), o = walk(d, p, true); o["m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)] = v; save(d); return Promise.resolve(); },
      patch: function (p, v) { var d = load(), o = walk(d, p, true); for (var k in v) o[k] = v[k]; save(d); return Promise.resolve(); },
      remove: function (p) { var d = load(), parts = p.split("/"), last = parts.pop(), o = walk(d, parts.join("/"), false); if (o) delete o[last]; save(d); return Promise.resolve(); }
    };
    function url(p) { return base + "/" + p + ".json"; }
    return {
      live: true,
      read: function (p) { return fetch(url(p)).then(function (r) { return r.json(); }).catch(function () { return null; }); },
      push: function (p, v) { return fetch(url(p), { method: "POST", body: JSON.stringify(v) }); },
      patch: function (p, v) { return fetch(url(p), { method: "PATCH", body: JSON.stringify(v) }); },
      remove: function (p) { return fetch(url(p), { method: "DELETE" }); }
    };
  })();
  var chatApi = {
    get live() { return SERVER || chatCore.live; },
    read: function (p) { if (!SERVER) return chatCore.read(p); return api(p === "chats" ? "chat_all" : "chat_mine").catch(function () { return null; }); },
    push: function (p, v) { if (!SERVER) return chatCore.push(p, v); return v.from === "guest" ? api("chat_send", { text: v.text }) : api("chat_reply", { id: p.split("/")[1], text: v.text }); },
    patch: function (p, v) { if (!SERVER) return chatCore.patch(p, v); return v.table ? api("chat_join", { table: v.table }) : Promise.resolve(); },
    remove: function (p) { if (!SERVER) return chatCore.remove(p); return api("chat_delete", { id: p.split("/")[1] }); }
  };
  var chatGuest = null, chatSeen = 0, chatData = {}, chatActive = null, chatHtml = "", chatBadgeN = 0;
  var chatUid = null;
  // Each customer account has its own chat. Switching or signing out never shows another person's messages.
  function syncGuest() {
    var u = user(), want = u ? u.id : null; if (chatUid === want) return;
    chatUid = want; chatGuest = null; chatSeen = 0; chatBadgeN = 0; chatHtml = "";
    if (u) { try { chatGuest = JSON.parse(localStorage.getItem("cafe_chat_guest_" + u.id) || "null"); chatSeen = +(localStorage.getItem("cafe_chat_seen_" + u.id) || 0); } catch (e) {} }
  }
  function chatAllowed() { var u = me(); return !!u && u.active && u.role === "manager"; } // only the manager chats with customers
  function chatBadge(k) { return k === "chat" && chatBadgeN > 0 ? '<span class="badge">' + chatBadgeN + "</span>" : ""; }
  function msgsOf(c) { var m = c && c.messages ? c.messages : {}; return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.t - b.t; }); }
  function bubbles(list, mine) {
    return list.length ? list.map(function (m) { return '<div class="msg ' + (m.from === mine ? "mine" : "theirs") + '"><b>' + esc(m.name || (m.from === "guest" ? "Guest" : "Kitchen")) + "</b><span>" + esc(m.text) + "</span><small>" + new Date(m.t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + "</small></div>"; }).join("") : '<div class="empty">No messages yet. Say hello.</div>';
  }
  function paintMsgs(list, mine) {
    var box = $("#chatMsgs"); if (!box) return;
    var h = bubbles(list, mine); if (h === chatHtml && box.dataset.p) return;
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 90, first = !box.dataset.p;
    box.innerHTML = h; chatHtml = h; box.dataset.p = "1"; if (near || first) box.scrollTop = box.scrollHeight;
  }
  function paintKitchen() {
    var L = $("#kList"); if (!L) return;
    var ids = Object.keys(chatData).sort(function (a, b) { return ((chatData[b].meta || {}).updated || 0) - ((chatData[a].meta || {}).updated || 0); });
    L.innerHTML = ids.length ? ids.map(function (id) { var m = chatData[id].meta || {}; return '<button class="kc' + (id === chatActive ? " on" : "") + '" data-act="kopen" data-v="' + id + '"><b>' + esc(m.name || "Guest") + "</b><small>Table " + esc(m.table || "?") + "</small><span>" + esc(m.last || "") + "</span>" + (m.lastFrom === "guest" ? '<i class="dot"></i>' : "") + "</button>"; }).join("") : '<div class="empty">No guest chats yet.</div>';
    var c = chatActive && chatData[chatActive];
    $("#kTitle").innerHTML = c ? "<b>" + esc((c.meta || {}).name || "Guest") + "</b> · Table " + esc((c.meta || {}).table || "?") + ' <button class="link" data-act="kdelchat">Delete chat</button>' : "Select a conversation";
    $("#kForm").hidden = !c;
    if (c) paintMsgs(msgsOf(c), "kitchen"); else { var box = $("#chatMsgs"); if (box) { box.innerHTML = ""; delete box.dataset.p; } }
  }
  function chatTick() {
    syncGuest();
    var cust = state.role === "customer";
    if (cust && chatGuest) {
      chatApi.read("chats/" + chatGuest.id).then(function (c) {
        var list = msgsOf(c);
        if (state.role === "customer" && state.view === "chat") { paintMsgs(list, "guest"); var last = list.length ? list[list.length - 1].t : 0; if (last > chatSeen) { chatSeen = last; try { localStorage.setItem("cafe_chat_seen_" + chatUid, last); } catch (e) {} } }
        var n = list.filter(function (m) { return m.from !== "guest" && m.t > chatSeen; }).length;
        if (n !== chatBadgeN) { chatBadgeN = n; renderChrome(); }
      });
    } else if (!cust && chatAllowed()) {
      chatApi.read("chats").then(function (all) {
        chatData = all || {};
        var n = Object.keys(chatData).filter(function (k) { return chatData[k].meta && chatData[k].meta.lastFrom === "guest"; }).length;
        if ($("#kList")) paintKitchen();
        if (n !== chatBadgeN) { chatBadgeN = n; renderChrome(); }
      });
    }
  }
  setInterval(chatTick, 2500);
  function chatNote() { return chatApi.live ? "" : '<p class="hint">Demo mode: chat only reaches other tabs in this browser until live chat is connected (see FIREBASE_URL in app.js).</p>'; }
  function viewChat() {
    var u = user(); syncGuest();
    if (!u) return head("Chat with us", "Sign in so the chef knows who is talking to them.") + '<div class="panel">Chat is for signed-in guests who are in the restaurant. <button class="btn sm primary" data-act="tab" data-v="account">Sign in or create an account</button></div>';
    if (!chatGuest) return head("Chat with us", "For guests who are in the restaurant right now. Tell us who you are and where you are sitting.") + '<form novalidate class="panel stack" style="max-width:420px" id="chatJoin"><p class="sub" style="margin:0">Chatting as <b>' + esc(u.name) + '</b></p><label class="f">Table number<input class="in" id="cgTable" data-f="table" inputmode="numeric" required maxlength="3" placeholder="e.g. 7"></label><button class="btn primary" type="submit">Start chat</button></form>' + chatNote();
    return head("Chat with us", "You are " + esc(chatGuest.name) + ", table " + esc(chatGuest.table) + '. <button class="link" data-act="chatleave">End chat</button>') + '<div class="chatbox"><div id="chatMsgs" class="chatmsgs"></div><form novalidate id="chatForm" class="chatform"><input class="in" id="chatText" data-f="text" maxlength="500" placeholder="Message us…" autocomplete="off" required><button class="btn primary" type="submit">Send</button></form></div>' + chatNote();
  }
  function viewKChat() {
    if (!chatAllowed()) return head("Customer chat", "Your account does not have chat access. Ask staff.");
    return head("Customer chat", "Customers message the café here. Only the manager can reply.") + chatNote() + '<div class="kchat"><div class="kc-list" id="kList"></div><div class="kc-main"><div class="hint" id="kTitle">Select a conversation</div><div id="chatMsgs" class="chatmsgs"></div><form novalidate id="kForm" class="chatform" hidden><input class="in" data-f="text" maxlength="500" placeholder="Reply…" autocomplete="off" required><button class="btn primary" type="submit">Send</button></form></div></div>';
  }

  /* ---------- server mode: PHP + MySQL (WAMP) ---------- */
  // When api.php answers, everything is saved in the MySQL database. When it does not (for example on GitHub Pages or when
  // index.html is opened as a file), the site keeps working as the in-browser demo.
  var API = window.CAFEJ_API || "api.php", apiConfigured = !!window.CAFEJ_API, SERVER = false, OFFLINE = false, lastSig = "";
  // The sign-in session id is kept here and sent as a header, so the site also works when it is opened from GitHub and the API runs on your PC.
  function sidGet() { try { return localStorage.getItem("cafe_api_sid") || ""; } catch (e) { return ""; } }
  function sidSet(s) { try { localStorage.setItem("cafe_api_sid", s); } catch (e) {} }
  function rawFetch(action, body) {
    var h = { "X-Requested-With": "cafej", "ngrok-skip-browser-warning": "1" }, s = sidGet(), opt = { credentials: "omit", headers: h };
    if (s) h["X-Session"] = s;
    if (body) { opt.method = "POST"; h["Content-Type"] = "application/json"; opt.body = JSON.stringify(body); }
    return fetch(API + (API.indexOf("?") > -1 ? "&" : "?") + "a=" + action, opt).then(function (r) { var n = r.headers.get("X-Session"); if (n) sidSet(n); return r; });
  }
  function noop() {}
  function api(action, body) {
    return rawFetch(action, body).then(function (r) { return r.json().catch(function () { throw new Error("The server did not answer."); }); }).then(function (d) { if (d && d.error) throw new Error(d.error); return d; });
  }
  function srv(action, body) { if (SERVER) api(action, body).catch(function (er) { toast(er.message); }); }
  function fill(list, data) { list.length = 0; (data || []).forEach(function (x) { list.push(x); }); }
  function applyPublic(d) {
    fill(menu, d.menu); cats = ["All"].concat(d.cats); fill(ZONES, d.zones); FREE_DELIVERY_ABOVE = d.freeAbove; fill(reviews, d.reviews);
    fill(orders, []); fill(payments, []); fill(reservations, []); fill(subscribers, []);
    fill(customers, d.customer ? [d.customer] : []); state.user = d.customer ? d.customer.id : null; if (d.customer) state.phone = d.customer.phone;
    fill(staffUsers, d.admin ? [d.admin] : []); session = d.admin ? { uid: d.admin.id } : null; state.role = d.admin ? portalOf(d.admin) : "customer"; RESERVATION_FEE = d.reservationFee || RESERVATION_FEE;
  }
  function loadAdmin() { return api("admin_data").then(function (d) { fill(orders, d.orders); fill(payments, d.payments); fill(customers, d.customers); fill(reservations, d.reservations || []); fill(subscribers, d.subscribers || []); if (d.staff) fill(staffUsers, d.staff); }); }
  function loadMine() { return api("my_data").then(function (d) { fill(orders, d.orders); fill(payments, d.payments); }); }
  function loadMenu() { return api("menu").then(function (d) { fill(menu, d.menu); }); }
  function reloadData() { return !SERVER ? Promise.resolve() : me() ? loadAdmin() : user() ? loadMine() : Promise.resolve(); }
  function sigNow() { return JSON.stringify([orders.map(function (o) { return o.id + o.status + (o.fwd ? 1 : 0) + (o.chef || 0); }), reservations.map(function (r) { return r.id + r.status; }), menu.map(function (m) { return m.id + ":" + m.price + ":" + m.off + ":" + m.avail; }), payments.map(function (p) { return p.id + p.status; }), staffUsers.length, subscribers.length]); }
  function poll() {
    if (!SERVER || state.processing) return;
    var ae = document.activeElement; if (ae && /INPUT|SELECT|TEXTAREA/.test(ae.tagName) && $("#app").contains(ae)) return;
    (me() ? loadAdmin() : user() ? loadMine() : Promise.resolve()).then(function () { return me() ? null : loadMenu(); }).then(function () { var s = sigNow(); if (s !== lastSig) { lastSig = s; render(); } }).catch(noop);
  }
  setInterval(poll, 6000);
  function probe() {
    return rawFetch("bootstrap").then(function (r) {
      return r.text().then(function (t) {
        var d; try { d = JSON.parse(t); } catch (e) { throw new Error(t.indexOf("<?php") > -1 ? "PHP is not running here: the server sent api.php as plain text (this is what Live Server does)." : r.status === 404 ? "api.php was not found at " + API + "." : "api.php did not answer with data (HTTP " + r.status + ")."); }
        if (d && d.error) throw new Error(d.error);
        return d;
      });
    }, function () { throw new Error("The browser could not reach " + API + (location.protocol === "file:" ? " because index.html was opened as a file." : ". Is WAMP running" + (apiConfigured ? " and the tunnel on?" : "?"))); });
  }
  function offlineView(reason) { return '<div class="panel stack" style="max-width:560px;margin:30px auto;text-align:center"><h2>We are offline right now</h2><p class="sub">Our ordering system is not available at the moment. Please try again in a little while.</p><button class="btn primary" onclick="location.reload()">Try again</button><p class="hint">' + esc(reason || "") + "</p></div>"; }
  setInterval(function () { if (OFFLINE) probe().then(function () { location.reload(); }).catch(noop); }, 10000);
  function dbBanner(reason) {
    var h = location.hostname, local = location.protocol === "file:" || h === "localhost" || h === "127.0.0.1" || /^(192\.168|10)\./.test(h), b = $("#dbBanner"); if (!b) return;
    if (!reason || !local) { b.hidden = true; return; }
    b.innerHTML = apiConfigured ? "<b>Cannot reach the database server.</b> " + esc(reason) + " Check that WAMP is green and the tunnel is running, then reload." : "<b>Not connected to the database (demo mode).</b> " + esc(reason) + ' Open the site at <b>http://localhost/cafej/</b> with WAMP green, and run <a href="check.php">check.php</a> to see what to fix. Until then nothing is saved in MySQL.'; b.hidden = false;
  }
  function boot() {
    probe().then(function (d) { SERVER = true; dbBanner(""); applyPublic(d); return (d.admin ? loadAdmin() : d.customer ? loadMine() : Promise.resolve()).catch(noop); })
      .catch(function (er) { if (apiConfigured) { OFFLINE = true; state.offlineWhy = er.message; } dbBanner(er.message); }).then(function () { lastSig = sigNow(); heroUpdate(); routeHash(); render(); });
  }

  /* ---------- chrome ---------- */
  var ICONS = {"chat": "<path d=\"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z\"/>", "home": "<path d=\"M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z\"/>", "menu": "<path d=\"M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 2-3 5-3 8h3v10\"/>", "grid": "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>", "tag": "<path d=\"M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\"/>", "cal": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M8 3v4M16 3v4\"/>", "clip": "<rect x=\"5\" y=\"4\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 4h6v3H9zM9 12h6M9 16h6\"/>", "star": "<path d=\"M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z\"/>", "help": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01\"/>", "heart": "<path d=\"M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9z\"/>", "cart": "<circle cx=\"9\" cy=\"20\" r=\"1.4\"/><circle cx=\"18\" cy=\"20\" r=\"1.4\"/><path d=\"M2 3h3l2.5 12h11l2-8H6\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21c1-4 4-6 8-6s7 2 8 6\"/>", "db": "<ellipse cx=\"12\" cy=\"6\" rx=\"8\" ry=\"3\"/><path d=\"M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3\"/>", "chart": "<path d=\"M4 20V10M10 20V4M16 20v-8M22 20H2\"/>", "team": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2 20c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5M17 5a3.5 3.5 0 0 1 0 7M18 14.8c2.2.7 3.5 2.4 4 5.2\"/>", "flame": "<path d=\"M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z\"/>", "box": "<path d=\"M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10\"/>", "truck": "<path d=\"M2 6h11v10H2zM13 9h4l4 4v3h-8\"/><circle cx=\"7\" cy=\"18\" r=\"1.8\"/><circle cx=\"17\" cy=\"18\" r=\"1.8\"/>", "refresh": "<path d=\"M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5\"/>", "shield": "<path d=\"M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z\"/><path d=\"M9 12l2 2 4-4\"/>", "headset": "<path d=\"M4 14v-2a8 8 0 0 1 16 0v2\"/><rect x=\"3\" y=\"14\" width=\"4\" height=\"6\" rx=\"1\"/><rect x=\"17\" y=\"14\" width=\"4\" height=\"6\" rx=\"1\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-4-4\"/>"};
  function ic(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + ICONS[n] + "</svg>"; }
  var NAV = [["home", "Home", "home"], ["menu", "Menu", "menu"], ["categories", "Categories", "grid"], ["offers", "Offers", "tag"], ["reservations", "Reservations", "cal"], ["chat", "Chat with us", "chat"], ["orders", "Orders", "clip"], ["reviews", "Reviews", "star"], ["support", "Support", "help"]];
  function renderChrome() {
    var cust = state.role === "customer", onHome = cust && state.view === "home", u = me(), cc = cartCount(), top = "";
    $("#homeView").hidden = !onHome; $("#siteFoot").hidden = !cust; $("#sidePromo").hidden = !cust; $("#gsearch").hidden = !cust;
    if (cust) top += '<button class="ticon" data-act="tab" data-v="favs"><span class="i">' + ic("heart") + '</span>Favorites</button><button class="ticon" data-act="tab" data-v="cart"><span class="i">' + ic("cart") + '</span>Cart' + (cc ? '<span class="badge">' + cc + "</span>" : "") + '</button><button class="ticon" data-act="tab" data-v="account"><span class="i">' + ic("user") + '</span>' + (user() ? esc(user().name.split(" ")[0]) : "Account") + "</button>";
    if (u && u.active) {
      top += '<span class="pill ' + (SERVER ? "Paid" : "Cancelled") + '">' + (SERVER ? "Database connected" : "Demo mode") + "</span>";
      top += cust ? '<button class="btn sm primary" data-act="role" data-v="' + portalOf(u) + '">' + roleLabel(u) + " portal</button>" : '<span class="hint">' + esc(u.name) + " · " + roleLabel(u) + '</span><button class="btn sm" data-act="role" data-v="customer">← Website</button>';
      top += '<button class="btn sm solid-dark" data-act="logout">Sign out</button>';
    }
    $("#topActions").innerHTML = top;
    var t, cur;
    if (state.role === "chef") { t = [["kitchen", "Kitchen", "flame"]]; if (can("stock")) t.push(["stock", "Stock", "box"]); cur = state.chefView; }
    else if (cust) { t = NAV; cur = state.view; }
    else { var pend = orders.filter(function (o) { return o.status === "Pending" && !o.fwd; }).length; t = [["orders", "Order board" + (pend ? '<span class="badge">' + pend + "</span>" : ""), "clip"]]; if (isMgr()) t.push(["items", "Menu items", "menu"], ["records", "Records", "db"], ["sales", "Sales", "chart"], ["team", "Team", "team"], ["chat", "Customer chat", "chat"]); else t.push(["reservations", "Reservations", "cal"], ["stock", "Stock", "box"]); cur = state.staffView; }
    $("#tabs").innerHTML = t.map(function (x) { return '<button data-act="tab" data-v="' + x[0] + '"' + (cur === x[0] ? ' aria-current="page"' : "") + '><span class="i">' + ic(x[2]) + "</span>" + x[1] + chatBadge(x[0]) + "</button>"; }).join("");
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
    return listGrid(menu.filter(function (m) { return (state.cat === "All" || m.cat === state.cat) && (!state.cuisine || m.cuisine === state.cuisine) && (!q || m.name.toLowerCase().indexOf(q) > -1); }));
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
      '<label class="f">Mobile money number<input class="in mono" id="phone" data-f="momo" maxlength="10" inputmode="numeric" inputmode="tel" value="' + esc(state.phone) + '" placeholder="07XXXXXXXX"></label>';
    return '<div class="page-head"><div><h2>Cart and checkout</h2><p class="sub">Choose pickup at the café counter, or delivery to your door.</p></div></div><div class="split"><div class="stack">' +
      '<div class="panel"><h3>Items</h3>' + lines + totals() + promoBox() + "</div>" +
      fulfilPanel() + '<div class="panel"><h3>Schedule</h3><div class="two"><label class="f">' + (state.fulfil === "delivery" ? "Delivery" : "Pickup") + ' time<select class="in" id="slot">' + slots.map(function (s) { return '<option value="' + s + '"' + (state.slot === s ? " selected" : "") + ">" + (s === "ASAP" ? "As soon as possible" : "Today at " + s) + "</option>"; }).join("") + '</select></label>' +
      '<label class="f">Note to the kitchen<input class="in" id="note" data-f="note" maxlength="150" value="' + esc(state.note) + '" placeholder="e.g. no onions"></label></div></div></div>' +
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
    if (u) return '<div class="page-head"><h2>Account</h2></div><div class="panel stack" style="max-width:480px"><div><b>' + esc(u.name) + '</b><div class="hint">' + esc(u.email) + " · " + esc(u.phone) + " · " + esc(u.address) + '</div></div><button class="btn" data-act="signout">Sign out</button><p class="hint" style="margin:0">Team member? <button class="link" data-act="login" data-v="admin">Admin login</button></p></div>';
    var reg = state.authTab === "reg";
    return '<div class="page-head"><h2>' + (reg ? "Create an account" : "Sign in") + '</h2></div><form novalidate class="panel stack" style="max-width:480px" id="authForm"><div class="seg" style="justify-self:start"><button type="button" data-act="authtab" data-v="in" aria-pressed="' + !reg + '">Sign in</button><button type="button" data-act="authtab" data-v="reg" aria-pressed="' + reg + '">Register</button></div>' +
      (reg ? '<label class="f">Full name<input class="in" id="rName" data-f="name" maxlength="60" autocomplete="name" placeholder="First and last name" required></label><div class="two"><label class="f">Phone<input class="in" id="rPhone" data-f="phone" maxlength="13" autocomplete="tel" placeholder="0772123456" inputmode="tel" required></label><label class="f">Delivery area<input class="in" id="rAddr" data-f="area" maxlength="40" placeholder="e.g. Ntinda" placeholder="e.g. Nakawa"></label></div>' : "") +
      '<label class="f">Email<input class="in" id="aEmail" data-f="email" maxlength="120" autocomplete="email" type="email" required value="' + "" + '"></label><label class="f">Password<input class="in" id="aPass" maxlength="64" type="password" required value="' + "" + '"></label>' +
      (state.authErr ? '<p class="err">' + state.authErr + "</p>" : "") + '<button class="btn primary" type="submit">' + (reg ? "Register" : "Sign in") + "</button>" + '</form><p class="hint" style="margin-top:12px">Team member? <button class="link" data-act="login" data-v="admin">Admin login</button></p>';
  }

  /* ---------- staff ---------- */
  function chefNameOf(o) { var u = byId(staffUsers, o.chef); return o.chefName || (u ? u.name : "a chef"); }
  function ticket(o) {
    var c = byId(customers, o.cid), p = payOf(o.id), acts = "";
    if (o.status === "Pending" && !o.fwd) acts += '<button class="btn primary sm" data-act="forward" data-id="' + o.id + '">Send to kitchen</button>';
    if (o.status === "Pending" && o.fwd) acts += '<span class="hint">Sent to the kitchen, waiting for a chef</span>';
    if (o.status === "Preparing") acts += '<span class="hint">' + esc(chefNameOf(o)) + " is preparing this</span>";
    if (o.status === "Ready" || o.status === "Out for delivery") acts += '<button class="btn primary sm" data-act="advance" data-id="' + o.id + '">' + nextLabel(o) + "</button>";
    if (o.status === "Pending") acts += '<button class="btn danger sm" data-act="staffcancel" data-id="' + o.id + '">Cancel</button>';
    if (p && p.status === "Refund pending" && isMgr()) acts += '<button class="btn sm" data-act="refund" data-id="' + o.id + '">Process refund</button>';
    return '<div class="ticket"><div class="row"><b class="mono">#' + o.id + "</b><span>" + (p ? pill(p.status) : "") + '</span></div><div>' + esc(c ? c.name : "Guest") + ' · <span class="hint">' + (isDel(o) ? "delivery " : "pickup ") + (o.slot === "ASAP" ? "ASAP" : o.slot) + "</span></div>" + delInfo(o) + "<ul>" + itemsText(o).map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" + (o.note ? '<div class="hint">Note: ' + esc(o.note) + "</div>" : "") + '<div class="row"><b class="num">' + ugx(o.total) + '</b></div><div class="actions">' + acts + "</div></div>";
  }
  function viewStaffOrders() {
    var cols = [["New orders", function (o) { return o.status === "Pending" && !o.fwd; }], ["In the kitchen", function (o) { return (o.status === "Pending" && o.fwd) || o.status === "Preparing"; }], ["Ready", function (o) { return o.status === "Ready"; }], ["Out for delivery", function (o) { return o.status === "Out for delivery"; }], ["Done", function (o) { return o.status === "Completed" || o.status === "Cancelled"; }]];
    return head("Order board", "New orders arrive here first. Send each one to the kitchen. When the chef marks it ready, hand it over or send it out.") + '<div class="board">' + cols.map(function (c) {
      var list = orders.filter(c[1]).sort(function (a, b) { return b.id - a.id; });
      return '<section class="col"><h3><span>' + c[0] + '</span><span class="mono">' + list.length + "</span></h3>" + (list.map(ticket).join("") || '<div class="hint" style="padding:6px">Nothing here</div>') + "</section>";
    }).join("") + "</div>";
  }
  function viewStaffItems() {
    return '<div class="page-head"><div><h2>Menu items</h2><p class="sub">Changes show on the customer menu straight away.</p></div></div>' +
      '<div class="tbl-wrap"><table><thead><tr><th>ID</th><th>Item</th><th>Category</th><th>Price (UGX)</th><th>Offer %</th><th>Availability</th></tr></thead><tbody>' + menu.map(function (m) {
        return '<tr><td class="mono">' + m.id + "</td><td>" + esc(m.name) + "</td><td>" + esc(m.cat) + '</td><td><input class="in mono" style="width:110px;padding:4px 8px" type="number" min="0" step="500" data-price="' + m.id + '" value="' + m.price + '" aria-label="Price of ' + esc(m.name) + '"></td><td><input class="in mono" style="width:70px;padding:4px 8px" type="number" min="0" max="90" data-off="' + m.id + '" value="' + (m.off || 0) + '" aria-label="Offer percent for ' + esc(m.name) + '"></td><td><button class="btn sm" data-act="toggle" data-id="' + m.id + '">' + (m.avail ? "Available · mark sold out" : "Sold out · mark available") + "</button></td></tr>";
      }).join("") + "</tbody></table></div>" +
      '<form novalidate class="panel" id="addItem" style="margin-top:16px"><h3>Add a menu item</h3><div class="two" style="margin-bottom:10px"><label class="f">Name<input class="in" id="nName" data-f="dish" maxlength="60" required></label><label class="f">Category<select class="in" id="nCat">' + cats.slice(1).map(function (c) { return "<option>" + c + "</option>"; }).join("") + '</select></label></div><div class="two" style="margin-bottom:10px"><label class="f">Price (UGX)<input class="in" id="nPrice" type="number" min="0" step="500" required></label><label class="f">Short description<input class="in" id="nDesc" data-f="text" maxlength="200"></label></div><button class="btn primary" type="submit">Add to menu</button></form>';
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
  function kitchenCard(o, mode) {
    var act = mode === "pending" ? "Pick this order" : "Mark ready";
    return '<div class="kt"><div class="row"><b class="mono">#' + o.id + '</b><span class="when">' + (isDel(o) ? "Delivery · " : "Pickup · ") + (o.slot === "ASAP" ? "ASAP" : o.slot) + '</span></div><ul>' +
      o.items.map(function (i) { return '<li><b>' + i.qty + ' ×</b> ' + esc(byId(menu, i.id).name) + '</li>'; }).join("") + '</ul>' +
      (o.note ? '<div class="knote">Note: ' + esc(o.note) + '</div>' : "") +
      (mode === "ready" ? '<div class="hint">Ready. The manager will hand it over.</div>' : can("cook") ? '<button class="btn primary" data-act="advance" data-id="' + o.id + '">' + act + '</button>' : '<div class="hint">View only. Ask the manager for kitchen rights.</div>') + "</div>";
  }
  function viewChef() {
    var uid = myId();
    var pend = orders.filter(function (o) { return o.status === "Pending" && o.fwd; }).sort(byPickup);
    var mine = orders.filter(function (o) { return o.status === "Preparing" && o.chef === uid; }).sort(byPickup);
    var ready = orders.filter(function (o) { return o.status === "Ready"; }).sort(byPickup);
    function col(title, list, mode, empty) { return '<section class="col"><h3><span>' + title + '</span><span class="mono">' + list.length + "</span></h3>" + (list.map(function (o) { return kitchenCard(o, mode); }).join("") || '<div class="hint" style="padding:6px">' + empty + "</div>") + "</section>"; }
    return head("Kitchen", "Orders the manager sends appear in Pending. Pick one to start preparing it, then mark it ready.") + '<div class="board">' + col("Pending", pend, "pending", "No orders waiting") + col("Preparing (mine)", mine, "mine", "Nothing in preparation") + col("Ready", ready, "ready", "Nothing ready yet") + "</div>";
  }
  function resTable() {
    return table("Table reservations (deposit paid)", ["Name", "Phone", "Date", "Time", "Guests", "Deposit", "Status", ""], reservations.map(function (r) { return [esc(r.name), esc(r.phone), r.date, r.time, r.guests, ugx(r.deposit || 0), pill(r.status), r.status === "Requested" ? '<button class="btn sm" data-act="rconfirm" data-id="' + r.id + '">Confirm</button>' : ""]; }));
  }
  function viewStaffRes() { return head("Reservations", "Customers pay a deposit when they book. Confirm to hold the table.") + resTable(); }

  /* ---------- render ---------- */
  function render() {
    if (OFFLINE) { state.role = "customer"; renderChrome(); $("#homeView").hidden = true; $("#app").hidden = false; $("#app").innerHTML = offlineView(state.offlineWhy); return; }
    var u = me(); if (state.role !== "customer" && (!u || !u.active || portalOf(u) !== state.role)) { state.role = "customer"; setSession(null); }
    renderChrome();
    var v;
    if (state.role === "chef") v = (state.chefView === "stock" && can("stock") ? viewChefStock : viewChef)();
    else if (state.role === "customer") v = ({ home: function () { return ""; }, menu: viewMenu, categories: viewCategories, offers: viewOffers, favs: viewFavs, reservations: viewReserve, reviews: viewReviews, support: viewSupport, cart: viewCart, orders: viewOrders, account: viewAccount, confirm: viewConfirm, login: viewLogin, chat: viewChat }[state.view] || viewMenu)();
    else v = (function () { var sv = state.staffView; if (!isMgr() && ["items", "records", "sales", "team", "chat"].indexOf(sv) > -1) sv = "orders"; return ({ orders: viewStaffOrders, items: viewStaffItems, records: viewRecords, sales: viewSales, team: viewTeam, chat: viewKChat, reservations: viewStaffRes, stock: viewChefStock }[sv] || viewStaffOrders)(); })();
    $("#app").innerHTML = v; chatHtml = ""; chatTick(); if ($("#kList")) paintKitchen(); $("#app").hidden = state.role === "customer" && state.view === "home";
    $("#popular").innerHTML = popularHtml();
    [].forEach.call(document.querySelectorAll("[data-count]"), function (el) { var n = menu.filter(function (m) { return m.cuisine === el.dataset.count; }).length; el.textContent = n + (n === 1 ? " dish" : " dishes"); });
    var L = $("#layer");
    L.innerHTML = state.processing ? '<div class="overlay" role="alertdialog" aria-label="Waiting for payment"><div class="modal" style="text-align:center"><div class="spin"></div><h3>Waiting for payment approval</h3><p class="hint">' + (state.method === "card" ? "Contacting your card issuer…" : "Approve the prompt on " + esc(state.phone) + " to pay " + ugx(state.payAmount || grand()) + ".") + "</p></div></div>" : "";
  }
  function refreshMenuParts() { var g = $("#menuGrid"); if (g) { g.innerHTML = menuGrid(); $("#miniCart").innerHTML = miniCart(); } $("#popular").innerHTML = popularHtml(); renderChrome(); }

  /* ---------- actions ---------- */
  function setCart(id, d) {
    var m = byId(menu, id); if (!m || !m.avail) return;
    var n = (state.cart[id] || 0) + d;
    if (n <= 0) delete state.cart[id]; else state.cart[id] = n;
    if (state.view === "cart" || state.view === "favs" || state.view === "offers") render(); else refreshMenuParts();
  }
  function placeOrder() {
    var u = user();
    if (!u) { state.view = "account"; state.authTab = "in"; render(); return; }
    var perr = state.method !== "card" ? firstErr([["momo", state.phone]]) : ""; if (perr) { state.checkErr = perr; render(); return; }
    if (state.fulfil === "delivery") { var aerr = !state.dArea ? "Choose your delivery area." : firstErr([["address", state.dAddr.trim()]]); if (aerr) { state.checkErr = aerr; render(); return; } }
    state.checkErr = ""; state.processing = true; render();
    setTimeout(function () {
      var items = Object.keys(state.cart).map(function (k) { return { id: +k, qty: state.cart[k] }; });
      if (SERVER) {
        api("place_order", { items: items, slot: state.slot, type: state.fulfil, zone: state.dArea, address: state.dAddr.trim(), note: state.note, method: state.method === "card" ? "Credit card" : "Mobile money", promo: state.promoOn ? "TASTY30" : "", phone: state.phone })
          .then(function (d) { orders.push(d.order); payments.push(d.payment); state.cart = {}; state.promoOn = false; state.promoMsg = ""; state.note = ""; state.slot = "ASAP"; state.lastOrder = d.order; state.processing = false; state.view = "confirm"; render(); })
          .catch(function (er) { state.processing = false; state.checkErr = er.message; render(); });
        return;
      }
      var o = { id: nextOrder++, cid: u.id, date: TODAY, slot: state.slot, items: items, status: "Pending", total: grand(), note: state.note, type: state.fulfil, area: state.fulfil === "delivery" ? state.dArea : "", addr: state.fulfil === "delivery" ? state.dAddr.trim() : "", fee: deliveryFee(), disc: discount() };
      orders.push(o);
      payments.push({ id: nextPay++, oid: o.id, method: state.method === "card" ? "Credit card" : "Mobile money", amount: o.total, date: TODAY, status: "Paid" });
      state.cart = {}; state.promoOn = false; state.promoMsg = ""; state.note = ""; state.slot = "ASAP"; state.lastOrder = o; state.processing = false; state.view = "confirm"; render();
    }, 1800);
  }
  function cancelOrder(id, byStaff) {
    var o = byId(orders, id); if (!o || o.status !== "Pending") return;
    if (SERVER) { api("cancel_order", { id: id }).then(reloadData).then(function () { toast(byStaff ? "Order cancelled. Refund is waiting to be processed." : "Order cancelled. Your refund request was sent to staff."); render(); }).catch(function (er) { toast(er.message); }); return; }
    o.status = "Cancelled"; var p = payOf(id); if (p && p.status === "Paid") p.status = "Refund pending";
    toast(byStaff ? "Order cancelled. Refund is waiting to be processed." : "Order cancelled. Your refund request was sent to staff."); render();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return;
    var a = b.dataset.act, v = b.dataset.v, id = +b.dataset.id;
    if (a === "kopen") { chatActive = v; chatHtml = ""; var cb = $("#chatMsgs"); if (cb) delete cb.dataset.p; paintKitchen(); }
    else if (a === "kdelchat") { if (chatActive && window.confirm("Delete this conversation?")) { var did = chatActive; chatActive = null; chatApi.remove("chats/" + did).then(chatTick); } }
    else if (a === "chatleave") { chatGuest = null; chatSeen = 0; chatBadgeN = 0; try { localStorage.removeItem("cafe_chat_guest_" + chatUid); localStorage.removeItem("cafe_chat_seen_" + chatUid); } catch (e2) {} render(); }
    else if (a === "login") { state.loginRole = v; state.view = "login"; state.authErr = ""; state.lUser = ""; state.role = "customer"; render(); window.scrollTo(0, 0); }
    else if (a === "logout") { if (SERVER) { api("admin_logout", {}).catch(noop); session = null; fill(staffUsers, []); fill(orders, []); fill(payments, []); fill(reservations, []); fill(subscribers, []); if (user()) loadMine().then(function () { render(); }, noop); } setSession(null); state.role = "customer"; state.view = "home"; render(); }
    else if (a === "fav") { var fi = state.favs.indexOf(id); if (fi > -1) state.favs.splice(fi, 1); else state.favs.push(id); render(); }
    else if (a === "cuisine") { state.cuisine = v; state.cat = "All"; state.q = ""; $("#gq").value = ""; state.view = "menu"; render(); window.scrollTo(0, 0); }
    else if (a === "clearcuisine") { state.cuisine = ""; render(); }
    else if (a === "gosearch") { state.view = "menu"; state.cuisine = ""; render(); window.scrollTo(0, 0); }
    else if (a === "slide") { slideIdx = (slideIdx + (+v) + SLIDES.length) % SLIDES.length; heroUpdate(); }
    else if (a === "combo") { if (byId(menu, 118).avail) { state.cart[118] = (state.cart[118] || 0) + 1; state.view = "cart"; render(); window.scrollTo(0, 0); } else toast("The family combo is sold out today."); }
    else if (a === "soon") toast("Coming soon.");
    else if (a === "promo") { var code = ($("#promo").value || "").trim().toUpperCase(), pu = user(); if (code !== "TASTY30") state.promoMsg = "That code is not valid."; else if (!pu) state.promoMsg = "Sign in first, then apply the code."; else if (orders.some(function (o) { return o.cid === pu.id && o.status !== "Cancelled"; })) state.promoMsg = "TASTY30 is for first orders only."; else { state.promoOn = true; state.promoMsg = ""; } render(); }
    else if (a === "promooff") { state.promoOn = false; render(); }
    else if (a === "kactive") { var ku = byId(staffUsers, id); ku.active = !ku.active; srv("staff_update", { id: ku.id, active: ku.active }); saveUsers(); toast(ku.name + (ku.active ? " can log in again." : " can no longer log in.")); render(); }
    else if (a === "kreset") { var rp = window.prompt("New password for " + byId(staffUsers, id).name + " (6+ characters):"); if (rp && !ruleTest("pass", rp)) { var ru = byId(staffUsers, id); ru.hash = hpw(ru.username, rp); srv("staff_reset", { id: ru.id, password: rp }); saveUsers(); toast("Password reset."); } else if (rp) toast(RULES.pass.msg); }
    else if (a === "kdel") { var du = byId(staffUsers, id); if (window.confirm("Delete the account for " + du.name + "?")) { staffUsers = staffUsers.filter(function (x) { return x.id !== id; }); srv("staff_delete", { id: id }); saveUsers(); render(); } }
    else if (a === "rconfirm") { if (SERVER) { api("reservation_confirm", { id: id }).then(reloadData).then(function () { render(); }).catch(function (er) { toast(er.message); }); } else { reservations.filter(function (r) { return r.id === id; })[0].status = "Confirmed"; render(); } }
    else if (a === "role") { state.role = v; if (v === "customer" && state.view === "confirm") state.view = "menu"; render(); }
    else if (a === "tab") { if (v === "menu") { state.cuisine = ""; state.q = ""; $("#gq").value = ""; } if (state.role === "customer") state.view = v; else if (state.role === "chef") state.chefView = v; else state.staffView = v; state.checkErr = ""; render(); window.scrollTo(0, 0); }
    else if (a === "cat") { state.cat = v; state.cuisine = ""; if (b.dataset.go) state.view = b.dataset.go; render(); window.scrollTo(0, 0); }
    else if (a === "inc") setCart(id, 1);
    else if (a === "dec") setCart(id, -1);
    else if (a === "place") placeOrder();
    else if (a === "cancel") cancelOrder(id, false);
    else if (a === "staffcancel") cancelOrder(id, true);
    else if (a === "forward") {
      var fo = byId(orders, id);
      if (!can("orders") || !fo || fo.status !== "Pending" || fo.fwd) { toast("This order cannot be sent to the kitchen."); return; }
      if (SERVER) { api("forward_order", { id: id }).then(reloadData).then(function () { toast("Order sent to the kitchen."); render(); }).catch(function (er) { toast(er.message); }); }
      else { fo.fwd = true; toast("Order sent to the kitchen."); render(); }
    }
    else if (a === "advance") {
      var o = byId(orders, id); if (!o) return; var nx = fl(o)[fl(o).indexOf(o.status) + 1], mu = me();
      if (state.role === "chef") {
        if (!can("cook")) { toast("Your account cannot pick orders."); return; }
        if (nx === "Preparing" && !(o.fwd && !o.chef)) { toast("This order is not available to pick."); return; }
        if (nx === "Ready" && o.chef !== mu.id) { toast("Only the chef who picked this order can mark it ready."); return; }
        if (nx !== "Preparing" && nx !== "Ready") return;
      } else if (nx !== "Out for delivery" && nx !== "Completed") { toast("Only the kitchen prepares orders. Send it to the kitchen first."); return; }
      if (SERVER) { api("order_status", { id: id, status: nx }).then(reloadData).then(function () { render(); }).catch(function (er) { toast(er.message); }); }
      else { o.status = nx; if (nx === "Preparing") { o.chef = mu.id; o.chefName = mu.name; } render(); }
    }
    else if (a === "refund") { if (!isMgr()) { toast("Only the manager can process refunds."); return; } if (SERVER) { api("refund", { id: id }).then(reloadData).then(function () { toast("Refund marked as sent."); render(); }).catch(function (er) { toast(er.message); }); } else { payOf(id).status = "Refunded"; toast("Refund marked as sent."); render(); } }
    else if (a === "toggle") { if (!can("stock")) { toast("Your account cannot change stock."); return; } var m = byId(menu, id); if (SERVER) { api("item_update", { id: id, available: !m.avail }).then(function () { m.avail = !m.avail; if (!m.avail) delete state.cart[id]; render(); }).catch(function (er) { toast(er.message); }); } else { m.avail = !m.avail; if (!m.avail) delete state.cart[id]; render(); } }
    else if (a === "signout") { if (SERVER) { api("logout", {}).catch(noop); if (!me()) { fill(orders, []); fill(payments, []); fill(customers, []); } } state.user = null; render(); }
    else if (a === "authtab") { state.authTab = v; state.authErr = ""; render(); }
  });
  document.addEventListener("input", function (e) {
    var t = e.target;
    if (t.dataset && t.dataset.f) applyRule(t);
    if (t.id === "gq") { state.q = t.value; state.cuisine = ""; if (state.view !== "menu") { state.view = "menu"; render(); } else { var gg = $("#menuGrid"); if (gg) gg.innerHTML = menuGrid(); } }
    else if (t.id && t.id.indexOf("rs") === 0 && t.closest("#resForm")) { state.res = state.res || {}; state.res[t.id] = t.value; }
    else if (t.id === "search") { state.q = t.value; var g = $("#menuGrid"); if (g) g.innerHTML = menuGrid(); }
    else if (t.id === "phone") state.phone = t.value;
    else if (t.id === "dAddr") state.dAddr = t.value;
    else if (t.id === "note") state.note = t.value;
  });
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "slot") state.slot = t.value;
    else if (t.name === "pm") { state.method = t.value; render(); }
    else if (t.name === "fm") { state.fulfil = t.value; render(); }
    else if (t.id === "dArea") { state.dArea = t.value; render(); }
    else if (t.dataset && t.dataset.off) { var mo = byId(menu, +t.dataset.off); mo.off = Math.min(90, Math.max(0, parseInt(t.value, 10) || 0)); srv("item_update", { id: mo.id, offer: mo.off }); toast(mo.name + (mo.off ? " now " + mo.off + "% off." : " offer removed.")); }
    else if (t.dataset && t.dataset.kr) { var kk = byId(staffUsers, +t.dataset.id); kk.rights = kk.rights || {}; kk.rights[t.dataset.kr] = t.checked; srv("staff_update", { id: kk.id, rights: kk.rights }); saveUsers(); toast("Rights updated for " + kk.name + "."); }
    else if (t.dataset && t.dataset.price) { var m = byId(menu, +t.dataset.price), n = Math.max(0, parseInt(t.value, 10) || 0); m.price = n; srv("item_update", { id: m.id, price: n }); toast(m.name + " is now " + ugx(n)); }
  });
  document.addEventListener("submit", function (e) {
    e.preventDefault();
    if (e.target.id === "chatJoin") {
      var ger = firstErr([["table", $("#cgTable").value.trim()]]); if (ger) { formErr(e.target, ger); return; }
      syncGuest(); var gname = user().name, gtable = $("#cgTable").value.trim();
      chatGuest = { id: "g" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: gname, table: gtable }; chatSeen = SERVER ? 0 : Date.now();
      try { localStorage.setItem("cafe_chat_guest_" + chatUid, JSON.stringify(chatGuest)); localStorage.setItem("cafe_chat_seen_" + chatUid, chatSeen); } catch (e2) {}
      chatApi.patch("chats/" + chatGuest.id + "/meta", { name: gname, table: gtable, updated: Date.now(), lastFrom: "", last: "" }); render();
    } else if (e.target.id === "chatForm" || e.target.id === "kForm") {
      var inp = e.target.querySelector("input"), text = inp.value.trim().slice(0, 500); if (!text) return; inp.value = ""; var now = Date.now();
      if (e.target.id === "chatForm") chatApi.push("chats/" + chatGuest.id + "/messages", { from: "guest", name: chatGuest.name, text: text, t: now }).then(function () { return chatApi.patch("chats/" + chatGuest.id + "/meta", { name: chatGuest.name, table: chatGuest.table, updated: now, lastFrom: "guest", last: text }); }).then(chatTick);
      else if (chatActive) { var cid = chatActive; chatApi.push("chats/" + cid + "/messages", { from: "kitchen", name: me().name, text: text, t: now }).then(function () { return chatApi.patch("chats/" + cid + "/meta", { updated: now, lastFrom: "kitchen", last: text }); }).then(chatTick); }
    } else if (e.target.id === "loginForm") {
      var un = $("#lUser").value.trim().toLowerCase(), pw = $("#lPass").value; state.lUser = un;
      if (SERVER) {
        api("admin_login", { username: un, password: pw }).then(function (d) { fill(staffUsers, [d.admin]); session = { uid: d.admin.id }; try { history.replaceState(null, "", location.pathname + location.search); } catch (e3) {} state.role = portalOf(d.admin); state.staffView = "orders"; state.chefView = "kitchen"; state.authErr = ""; return loadAdmin(); })
          .catch(function (er) { state.authErr = er.message; }).then(function () { render(); window.scrollTo(0, 0); });
        return;
      }
      var lu = staffUsers.filter(function (x) { return x.username.toLowerCase() === un; })[0];
      if (!lu || lu.hash !== hpw(lu.username, pw)) state.authErr = "Wrong username or password.";
      else if (!lu.active) state.authErr = "This account has been disabled. Ask a staff member.";
      else { setSession(lu); try { history.replaceState(null, "", location.pathname + location.search); } catch (e3) {} state.role = portalOf(lu); state.staffView = "orders"; state.chefView = "kitchen"; state.authErr = ""; }
      render(); window.scrollTo(0, 0);
    } else if (e.target.id === "addKitchen") {
      var ker = firstErr([["name", clean($("#kName").value)], ["user", $("#kUser").value.trim().toLowerCase()], ["pass", $("#kPass").value]]); if (ker) { formErr(e.target, ker); return; } formErr(e.target, "");
      var nu = $("#kUser").value.trim().toLowerCase();
      if (staffUsers.some(function (x) { return x.username.toLowerCase() === nu; })) { state.authErr = "That username is taken."; render(); return; }
      if (SERVER) {
        api("staff_create", { name: clean($("#kName").value), username: nu, password: $("#kPass").value, role: $("#kRole").value, rights: { cook: $("#kCook").checked, stock: $("#kStock").checked } })
          .then(loadAdmin).then(function () { state.authErr = ""; toast("Kitchen account created."); render(); }).catch(function (er) { state.authErr = er.message; render(); });
        return;
      }
      staffUsers.push({ id: nextUid++, role: $("#kRole").value, name: clean($("#kName").value), username: nu, hash: hpw(nu, $("#kPass").value), active: true, rights: { cook: $("#kCook").checked, stock: $("#kStock").checked } });
      saveUsers(); state.authErr = ""; toast("Kitchen account created."); render();
    } else if (e.target.id === "pwForm") {
      var wer = firstErr([["pass", $("#myPass").value]]); if (wer) { formErr(e.target, wer); return; }
      var su = me(); srv("staff_password", { password: $("#myPass").value }); su.hash = hpw(su.username, $("#myPass").value); saveUsers(); toast("Your password was updated."); render();
    } else if (e.target.id === "resForm") {
      var rn = clean($("#rsName").value), rp = $("#rsPhone").value, rd = $("#rsDate").value, rt = $("#rsTime").value, rg = parseInt($("#rsGuests").value, 10);
      var rer = firstErr([["name", rn], ["phone", rp]]) || (!rd || rd < new Date().toISOString().slice(0, 10) ? "Choose a date from today onwards." : "") || (!(rg >= 1 && rg <= 12) ? "Guests must be between 1 and 12." : "") || (state.method !== "card" ? firstErr([["momo", state.phone]]) : "");
      if (rer) { formErr(e.target, rer); return; }
      formErr(e.target, ""); state.processing = true; state.payAmount = RESERVATION_FEE; render();
      setTimeout(function () {
        var done = function (r) { reservations.push(r); state.processing = false; state.payAmount = 0; state.res = null; toast("Deposit paid. Your table request was sent. Staff will confirm."); render(); };
        var bad = function (er) { state.processing = false; state.payAmount = 0; render(); toast(er.message); };
        if (SERVER) api("reservation", { name: rn, phone: rp, date: rd, time: rt, guests: rg, method: state.method === "card" ? "Credit card" : "Mobile money", momo: state.phone }).then(function (d) { done(d.reservation); }).catch(bad);
        else done({ id: nextRes++, name: rn, phone: rp, date: rd, time: rt, guests: rg, status: "Requested", deposit: RESERVATION_FEE, cid: user().id });
      }, 1800);
    } else if (e.target.id === "revForm") {
      if (!$("#rvText").value.trim()) { formErr(e.target, "Please write a short review."); return; }
      if (SERVER) {
        var rs = +$("#rvStars").value, rt = $("#rvText").value.trim();
        api("review", { stars: rs, text: rt }).then(function () { reviews.push({ name: user().name, stars: rs, text: rt, date: TODAY }); toast("Thanks for your review."); render(); }).catch(function (er) { toast(er.message); });
        return;
      }
      reviews.push({ name: user().name, stars: +$("#rvStars").value, text: $("#rvText").value.trim(), date: TODAY }); toast("Thanks for your review."); render();
    } else if (e.target.id === "newsForm") {
      var ner = firstErr([["email", $("#newsEmail").value.trim()]]); if (ner) { toast(ner); return; }
      if (SERVER) { api("newsletter", { email: $("#newsEmail").value.trim() }).then(function () { e.target.reset(); toast("Thanks for subscribing."); }).catch(function (er) { toast(er.message); }); return; }
      subscribers.push($("#newsEmail").value.trim()); e.target.reset(); toast("Thanks for subscribing.");
    } else if (e.target.id === "authForm") {
      var sm0 = state.authTab === "reg", em0 = $("#aEmail").value.trim().toLowerCase();
      var er0 = sm0 ? firstErr([["name", clean($("#rName").value)], ["phone", $("#rPhone").value], ["area", $("#rAddr").value.trim() || "Kampala"], ["email", em0], ["pass", $("#aPass").value]]) : firstErr([["email", em0]]);
      if (er0) { formErr(e.target, er0); return; } formErr(e.target, "");
      if (SERVER) {
        var sm = state.authTab === "reg";
        api(sm ? "register" : "login", sm ? { name: $("#rName").value.trim(), phone: $("#rPhone").value.trim(), area: $("#rAddr").value.trim(), email: $("#aEmail").value.trim(), password: $("#aPass").value } : { email: $("#aEmail").value.trim(), password: $("#aPass").value })
          .then(function (d) { fill(customers, [d.customer]); state.user = d.customer.id; state.phone = d.customer.phone; state.authErr = ""; state.view = cartCount() ? "cart" : "menu"; if (sm) toast("Welcome, " + d.customer.name + "."); return loadMine(); })
          .catch(function (er) { state.authErr = er.message; }).then(function () { render(); });
        return;
      }
      var email = $("#aEmail").value.trim().toLowerCase();
      var found = customers.filter(function (c) { return c.email === email; })[0];
      if (state.authTab === "reg") {
        if (found) { state.authErr = "That email already has an account. Sign in instead."; render(); return; }
        var c = { id: nextCust++, name: $("#rName").value.trim(), email: email, phone: $("#rPhone").value.trim(), address: $("#rAddr").value.trim() || "Not given" };
        customers.push(c); state.user = c.id; state.phone = c.phone; state.authErr = ""; state.view = cartCount() ? "cart" : "menu"; toast("Welcome, " + c.name + "."); render();
      } else {
        if (!found) { state.authErr = "No account with that email. Register to create one."; render(); return; }
        state.user = found.id; state.phone = found.phone; state.authErr = ""; state.view = cartCount() ? "cart" : "menu"; render();
      }
    } else if (e.target.id === "addItem") {
      var ier = firstErr([["dish", clean($("#nName").value)], ["price", String(parseInt($("#nPrice").value, 10) || "")]]); if (ier) { formErr(e.target, ier); return; }
      if (SERVER) { api("item_add", { name: $("#nName").value.trim(), cat: $("#nCat").value, price: parseInt($("#nPrice").value, 10) || 0, desc: $("#nDesc").value.trim() }).then(loadMenu).then(function () { toast("Item added to the menu."); render(); }).catch(function (er) { toast(er.message); }); return; }
      menu.push({ id: nextItem++, name: $("#nName").value.trim(), cat: $("#nCat").value, price: Math.max(0, parseInt($("#nPrice").value, 10) || 0), avail: true, desc: $("#nDesc").value.trim() || "Added by staff" });
      toast("Item added to the menu."); render();
    }
  });

  [].forEach.call(document.querySelectorAll("#homeView .media[data-ph], .side-promo .media[data-ph]"), function (m) { var i = m.querySelector("img"); if (i) i.src = m.dataset.ph; });
  heroUpdate();
  // Staff and kitchen sign in from one address, .../index.html#admin (also reachable from the Account page). The account decides which portal opens.
  function routeHash() {
    var h = location.hash; if (h !== "#admin" && h !== "#staff" && h !== "#kitchen") return;
    var u = me();
    if (u && u.active) state.role = portalOf(u); else { state.role = "customer"; state.view = "login"; state.loginRole = "admin"; state.authErr = ""; }
  }
  window.addEventListener("hashchange", function () { routeHash(); render(); window.scrollTo(0, 0); });
  boot();
})();
