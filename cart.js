/* =====================================================================
   Anjona Cart: shob page-e ekta-i cart (navbar icon + side drawer)
   Eta fabrics.html, checkout.html ar index.html shobai use kore.
   ===================================================================== */
(function () {
  "use strict";

  /* ====== APNAR SETTINGS: shudhu ekhane bodlan ====== */
  var CFG = window.ANJONA_CONFIG = {
    shopName: "Anjona Fabrics",
    currency: "৳",
    orderApi: "",              // PORE: Worker-er order API link ekhane boshaben. Eg: "https://anjona.xxx.workers.dev/api/orders"
    deliveryDhaka: 60,         // Dhaka-r bhetor delivery charge
    deliveryOutside: 120,      // Dhaka-r baire delivery charge
    freeDeliveryAbove: 3000,   // ei taka-r upore delivery free (0 dile off)
    bkash: "01XXXXXXXXX",      // bKash (Personal) number
    nagad: "01XXXXXXXXX"       // Nagad (Personal) number
  };
  /* ================================================== */

  var KEY = "anjona_cart_v1";
  var items = [];
  try { items = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { items = []; }

  function save() { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} }
  function money(n) { return CFG.currency + " " + Number(n).toLocaleString("en-IN"); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var listeners = [];
  function changed() { save(); render(); listeners.forEach(function (fn) { fn(); }); }

  var Cart = window.Cart = {
    items: function () { return items; },
    count: function () { return items.length; },
    subtotal: function () { return items.reduce(function (s, i) { return s + i.price * i.qty; }, 0); },
    deliveryFee: function (area, subtotal) {
      if (!subtotal) return 0;
      if (CFG.freeDeliveryAbove && subtotal >= CFG.freeDeliveryAbove) return 0;
      return area === "outside" ? CFG.deliveryOutside : CFG.deliveryDhaka;
    },
    add: function (it) {
      var id = it.name + "|" + it.color;
      var f = items.find(function (x) { return x.id === id; });
      if (f) f.qty = Math.min(100, f.qty + it.qty);
      else items.push({ id: id, name: it.name, color: it.color, price: it.price, qty: it.qty, unit: "yard" });
      changed();
      toast("✓ " + it.name + " cart-e add hoyeche");
    },
    setQty: function (id, q) {
      var f = items.find(function (x) { return x.id === id; });
      if (!f) return;
      f.qty = Math.max(0.5, Math.min(100, q));
      changed();
    },
    remove: function (id) { items = items.filter(function (x) { return x.id !== id; }); changed(); },
    clear: function () { items = []; changed(); },
    onChange: function (fn) { listeners.push(fn); },
    open: function () { document.getElementById("acDrawer").classList.add("open"); document.getElementById("acOverlay").classList.add("open"); },
    close: function () { document.getElementById("acDrawer").classList.remove("open"); document.getElementById("acOverlay").classList.remove("open"); },
    money: money,
    esc: esc
  };

  /* ---------- UI: styles ---------- */
  var css = "\
  .ac-btn{position:relative;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:30px;padding:7px 16px;cursor:pointer;font-family:inherit;font-size:.9rem;display:inline-flex;gap:6px;align-items:center;margin-left:14px;transition:.25s}\
  .ac-btn:hover{background:rgba(255,255,255,.28)}\
  .ac-btn b{background:#c9577a;color:#fff;border-radius:50%;min-width:20px;height:20px;display:grid;place-items:center;font-size:.72rem;padding:0 5px}\
  .ac-overlay{position:fixed;inset:0;background:rgba(20,6,17,.55);backdrop-filter:blur(2px);opacity:0;pointer-events:none;transition:.3s;z-index:300}\
  .ac-overlay.open{opacity:1;pointer-events:auto}\
  .ac-drawer{position:fixed;top:0;right:0;height:100%;width:min(420px,100%);background:#fdf8f3;z-index:310;transform:translateX(100%);transition:.4s;display:flex;flex-direction:column;box-shadow:-10px 0 40px rgba(0,0,0,.25);font-family:'Poppins','Hind Siliguri',sans-serif;color:#2b2230}\
  .ac-drawer.open{transform:none}\
  .ac-head{display:flex;justify-content:space-between;align-items:center;padding:20px 22px;background:#4a1d3f;color:#fff}\
  .ac-head h3{font-family:'Playfair Display',serif;font-size:1.3rem}\
  .ac-x{background:none;border:none;color:#fff;font-size:1.6rem;cursor:pointer}\
  .ac-list{flex:1;overflow:auto;padding:14px 18px}\
  .ac-empty{text-align:center;color:#7a6b78;padding:60px 10px}\
  .ac-item{display:flex;gap:12px;padding:14px 0;border-bottom:1px solid #eadfe6}\
  .ac-sw{width:54px;height:54px;border-radius:12px;flex-shrink:0;border:2px solid #fff;box-shadow:0 0 0 1px #ddd}\
  .ac-info{flex:1;min-width:0}\
  .ac-info b{display:block;color:#4a1d3f;font-size:.95rem}\
  .ac-info small{color:#7a6b78}\
  .ac-row{display:flex;align-items:center;justify-content:space-between;margin-top:8px}\
  .ac-qty{display:inline-flex;align-items:center;border:1.5px solid #e6dce3;border-radius:30px;background:#fff}\
  .ac-qty button{width:30px;height:30px;border:none;background:none;font-size:1.1rem;cursor:pointer;color:#4a1d3f}\
  .ac-qty span{min-width:38px;text-align:center;font-size:.85rem;font-weight:600}\
  .ac-price{color:#c9577a;font-weight:600;font-size:.92rem}\
  .ac-rm{background:none;border:none;color:#a0899c;cursor:pointer;font-size:.75rem;margin-left:8px}\
  .ac-foot{padding:18px 22px;border-top:1px solid #eadfe6;background:#fff}\
  .ac-total{display:flex;justify-content:space-between;font-weight:600;color:#4a1d3f;margin-bottom:4px}\
  .ac-foot p{font-size:.78rem;color:#7a6b78;margin-bottom:14px}\
  .ac-go{display:block;text-align:center;padding:14px;border-radius:50px;background:linear-gradient(135deg,#c9a24b,#b8872e);color:#fff;font-weight:600;box-shadow:0 8px 20px rgba(201,162,75,.4);transition:.3s}\
  .ac-go:hover{transform:translateY(-2px)}\
  .ac-go.disabled{opacity:.5;pointer-events:none}\
  .ac-toast{position:fixed;left:50%;bottom:90px;transform:translate(-50%,30px);background:#2e1027;color:#fff;padding:12px 22px;border-radius:50px;font-size:.88rem;opacity:0;transition:.35s;z-index:400;font-family:'Poppins',sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.3);pointer-events:none}\
  .ac-toast.show{opacity:1;transform:translate(-50%,0)}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* ---------- UI: elements ---------- */
  function build() {
    var nav = document.querySelector(".nav");
    if (nav) {
      var btn = document.createElement("button");
      btn.className = "ac-btn"; btn.setAttribute("aria-label", "Cart");
      btn.innerHTML = '🛒 <span>Cart</span> <b id="acCount">0</b>';
      btn.onclick = Cart.open;
      var burger = nav.querySelector(".burger");
      nav.insertBefore(btn, burger || null);
    }
    var ov = document.createElement("div"); ov.className = "ac-overlay"; ov.id = "acOverlay"; ov.onclick = Cart.close;
    var dr = document.createElement("aside"); dr.className = "ac-drawer"; dr.id = "acDrawer";
    dr.innerHTML =
      '<div class="ac-head"><h3>Your Cart</h3><button class="ac-x" aria-label="Close">×</button></div>' +
      '<div class="ac-list" id="acList"></div>' +
      '<div class="ac-foot"><div class="ac-total"><span>Subtotal</span><span id="acSub">৳ 0</span></div>' +
      '<p>Delivery charge checkout-e hishab hobe.</p>' +
      '<a class="ac-go disabled" id="acGo" href="checkout.html">Checkout korun →</a></div>';
    var tt = document.createElement("div"); tt.className = "ac-toast"; tt.id = "acToast";
    document.body.appendChild(ov); document.body.appendChild(dr); document.body.appendChild(tt);
    dr.querySelector(".ac-x").onclick = Cart.close;

    dr.addEventListener("click", function (e) {
      var t = e.target.closest("[data-act]"); if (!t) return;
      var id = t.getAttribute("data-id");
      var it = items.find(function (x) { return x.id === id; });
      var act = t.getAttribute("data-act");
      if (act === "inc") Cart.setQty(id, it.qty + 0.5);
      if (act === "dec") Cart.setQty(id, it.qty - 0.5);
      if (act === "rm") Cart.remove(id);
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") Cart.close(); });
    render();
  }

  function render() {
    var c = document.getElementById("acCount"); if (!c) return;
    c.textContent = items.length;
    var list = document.getElementById("acList");
    if (!items.length) {
      list.innerHTML = '<div class="ac-empty">🛍️<br>Cart khali.<br>Fabrics page theke kapor add korun.</div>';
    } else {
      list.innerHTML = items.map(function (i) {
        return '<div class="ac-item"><div class="ac-sw" style="background:' + esc(i.color) + '"></div>' +
          '<div class="ac-info"><b>' + esc(i.name) + '</b><small>' + money(i.price) + ' / yard</small>' +
          '<div class="ac-row"><div class="ac-qty"><button data-act="dec" data-id="' + esc(i.id) + '">−</button><span>' + i.qty + ' yd</span><button data-act="inc" data-id="' + esc(i.id) + '">+</button></div>' +
          '<div><span class="ac-price">' + money(i.price * i.qty) + '</span><button class="ac-rm" data-act="rm" data-id="' + esc(i.id) + '">Remove</button></div></div></div></div>';
      }).join("");
    }
    document.getElementById("acSub").textContent = money(Cart.subtotal());
    document.getElementById("acGo").classList.toggle("disabled", !items.length);
  }

  var tTimer;
  function toast(msg) {
    var t = document.getElementById("acToast"); if (!t) return;
    t.textContent = msg; t.classList.add("show");
    clearTimeout(tTimer); tTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
