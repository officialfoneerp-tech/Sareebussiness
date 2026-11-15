/* Draws a saree as SVG from its data: body (udal), borders (karai), pallu (mundhanai),
   motif and zari. Placeholder for product photos until real ones are shot. */
(function () {
  const ZARI = { gold: '#D9A93A', silver: '#C9CCD3', copper: '#C27A45', thread: '#F1E4BE' };
  let uid = 0;

  function motif(id, kind, z) {
    const line = `stroke="${z}" fill="none" stroke-width="1.4"`;
    const tiles = {
      butta: [40, `<path d="M10 4l4 6-4 6-4-6zM30 24l4 6-4 6-4-6z" fill="${z}"/>`],
      mango: [48, `<path d="M24 10c9 2 12 12 7 19-4 5-12 5-14 0-2-5 1-9 5-9 3 0 4 3 2 5" ${line}/><circle cx="24" cy="10" r="1.7" fill="${z}"/>`],
      kattam: [32, `<path d="M0 .8H32M.8 0V32" stroke="${z}" stroke-width="1.6"/><path d="M0 16H32M16 0V32" stroke="${z}" stroke-width=".6" opacity=".6"/>`],
      stripes: [12, `<path d="M3 0V12" stroke="${z}" stroke-width="1.2"/>`],
      dots: [22, `<circle cx="5" cy="5" r="2" fill="${z}"/><circle cx="16" cy="16" r="2" fill="${z}"/>`],
      jaal: [32, `<path d="M16 0L32 16 16 32 0 16z" ${line}/><circle cx="16" cy="16" r="2.4" fill="${z}"/>`]
    };
    const t = tiles[kind];
    return t ? `<pattern id="${id}" width="${t[0]}" height="${t[0]}" patternUnits="userSpaceOnUse">${t[1]}</pattern>` : '';
  }

  function borderBand(style, col, z) {
    let inner = '';
    if (style === 'temple') {
      let tri = '';
      for (let y = 0; y < 400; y += 20) tri += `M43 ${y}l14 10-14 10z`;
      inner = `<rect x="6" width="3" height="400" fill="${z}"/><rect x="14" width="14" height="400" fill="${z}" opacity=".92"/><rect x="33" width="2" height="400" fill="${z}"/><path d="${tri}" fill="${col}"/>`;
    } else if (style === 'rettai') {
      inner = `<rect x="10" width="5" height="400" fill="${z}"/><rect x="22" width="5" height="400" fill="${z}"/>`;
    } else if (style === 'broad') {
      let dia = '';
      for (let y = 4; y < 400; y += 22) dia += `M20 ${y}l6 8-6 8-6-8z`;
      inner = `<rect x="5" width="30" height="400" fill="${z}"/><path d="${dia}" fill="${col}"/>`;
    } else {
      inner = `<rect x="30" width="6" height="400" fill="${z}"/>`;
    }
    return `<rect width="44" height="400" fill="${col}"/>${inner}`;
  }

  function pallu(col, z) {
    const stripes = [[6, 5], [16, 1.5], [24, 12], [42, 1.5], [50, 3], [98, 3], [106, 1.5], [112, 10], [127, 5]];
    let out = `<rect x="44" width="212" height="132" fill="${col}"/>`;
    for (const [y, h] of stripes) out += `<rect x="44" y="${y}" width="212" height="${h}" fill="${z}"/>`;
    let big = '', small = '';
    for (let x = 62; x < 250; x += 28) {
      big += `M${x} 59l9 15-9 15-9-15z`;
      small += `M${x} 68l3.5 6-3.5 6-3.5-6z`;
    }
    return out + `<path d="${big}" fill="${z}"/><path d="${small}" fill="${col}"/>`;
  }

  window.sareeArt = function (p, opts) {
    const zones = opts && opts.zones;
    const u = 'sa' + (++uid);
    const z = ZARI[p.zari] || ZARI.gold;
    const c = p.c;
    return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${p.name}: ${p.shade} ${p.weave} saree">
<defs>
${motif(u + 'm', p.motif, z)}
<linearGradient id="${u}g" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".13"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
<pattern id="${u}p" width="100" height="400" patternUnits="userSpaceOnUse"><rect width="100" height="400" fill="url(#${u}g)"/></pattern>
<linearGradient id="${u}v" x1="0" x2="0" y1="0" y2="1"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".25"/></linearGradient>
<linearGradient id="${u}s" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<g id="${u}b">${borderBand(p.border, c.border, z)}</g>
</defs>
<rect width="300" height="400" fill="${c.body}"/>
${p.motif !== 'plain' ? `<rect x="44" y="132" width="212" height="268" fill="url(#${u}m)" opacity=".85"/>` : ''}
${pallu(c.pallu, z)}
<use href="#${u}b"/><use href="#${u}b" transform="translate(300 0) scale(-1 1)"/>
<rect width="300" height="400" fill="url(#${u}p)"/>
<rect width="300" height="400" fill="url(#${u}v)"/>
<g transform="skewX(-18)"><rect class="sheen" x="-140" width="110" height="400" fill="url(#${u}s)"/></g>
${zones ? `<rect class="zone" data-zone="pallu" x="44" y="0" width="212" height="132"/><rect class="zone" data-zone="body" x="44" y="132" width="212" height="268"/><path class="zone" data-zone="border" d="M0 0h44v400h-44zM256 0h44v400h-44z"/>` : ''}
</svg>`;
  };
})();
