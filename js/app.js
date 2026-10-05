(function(){
  var C = [], P = {}, WA = "", cart = {};
  var $ = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var inr = function(n){ return "₹" + n.toLocaleString("en-IN"); };
  var esc = function(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  function load(k, d){ try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch(e){ return d; } }
  function save(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var EASE = "cubic-bezier(.16,1,.3,1)";

  // ---------- shop data (built from the admin's content into data/shop.json) ----------
  function prepare(data){
    WA = data.whatsapp_number;
    C = (data.sections || []).map(function(s){
      return { id: s.id, name: s.name, intro: s.intro || "", art: s.art || "jar", color: s.color || "#6A4428",
        homeTitle: s.note_title, homeNote: s.note_text, homeImage: s.note_image,
        items: data.products.filter(function(p){ return p.section === s.id; }) };
    }).filter(function(c){ return c.items.length; });
    var seed = 0;
    C.forEach(function(c){ c.items.forEach(function(it){
      P[it.id] = Object.assign({ col: c, art: c.art, seed: seed++, tint: it.colour || c.color }, it);
    }); });
    cart = load("tasha-cart-v3", {});
    Object.keys(cart).forEach(function(k){ if (!P[k] || !P[k].available || !(cart[k] > 0)) delete cart[k]; });
  }

  function media(p){
    return window.drawProduct(p, p.seed) + (p.photo ? '<img src="' + esc(p.photo) + '" alt="' + esc(p.name) + '" loading="lazy" onerror="this.remove()">' : "");
  }

  // ---------- hero scenes + parallax ----------
  $("#heroScene").innerHTML = window.drawScene("hero");
  $$("[data-scene]").forEach(function(el){ el.innerHTML = window.drawScene(el.dataset.scene); });

  var layers = $$("#heroScene .layer"), bar = $("#bar"), ticking = false, parallaxOn = false;
  function onScroll(){
    var y = window.scrollY;
    bar.classList.toggle("solid", y > 40);
    if (parallaxOn && y < 1200) layers.forEach(function(l){ l.style.transform = "translateY(" + (y * parseFloat(l.dataset.depth || 0)).toFixed(1) + "px)"; });
    ticking = false;
  }
  window.addEventListener("scroll", function(){ if (!ticking){ ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  // hand the layers over to parallax once the entrance has finished
  setTimeout(function(){ layers.forEach(function(l){ l.style.animation = "none"; }); parallaxOn = !reduce; onScroll(); }, reduce ? 0 : 1900);
  onScroll();

  // ---------- the Gurez year ----------
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  var rows = [
    ["Road over the pass", [[1,4,"closed","Snowed in"],[5,10,"open","Open"],[11,12,"closed","Snowed in"]]],
    ["In the fields", [[5,10,"work","Sowing, harvest, honey and walnuts"]]],
    ["At home", [[1,4,"craft","Weaving and stitching"],[11,12,"craft","Weaving"]]]
  ];
  var yg = '<div></div>' + months.map(function(m){ return '<div class="m">' + m + '</div>'; }).join("");
  rows.forEach(function(r, ri){
    yg += '<div class="row-l" style="grid-row:' + (ri + 2) + '">' + r[0] + '</div>';
    r[1].forEach(function(s){ yg += '<div class="seg ' + s[2] + '" style="--m:' + (s[0] - 1) + ';grid-row:' + (ri + 2) + ';grid-column:' + (s[0] + 1) + '/' + (s[1] + 2) + '">' + s[3] + '</div>'; });
  });
  $("#yearGrid").innerHTML = yg;
  var year = $(".year");
  if (!reduce && "IntersectionObserver" in window && year.getBoundingClientRect().top > window.innerHeight){
    year.classList.add("pre");
    var yo = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ year.classList.add("play"); year.classList.remove("pre"); yo.disconnect(); } }, { threshold: 0.35 });
    yo.observe(year);
  }


  function init(data){
    prepare(data);
    // ---------- shop ----------
    $("#tabs").innerHTML = '<span class="tab-ink" aria-hidden="true"></span>' + C.map(function(c){ return '<a class="tab" href="#c-' + c.id + '" data-c="' + c.id + '" style="--c:' + c.color + '"><i></i>' + c.name + '</a>'; }).join("");
    $("#shelves").innerHTML = C.map(function(c){
      var cards = c.items.map(function(it){
        var p = P[it.id];
        return '<article class="card" data-open="' + p.id + '">' +
          '<div class="card-media" style="--tint-bg:' + window.tintBg(p.tint) + '">' + media(p) + (p.available ? "" : '<span class="badge">Sold out</span>') +
            '<p class="card-note">' + esc(p.note) + '<br><span>Read more</span></p></div>' +
          '<div class="card-info"><h4><button type="button" data-open="' + p.id + '">' + esc(p.name) + '</button></h4>' +
          '<p class="pp"><b>' + inr(p.price) + '</b>' + esc(p.pack) + '</p>' +
          '<div class="card-act ctl" data-id="' + p.id + '"></div></div></article>';
      }).join("");
      var home = c.homeNote ? '<div class="home-note"><img src="' + esc(c.homeImage) + '" alt="" loading="lazy"><div><h4>' + esc(c.homeTitle) + '</h4><p>' + esc(c.homeNote) + '</p></div></div>' : "";
      return '<div class="shelf" id="c-' + c.id + '" style="--c:' + c.color + '"><div class="shelf-head"><h3>' + c.name + '</h3><p>' + esc(c.intro) + '</p></div><div class="grid">' + cards + '</div>' + home + '</div>';
    }).join("");

    function ctlHTML(id, short){
      if (!P[id].available) return '<a class="add soldout" href="https://wa.me/' + WA + '?text=' + encodeURIComponent("Hi! Is " + P[id].name + " (" + P[id].pack + ") back in stock?") + '" target="_blank" rel="noopener">Sold out · ask us</a>';
      var q = cart[id] || 0;
      return q ? '<div class="stepper"><button type="button" data-act="dec" data-id="' + id + '" aria-label="One less ' + esc(P[id].name) + '">−</button><span>' + q + (short ? "" : " in cart") + '</span><button type="button" data-act="inc" data-id="' + id + '" aria-label="One more ' + esc(P[id].name) + '">+</button></div>'
               : '<button class="add" type="button" data-act="inc" data-id="' + id + '">Add to cart</button>';
    }
    function setQty(id, q){ if (q <= 0) delete cart[id]; else cart[id] = Math.min(q, 99); save("tasha-cart-v3", cart); refresh(id); }

    // a stitch-diamond travels from the button to the cart
    function flyToCart(from){
      var cb = $("#openCart");
      function bump(){ cb.classList.remove("bump"); void cb.offsetWidth; cb.classList.add("bump"); }
      if (reduce || !from.animate) { bump(); return; }
      var a = from.getBoundingClientRect(), b = cb.getBoundingClientRect();
      var x0 = a.left + a.width/2 - 8, y0 = a.top + a.height/2 - 8, x1 = b.right - 26, y1 = b.top + b.height/2 - 8;
      var d = document.createElement("span"); d.className = "fly"; document.body.appendChild(d);
      var mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 120;
      d.animate([
        { transform: "translate(" + x0 + "px," + y0 + "px) rotate(45deg) scale(.4)", opacity: 0 },
        { transform: "translate(" + x0 + "px," + (y0 - 20) + "px) rotate(45deg) scale(1.1)", opacity: 1, offset: .15 },
        { transform: "translate(" + mx + "px," + my + "px) rotate(225deg) scale(1)", offset: .55 },
        { transform: "translate(" + x1 + "px," + y1 + "px) rotate(405deg) scale(.5)", opacity: .9 }
      ], { duration: 720, easing: "cubic-bezier(.45,.05,.3,1)" }).onfinish = function(){ d.remove(); bump(); };
    }

    document.addEventListener("click", function(e){
      var a = e.target.closest("[data-act]");
      if (a){
        e.stopPropagation();
        var id = a.dataset.id, q = cart[id] || 0;
        if (a.dataset.act === "inc"){ if (!q){ flyToCart(a); toast(P[id].name + " added to your cart"); } setQty(id, q + 1); }
        if (a.dataset.act === "dec"){ if (q === 1 && a.closest(".line")) return removeLine(id); setQty(id, q - 1); }
        if (a.dataset.act === "rm") removeLine(id);
        return;
      }
      var o = e.target.closest("[data-open]");
      if (o) openSheet(o.dataset.open, o.closest(".card"));
      if (e.target.closest("[data-close]")) closeSheet();
    });

    // ---------- product sheet (card image morphs into the sheet) ----------
    var sheet = $("#sheet"), current = null, sourceMedia = null;
    function fillSheet(p){
      var art = $("#sheetArt");
      art.style.setProperty("--tint-bg", window.tintBg(p.tint));
      art.innerHTML = media(p);
      $("#sheetCol").textContent = p.col.name;
      $("#sheetTitle").textContent = p.name;
      $("#sheetPrice").textContent = inr(p.price);
      $("#sheetPack").textContent = p.pack;
      $("#sheetStory").textContent = p.note + " " + p.story;
      $("#sheetUses").innerHTML = p.uses.map(function(u){ return "<li>" + esc(u) + "</li>"; }).join("");
      $("#sheetKeep").textContent = p.keep || "";
      $("#sheetKeep").hidden = !p.keep;
      var why = p.why || p.col.homeNote;
      $("#sheetWhy").hidden = !why;
      $("#sheetWhyTitle").textContent = p.why ? "Why people keep it" : (p.col.homeTitle || "Good to know");
      $("#sheetWhyText").textContent = why || "";
      $("#sheetCtl").innerHTML = ctlHTML(p.id);
    }
    function show(){ if (typeof sheet.showModal === "function") sheet.showModal(); else sheet.setAttribute("open", ""); }
    function openSheet(id, card){
      var p = P[id]; current = id;
      sourceMedia = card ? $(".card-media", card) : null;
      if (!reduce && document.startViewTransition && sourceMedia){
        sheet.classList.add("vt");
        sourceMedia.style.viewTransitionName = "product-art";
        document.startViewTransition(function(){
          sourceMedia.style.viewTransitionName = "";
          fillSheet(p); show();
          $("#sheetArt").style.viewTransitionName = "product-art";
        }).finished.then(function(){ $("#sheetArt").style.viewTransitionName = ""; sheet.classList.remove("vt"); });
      } else { fillSheet(p); show(); }
    }
    function closeSheet(){
      if (!sheet.open) return;
      var visible = sourceMedia && sourceMedia.getBoundingClientRect().bottom > 0 && sourceMedia.getBoundingClientRect().top < window.innerHeight;
      if (!reduce && document.startViewTransition && visible){
        $("#sheetArt").style.viewTransitionName = "product-art";
        document.startViewTransition(function(){
          $("#sheetArt").style.viewTransitionName = "";
          sheet.close();
          sourceMedia.style.viewTransitionName = "product-art";
        }).finished.then(function(){ if (sourceMedia) sourceMedia.style.viewTransitionName = ""; });
      } else if (!reduce) {
        sheet.classList.add("closing");
        setTimeout(function(){ sheet.classList.remove("closing"); sheet.close(); }, 200);
      } else sheet.close();
    }
    sheet.addEventListener("cancel", function(e){ e.preventDefault(); closeSheet(); });
    sheet.addEventListener("click", function(e){ if (e.target === sheet) closeSheet(); });
    sheet.addEventListener("close", function(){ current = null; });

    // ---------- cart ----------
    function totals(){ var n = 0, s = 0; for (var id in cart){ n += cart[id]; s += cart[id] * P[id].price; } return { n: n, s: s }; }
    function field(id){ return $("#" + id).value.trim(); }
    function orderText(){
      var t = "Hello Tasha Enterprises! I'd like to order:\n\n", i = 1;
      for (var id in cart){ var p = P[id]; t += i++ + ". " + p.name + " (" + p.pack + ") x " + cart[id] + " = " + inr(p.price * cart[id]) + "\n"; }
      t += "\nSubtotal: " + inr(totals().s) + "\n";
      if (field("cName")) t += "\nName: " + field("cName");
      if (field("cAddr")) t += "\nAddress: " + field("cAddr");
      if (field("cNote")) t += "\nNote: " + field("cNote");
      return t + "\n\nPlease confirm the delivery charge and how to pay.";
    }
    function updateWa(){
      var has = Object.keys(cart).length > 0, wa = $("#waBtn");
      wa.setAttribute("aria-disabled", has ? "false" : "true");
      wa.href = has ? "https://wa.me/" + WA + "?text=" + encodeURIComponent(orderText()) : "#";
    }
    function lineHTML(id){
      var p = P[id];
      return '<div class="line" data-line="' + id + '"><div class="line-art" style="--tint-bg:' + window.tintBg(p.tint) + '">' + media(p) + '</div>' +
        '<div><div class="nm">' + esc(p.name) + '</div><div class="sub">' + esc(p.pack) + ' · ' + inr(p.price) + ' each</div></div><div class="lp">' + inr(p.price * cart[id]) + '</div>' +
        '<div class="ctl-row">' + ctlHTML(id, true) + '<button class="rm" type="button" data-act="rm" data-id="' + id + '">Remove</button></div></div>';
    }
    var EMPTY = '<div class="empty"><b>Nothing here yet</b>Add something from the shop and it will show up here.</div>';
    function renderLines(changed){
      var box = $("#lines"), ids = Object.keys(cart);
      if (!ids.length){ box.innerHTML = EMPTY; return; }
      // update in place so only the changed line moves
      if (changed && box.querySelector('[data-line="' + changed + '"]') && cart[changed]){
        var old = box.querySelector('[data-line="' + changed + '"]'), tmp = document.createElement("div");
        tmp.innerHTML = lineHTML(changed); var nu = tmp.firstChild; nu.style.animation = "none";
        old.replaceWith(nu); return;
      }
      box.innerHTML = ids.map(lineHTML).join("");
    }
    function removeLine(id){
      var el = $('[data-line="' + id + '"]');
      if (el && !reduce){ el.classList.add("leaving"); setTimeout(function(){ setQty(id, 0); }, 200); }
      else setQty(id, 0);
    }
    function refresh(changed){
      $$(".ctl").forEach(function(el){ el.innerHTML = ctlHTML(el.dataset.id); });
      if (current) $("#sheetCtl").innerHTML = ctlHTML(current);
      var t = totals();
      $("#cartCount").textContent = t.n;
      $("#floatCount").textContent = t.n + (t.n === 1 ? " item" : " items");
      $("#floatTot").textContent = inr(t.s);
      $("#subtotal").textContent = inr(t.s);
      $("#floater").hidden = t.n === 0 || !$("#drawer").hidden;
      if (!$("#drawer").hidden || !changed) renderLines(changed);
      if (changed) $$('.stepper span').forEach(function(sp){ if (sp.parentNode.querySelector('[data-id="' + changed + '"]')) { sp.classList.remove("tick"); void sp.offsetWidth; sp.classList.add("tick"); } });
      updateWa();
    }
    ["cName","cAddr","cNote"].forEach(function(id){
      var el = $("#" + id), v = load("tasha-" + id, "");
      if (v) el.value = v;
      el.addEventListener("input", function(){ save("tasha-" + id, el.value); updateWa(); });
    });
    $("#details").addEventListener("submit", function(e){ e.preventDefault(); });

    var drawer = $("#drawer"), scrim = $("#scrim"), lastFocus = null;
    function openCart(){
      if (sheet.open) sheet.close();
      lastFocus = document.activeElement;
      drawer.hidden = false; scrim.hidden = false; document.body.style.overflow = "hidden";
      renderLines(); refresh(); $("#closeCart").focus();
    }
    function closeCart(){
      function done(){ drawer.classList.remove("closing"); scrim.classList.remove("closing"); drawer.hidden = true; scrim.hidden = true; document.body.style.overflow = ""; refresh(); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
      if (reduce) return done();
      drawer.classList.add("closing"); scrim.classList.add("closing"); setTimeout(done, 220);
    }
    $("#openCart").addEventListener("click", openCart);
    $("#floatBtn").addEventListener("click", openCart);
    $("#closeCart").addEventListener("click", closeCart);
    scrim.addEventListener("click", closeCart);
    document.addEventListener("keydown", function(e){
      if (drawer.hidden) return;
      if (e.key === "Escape") closeCart();
      if (e.key === "Tab"){ // keep focus inside the open cart
        var f = $$('button, a[href], input, textarea', drawer).filter(function(el){ return !el.disabled && el.offsetParent !== null && el.getAttribute("aria-disabled") !== "true"; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
      }
    });
    $("#waBtn").addEventListener("click", function(e){ if (!Object.keys(cart).length) e.preventDefault(); else updateWa(); });
    $("#copyBtn").addEventListener("click", function(){
      if (!Object.keys(cart).length){ toast("Your cart is empty"); return; }
      var text = orderText();
      var fallback = function(){ var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); toast("Order copied. Paste it into WhatsApp."); } catch(_){ toast("Couldn't copy. Select the text and copy it."); } ta.remove(); };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(function(){ toast("Order copied. Paste it into WhatsApp."); }, fallback); else fallback();
    });

    var tt; function toast(m){ var el = $("#toast"); el.hidden = true; void el.offsetWidth; el.textContent = m; el.hidden = false; clearTimeout(tt); tt = setTimeout(function(){ el.hidden = true; }, 2200); }

    // footer contacts
    $("#footWa").href = "https://wa.me/" + WA; $("#footWaNum").textContent = data.whatsapp_display;
    $("#footIg").href = "https://www.instagram.com/" + data.instagram + "/"; $("#footIgName").textContent = data.instagram;

    // ---------- collection tabs: the dark pill slides to the section you're in ----------
    var rail = $("#tabs"), ink = $(".tab-ink");
    function moveInk(tab){
      if (!tab) return;
      ink.style.width = tab.offsetWidth + "px";
      ink.style.transform = "translateX(" + tab.offsetLeft + "px)";
      var r1 = tab.getBoundingClientRect(), r2 = rail.getBoundingClientRect();
      if (r1.left < r2.left || r1.right > r2.right) rail.scrollBy({ left: r1.left - r2.left - 24, behavior: reduce ? "auto" : "smooth" });
    }
    function setTab(id){
      var act = null;
      $$(".tab").forEach(function(t){ var on = t.dataset.c === id; t.setAttribute("aria-current", on ? "true" : "false"); if (on) act = t; });
      moveInk(act);
    }
    if ("IntersectionObserver" in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) setTab(en.target.id.slice(2)); }); }, { rootMargin: "-45% 0px -50% 0px" });
      $$(".shelf").forEach(function(s){ io.observe(s); });
    } else rail.classList.add("no-ink");
    setTab(C[0].id);
    window.addEventListener("resize", function(){ moveInk($('.tab[aria-current="true"]')); });
    if (document.fonts) document.fonts.ready.then(function(){ moveInk($('.tab[aria-current="true"]')); });

    refresh();
  }

  // ---------- load the shop ----------
  var shelves = $("#shelves");
  shelves.innerHTML = '<p class="shop-state">Loading this season\u2019s harvest\u2026</p>';
  fetch("data/shop.json", { cache: "no-cache" })
    .then(function(r){ if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(init)
    .catch(function(){
      shelves.innerHTML = '<div class="shop-state"><b>The shop didn\u2019t load.</b> Check your connection and refresh the page. You can also message us on WhatsApp and we\u2019ll take your order there.</div>';
    });
})();
