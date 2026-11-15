(function () {
  const CFG = window.SB_CONFIG, INV = window.SB_INVENTORY, art = window.sareeArt;
  const $ = (s, r) => (r || document).querySelector(s);
  const byId = Object.fromEntries(INV.map(p => [p.id, p]));
  const rupee = n => '₹' + n.toLocaleString('en-IN');
  const offPct = p => Math.round((1 - p.price / p.mrp) * 100);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- saved state (per browser only) ---------- */
  function load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* storage blocked */ } }
  const cart = load('sb.cart', {});
  const wish = new Set(load('sb.wish', []));
  for (const id of Object.keys(cart)) if (!byId[id] || byId[id].stock < 1) delete cart[id];

  const state = { group: 'all', family: 'all', occ: 'all', q: '', sort: 'featured', wishOnly: false };

  const GROUPS = [['all', 'All'], ['kanchi', 'Kanchipuram'], ['silk', 'Other silks'], ['cotton', 'Cotton'], ['linen', 'Linen'], ['sheer', 'Organza and georgette']];
  const FAMILIES = [['all', 'All', ''], ['red', 'Arakku', '#8E1226'], ['pink', 'Rani', '#C2185B'], ['purple', 'Vadamalli', '#7A2A86'],
    ['blue', 'Neelam', '#1F3FA6'], ['green', 'Pachai', '#1E7F5C'], ['yellow', 'Manjal', '#E2A21B'], ['neutral', 'Sandhanam', '#CDB58A'], ['black', 'Karuppu', '#1A1418']];
  const OCCS = [['wedding', 'முகூர்த்தம்', 'Muhurtham', 'KP-106'], ['festival', 'பண்டிகை', 'Festival', 'BN-201'],
    ['office', 'அலுவலகம்', 'Office', 'LN-701'], ['everyday', 'தினசரி', 'Everyday', 'CT-601']];
  const MOTIFS = { butta: 'Butta', mango: 'Mango (manga)', kattam: 'Kattam checks', stripes: 'Vaira oosi stripes', dots: 'Dots', jaal: 'Jaal lattice', plain: 'Plain body' };
  const BORDERS = { temple: 'Temple (korvai)', rettai: 'Rettai pettu double line', broad: 'Broad zari', thin: 'Slim zari' };
  const ZARIS = { gold: 'Gold zari', silver: 'Silver zari', copper: 'Copper zari', thread: 'Thread work' };

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
  }

  /* ---------- filters ---------- */
  function buildChips() {
    $('#groupChips').insertAdjacentHTML('beforeend', GROUPS.map(([k, label]) =>
      `<button class="chip" data-group="${k}" aria-pressed="${k === 'all'}">${label}</button>`).join(''));
    $('#colourChips').insertAdjacentHTML('beforeend', FAMILIES.map(([k, label, hex]) =>
      `<button class="chip swatch" data-family="${k}" aria-pressed="${k === 'all'}">${hex ? `<i style="background:${hex}"></i>` : ''}${label}</button>`).join(''));
    $('#occGrid').innerHTML = OCCS.map(([k, ta, en, hero]) => {
      const n = INV.filter(p => p.occ.includes(k)).length;
      return `<button class="occ" data-occ="${k}" aria-pressed="false">${art(byId[hero])}
        <span class="ta" lang="ta">${ta}</span><span class="en">${en}</span><span class="n">${n} sarees</span></button>`;
    }).join('');
  }

  function visible() {
    const q = state.q.trim().toLowerCase();
    let list = INV.filter(p =>
      (state.group === 'all' || p.group === state.group) &&
      (state.family === 'all' || p.family === state.family) &&
      (state.occ === 'all' || p.occ.includes(state.occ)) &&
      (!state.wishOnly || wish.has(p.id)) &&
      (!q || [p.name, p.weave, p.colour, p.shade, p.origin, p.motif, p.family].join(' ').toLowerCase().includes(q)));
    const sorters = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      save: (a, b) => offPct(b) - offPct(a),
      featured: (a, b) => (b.stock > 0) - (a.stock > 0) || (b.tag === 'pick') - (a.tag === 'pick') || (b.tag === 'new') - (a.tag === 'new')
    };
    return list.slice().sort(sorters[state.sort]);
  }

  function tagsFor(p) {
    let t = '';
    if (p.stock < 1) t += '<span class="tag out">Sold out</span>';
    else if (p.stock <= 3) t += `<span class="tag low">Only ${p.stock} left</span>`;
    if (p.tag === 'new') t += '<span class="tag">New</span>';
    if (p.tag === 'pick') t += '<span class="tag pick">Our pick</span>';
    return t;
  }
  const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7 2.4C19 15.6 12 20 12 20z"/></svg>';

  function cardHTML(p) {
    const w = wish.has(p.id);
    return `<article class="card" data-id="${p.id}">
      <button class="card-art" data-act="view" aria-label="View ${p.name}">${art(p)}<span class="tags">${tagsFor(p)}</span></button>
      <button class="wish" data-act="wish" aria-pressed="${w}" aria-label="${w ? 'Remove from' : 'Add to'} wishlist">${heart}</button>
      <div class="card-body">
        <p class="weave">${p.weave}</p>
        <h3>${p.name}</h3>
        <p class="colour">${p.colour} · ${p.shade}</p>
        <p class="price"><b>${rupee(p.price)}</b><s>${rupee(p.mrp)}</s><span class="off">${offPct(p)}% off</span></p>
        <button class="btn ${p.stock < 1 ? 'ghost' : ''}" data-act="add" ${p.stock < 1 ? 'disabled' : ''}>${p.stock < 1 ? 'Sold out' : 'Add to bag'}</button>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = visible();
    const filtered = state.group !== 'all' || state.family !== 'all' || state.occ !== 'all' || state.q || state.wishOnly;
    $('#grid').innerHTML = list.length ? list.map(cardHTML).join('') :
      `<div class="empty"><p>${state.wishOnly && !wish.size ? 'Your wishlist is empty. Tap the heart on any saree to save it.' : 'No saree matches these filters.'}</p><button class="btn ghost" data-act="clear">Show all sarees</button></div>`;
    const occName = (OCCS.find(o => o[0] === state.occ) || [])[2];
    $('#resultNote').innerHTML = `${list.length} of ${INV.length} sarees${occName ? ` for ${occName.toLowerCase()}` : ''}` +
      (filtered ? ' · <button class="link-btn" data-act="clear">Clear filters</button>' : '');
    reveal($('#grid'));
  }

  function setPressed(sel, attr, val) {
    document.querySelectorAll(sel).forEach(b => b.setAttribute('aria-pressed', String(b.dataset[attr] === val)));
  }
  function clearFilters() {
    Object.assign(state, { group: 'all', family: 'all', occ: 'all', q: '', wishOnly: false });
    $('#q').value = '';
    $('#wishOnly').setAttribute('aria-pressed', 'false');
    setPressed('[data-group]', 'group', 'all'); setPressed('[data-family]', 'family', 'all'); setPressed('[data-occ]', 'occ', 'all');
    renderGrid();
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    const on = !wish.has(id);
    on ? wish.add(id) : wish.delete(id);
    save('sb.wish', [...wish]);
    renderCounts();
    toast(on ? 'Saved to your wishlist' : 'Removed from wishlist');
    return on;
  }

  /* ---------- cart ---------- */
  const cartQty = () => Object.values(cart).reduce((a, b) => a + b, 0);
  function renderCounts() {
    const c = $('#cartCount'), w = $('#wishCount'), n = cartQty();
    c.textContent = n; c.hidden = !n;
    w.textContent = wish.size; w.hidden = !wish.size;
  }

  function addToCart(id, fromEl) {
    const p = byId[id];
    if (!p || p.stock < 1) return;
    if ((cart[id] || 0) >= p.stock) { toast(`Only ${p.stock} in stock, and all are in your bag`); return; }
    cart[id] = (cart[id] || 0) + 1;
    save('sb.cart', cart);
    renderCounts(); renderCart();
    fly(fromEl, p.c.body);
    const sub = subtotal(), left = CFG.freeShipAbove - sub;
    toast(left > 0 ? `Added. ${rupee(left)} more for free shipping` : 'Added. Shipping is free on this order');
  }
  function setQty(id, q) {
    const p = byId[id];
    if (q < 1) delete cart[id]; else cart[id] = Math.min(q, p.stock);
    if (q > p.stock) toast(`Only ${p.stock} in stock`);
    save('sb.cart', cart);
    renderCounts(); renderCart();
  }
  const subtotal = () => Object.entries(cart).reduce((s, [id, q]) => s + byId[id].price * q, 0);

  function orderLink() {
    const lines = Object.entries(cart).map(([id, q]) => `${q} x ${byId[id].name} (${id}) ${rupee(byId[id].price * q)}`);
    const msg = `Hello ${CFG.brand}, I would like to order:\n${lines.join('\n')}\nTotal: ${rupee(subtotal())}`;
    return `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  }

  function renderCart() {
    const ids = Object.keys(cart), sub = subtotal();
    const mrp = ids.reduce((s, id) => s + byId[id].mrp * cart[id], 0);
    const left = CFG.freeShipAbove - sub;
    $('#shipMsg').textContent = !ids.length ? `Free shipping above ${rupee(CFG.freeShipAbove)}` :
      left > 0 ? `Add ${rupee(left)} more for free shipping` : 'You have free shipping on this order';
    $('#shipFill').style.width = Math.min(100, sub / CFG.freeShipAbove * 100) + '%';
    $('#lines').innerHTML = ids.length ? ids.map(id => {
      const p = byId[id], q = cart[id];
      return `<div class="line" data-id="${id}">
        <div class="line-art">${art(p)}</div>
        <div><h3>${p.name}</h3><small>${p.weave} · ${p.colour}</small><br>
          <span class="qty"><button data-act="dec" aria-label="Reduce quantity">−</button><span>${q}</span><button data-act="inc" aria-label="Increase quantity">+</button></span></div>
        <div class="amt">${rupee(p.price * q)}</div>
      </div>`;
    }).join('') : `<div class="cart-empty"><p>Your bag is empty.</p><button class="btn ghost" data-close>Browse the collection</button></div>`;
    $('#cartFoot').hidden = !ids.length;
    $('#cartFoot').innerHTML = ids.length ? `
      <div class="sum"><span>MRP total</span><span>${rupee(mrp)}</span></div>
      <div class="sum save"><span>You save</span><span>${rupee(mrp - sub)}</span></div>
      <div class="sum"><span>Shipping</span><span>${left > 0 ? 'Added at checkout' : 'Free'}</span></div>
      <div class="sum total"><span>Subtotal</span><span>${rupee(sub)}</span></div>
      <a class="btn block" href="${orderLink()}" target="_blank" rel="noopener">Order on WhatsApp</a>
      <p class="fineprint">Demo checkout. This opens WhatsApp with your order typed out. No payment is taken.</p>` : '';
  }

  function fly(fromEl, colour) {
    const bag = $('#cartBtn');
    bag.classList.remove('bump'); void bag.offsetWidth; bag.classList.add('bump');
    if (reduceMotion || !fromEl || !fromEl.animate) return;
    const a = fromEl.getBoundingClientRect(), b = bag.getBoundingClientRect();
    const dot = document.createElement('div');
    dot.className = 'fly'; dot.style.background = colour;
    dot.style.left = a.left + a.width / 2 - 13 + 'px'; dot.style.top = a.top + a.height / 2 - 13 + 'px';
    (fromEl.closest('dialog') || document.body).appendChild(dot);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    dot.animate([
      { transform: 'translate(0,0) scale(1)', opacity: 1 },
      { transform: `translate(${dx * .5}px, ${dy * .5 - 70}px) scale(1.3)`, opacity: 1, offset: .5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.3)`, opacity: .4 }
    ], { duration: 650, easing: 'cubic-bezier(.3,.6,.4,1)' }).onfinish = () => dot.remove();
  }

  /* ---------- quick view ---------- */
  function openQV(id) {
    const p = byId[id];
    const stock = p.stock < 1 ? '<p class="stock out">Sold out. Message us and we will ask the weaver for the next piece.</p>' :
      p.stock <= 3 ? `<p class="stock low">Only ${p.stock} left in this colour</p>` : '<p class="stock ok">In stock, ships in 48 hours</p>';
    const ask = `https://wa.me/${CFG.whatsappNumber}?text=${encodeURIComponent(`Hello ${CFG.brand}, please share a video of ${p.name} (${p.id}).`)}`;
    $('#qvIn').innerHTML = `
      <div class="qv-art">${art(p)}</div>
      <div class="qv-info" data-id="${p.id}">
        <p class="weave">${p.weave} · ${p.origin}</p>
        <h2>${p.name}</h2>
        <p class="colour">${p.colour} · ${p.shade}</p>
        <p class="price"><b>${rupee(p.price)}</b><s>${rupee(p.mrp)}</s><span class="off">You save ${rupee(p.mrp - p.price)}</span></p>
        ${stock}
        <dl class="specs">
          <dt>Body</dt><dd>${MOTIFS[p.motif]}</dd>
          <dt>Border</dt><dd>${BORDERS[p.border]}</dd>
          <dt>Zari</dt><dd>${ZARIS[p.zari]}</dd>
          <dt>Length</dt><dd>5.5 m saree with 0.8 m blouse piece</dd>
          <dt>Code</dt><dd>${p.id}</dd>
        </dl>
        <div class="qv-actions">
          <button class="btn block" data-act="add" ${p.stock < 1 ? 'disabled' : ''}>${p.stock < 1 ? 'Sold out' : 'Add to bag'}</button>
          <a class="btn ghost block" href="${ask}" target="_blank" rel="noopener">Ask for a video on WhatsApp</a>
        </div>
        <p class="perk">${p.group === 'kanchi' || p.group === 'silk' ? 'Free fall and pico stitching. ' : ''}${p.price >= CFG.freeShipAbove ? 'Free shipping. ' : ''}7 day returns.</p>
      </div>`;
    $('#qv').showModal();
  }

  /* ---------- events ---------- */
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-act],[data-close],[data-group],[data-family],[data-occ],[data-view]');
    if (e.target.tagName === 'DIALOG') { e.target.close(); return; } // backdrop tap
    if (!t) return;
    if (t.hasAttribute('data-close')) { t.closest('dialog').close(); return; }
    if (t.dataset.view) { openQV(t.dataset.view); return; }
    if (t.dataset.group) { state.group = t.dataset.group; setPressed('[data-group]', 'group', state.group); renderGrid(); return; }
    if (t.dataset.family) { state.family = t.dataset.family; setPressed('[data-family]', 'family', state.family); renderGrid(); return; }
    if (t.dataset.occ) {
      state.occ = state.occ === t.dataset.occ ? 'all' : t.dataset.occ;
      setPressed('[data-occ]', 'occ', state.occ); renderGrid();
      $('#collection').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      return;
    }
    const holder = t.closest('[data-id]'), id = holder && holder.dataset.id;
    switch (t.dataset.act) {
      case 'view': openQV(id); break;
      case 'add': addToCart(id, t); break;
      case 'wish': {
        const on = toggleWish(id);
        t.setAttribute('aria-pressed', String(on));
        t.setAttribute('aria-label', (on ? 'Remove from' : 'Add to') + ' wishlist');
        if (state.wishOnly) renderGrid();
        break;
      }
      case 'inc': setQty(id, cart[id] + 1); break;
      case 'dec': setQty(id, cart[id] - 1); break;
      case 'clear': clearFilters(); break;
    }
  });
  $('#q').addEventListener('input', e => { state.q = e.target.value; renderGrid(); });
  $('#sort').addEventListener('change', e => { state.sort = e.target.value; renderGrid(); });
  $('#wishOnly').addEventListener('click', e => {
    state.wishOnly = !state.wishOnly;
    e.currentTarget.setAttribute('aria-pressed', String(state.wishOnly));
    renderGrid();
  });
  $('#wishBtn').addEventListener('click', () => {
    state.wishOnly = true; $('#wishOnly').setAttribute('aria-pressed', 'true');
    renderGrid(); $('#collection').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  $('#cartBtn').addEventListener('click', () => { renderCart(); $('#cart').showModal(); });
  $('#clubForm').addEventListener('submit', e => {
    e.preventDefault();
    const digits = $('#clubPhone').value.replace(/\D/g, '');
    const note = $('#clubNote');
    if (digits.length < 10) { note.textContent = 'Enter a 10 digit mobile number.'; $('#clubPhone').focus(); return; }
    note.textContent = 'Thanks. In the live store this number joins the WhatsApp list. The demo stores nothing.';
    e.target.reset();
  });
  $('#parts').addEventListener('click', e => {
    const b = e.target.closest('.part'); if (!b) return;
    setZone(b.dataset.zone);
  });
  function setZone(z) {
    document.querySelectorAll('.part').forEach(p => p.setAttribute('aria-pressed', String(p.dataset.zone === z)));
    document.querySelectorAll('#anatomyArt .zone').forEach(r => r.classList.toggle('on', r.dataset.zone === z));
  }

  /* ---------- scroll reveal (visible by default; only below-fold items animate in) ---------- */
  const io = 'IntersectionObserver' in window && !reduceMotion ? new IntersectionObserver(entries => {
    entries.forEach((en, i) => {
      if (!en.isIntersecting) return;
      en.target.style.transitionDelay = Math.min(i, 6) * 60 + 'ms';
      en.target.classList.remove('pre');
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function reveal(root) {
    if (!io) return;
    root.querySelectorAll('.card, .occ, .part, .promise').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('pre', 'rev'); io.observe(el); }
    });
  }

  /* ---------- hero: flowing silk ---------- */
  function silk(canvas) {
    const ctx = canvas.getContext('2d');
    const R = [
      { c: ['#B01E56', '#6E0F3C'], y: .26, a: .11, th: .22, s: .25, k: 1.2, p: 0 },
      { c: ['#0E6C74', '#0A3F4A'], y: .6, a: .12, th: .18, s: .18, k: .9, p: 2 },
      { c: ['#E2A21B', '#A9661A'], y: .88, a: .07, th: .11, s: .3, k: 1.6, p: 4 }
    ];
    let w = 0, h = 0, raf = 0, on = true;
    function size() {
      const d = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * d; canvas.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    function path(pts) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); }
    function draw(t) {
      ctx.clearRect(0, 0, w, h);
      for (const r of R) {
        const top = [], bot = [], inTop = [], inBot = [];
        for (let x = -20; x <= w + 20; x += 14) {
          const u = x / w * Math.PI * 2 * r.k;
          const yc = h * r.y + h * r.a * Math.sin(u + t * r.s + r.p) + h * r.a * .4 * Math.sin(u * 2.3 - t * r.s * 1.4 + r.p);
          const th = h * r.th * (.55 + .45 * Math.sin(u * .8 + t * r.s * .7 + r.p * 2));
          top.push([x, yc - th / 2]); bot.push([x, yc + th / 2]);
          inTop.push([x, yc - th / 2 + th * .12]); inBot.push([x, yc + th / 2 - th * .12]);
        }
        const g = ctx.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, r.c[0]); g.addColorStop(.5, r.c[1]); g.addColorStop(1, r.c[0]);
        path(top.concat(bot.slice().reverse())); ctx.closePath();
        ctx.globalAlpha = .9; ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = '#D9A93A'; ctx.globalAlpha = .95;
        ctx.lineWidth = 3; path(top); ctx.stroke(); path(bot); ctx.stroke();
        ctx.lineWidth = 1; path(inTop); ctx.stroke(); path(inBot); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    function loop(ms) { draw(ms / 1000); if (on) raf = requestAnimationFrame(loop); }
    size(); draw(3);
    addEventListener('resize', () => { size(); draw(performance.now() / 1000); });
    if (reduceMotion) return;
    new IntersectionObserver(([en]) => {
      on = en.isIntersecting; cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  /* ---------- boot ---------- */
  const track = $('#marquee');
  track.innerHTML += track.innerHTML; // second copy makes the loop seamless
  buildChips();
  $('#fan').innerHTML = ['KP-102', 'KP-103', 'KP-106'].map(id =>
    `<button data-view="${id}" aria-label="View ${byId[id].name}">${art(byId[id])}</button>`).join('');
  $('#anatomyArt').innerHTML = art(byId['KP-104'], { zones: true });
  setZone('pallu');
  $('#invCount').textContent = INV.length;
  renderGrid(); renderCounts(); renderCart();
  reveal(document);
  silk($('#silk'));
})();
