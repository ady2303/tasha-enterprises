/* Paper-cut illustrations of Gurez and product drawings.
   These are stand-ins: any real photo placed in /images with the matching name covers them. */
(function(){
  function rng(seed){ return function(){ seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

  function ridge(R, W, y0, amp, freq, step){
    var ph = R()*10, ph2 = R()*10, pts = [];
    for (var x = -20; x <= W + 20; x += step){
      var y = y0 + Math.sin(x / W * Math.PI * freq + ph) * amp + Math.sin(x / W * Math.PI * freq * 3.7 + ph2) * amp * 0.28;
      pts.push([x, y]);
    }
    return pts;
  }
  function ridgePath(pts, H){ return "M-20 " + H + " " + pts.map(function(p){ return "L" + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + " L" + (pts[pts.length-1][0]) + " " + H + "Z"; }
  function yAt(pts, x){ for (var i = 1; i < pts.length; i++){ if (pts[i][0] >= x){ var a = pts[i-1], b = pts[i], t = (x - a[0]) / (b[0] - a[0]); return a[1] + (b[1]-a[1]) * t; } } return pts[pts.length-1][1]; }
  function deodar(x, y, h){
    var w = h * 0.36, s = "";
    for (var k = 0; k < 4; k++){ var top = y - h + k * h * 0.2, bw = w * (0.45 + k * 0.2); s += "M" + x.toFixed(1) + " " + top.toFixed(1) + "L" + (x - bw).toFixed(1) + " " + (top + h*0.34).toFixed(1) + "L" + (x + bw).toFixed(1) + " " + (top + h*0.34).toFixed(1) + "Z"; }
    return s + "M" + (x - h*0.03).toFixed(1) + " " + (y - h*0.1).toFixed(1) + "h" + (h*0.06).toFixed(1) + "v" + (h*0.12).toFixed(1) + "h-" + (h*0.06).toFixed(1) + "Z";
  }
  function trees(R, pts, W, count, hMin, hMax, dy){
    var d = "";
    for (var i = 0; i < count; i++){ var x = R() * W, h = hMin + R() * (hMax - hMin); d += deodar(x, yAt(pts, x) + dy + R()*14, h); }
    return d;
  }
  function house(x, y, s, wall, roof, lit){
    return '<g><rect x="'+x+'" y="'+(y-s)+'" width="'+(s*1.5)+'" height="'+s+'" fill="'+wall+'"/>' +
      '<path d="M'+(x-s*0.18)+' '+(y-s)+'L'+(x+s*0.75)+' '+(y-s*1.62)+'L'+(x+s*1.68)+' '+(y-s)+'Z" fill="'+roof+'"/>' +
      [0.22,0.5,0.78].map(function(f){ return '<path d="M'+x+' '+(y-s*f)+'h'+(s*1.5)+'" stroke="rgba(0,0,0,.22)" stroke-width="'+Math.max(1,s*0.03)+'"/>'; }).join("") +
      '<rect x="'+(x+s*0.28)+'" y="'+(y-s*0.66)+'" width="'+(s*0.28)+'" height="'+(s*0.3)+'" fill="'+lit+'"/>' +
      '<rect x="'+(x+s*0.92)+'" y="'+(y-s*0.66)+'" width="'+(s*0.28)+'" height="'+(s*0.3)+'" fill="'+lit+'"/></g>';
  }

  var PALETTES = {
    day:   { sky:["#B9D3DA","#F3F5F1"], sun:"#FFF4D6", far:"#A3B8B7", peak:"#7F9A98", peakShade:"#6A8583", mid:"#557A71", midTree:"#44685F", near:"#2E5048", nearTree:"#213F38", ground:"#16322C", river:"#9FCBCF", wall:"#6A4428", roof:"#3A2A1F", lit:"#2A1E16" },
    dawn:  { sky:["#F2C9A0","#F3F5F1"], sun:"#FFE7B8", far:"#C9B6A8", peak:"#A58D84", peakShade:"#8F7870", mid:"#7C8B6A", midTree:"#66764F", near:"#4E6446", nearTree:"#3B5036", ground:"#2A3D2A", river:"#E8C9A6", wall:"#7A4E2E", roof:"#45301F", lit:"#2A1E16" },
    dusk:  { sky:["#2C4A5E","#D98C57"], sun:"#F6C177", far:"#5D6E78", peak:"#4B5B66", peakShade:"#3D4B55", mid:"#3A4B4C", midTree:"#2E3E3E", near:"#223231", nearTree:"#172524", ground:"#101C1B", river:"#C9855A", wall:"#5A3A26", roof:"#241913", lit:"#F4C45E" },
    forest:{ sky:["#CFE0D8","#F3F5F1"], sun:"#FFF7E0", far:"#A9BFB2", peak:"#8AA596", peakShade:"#75907F", mid:"#4F7A5E", midTree:"#3D6A4E", near:"#2D5840", nearTree:"#1E4531", ground:"#173A2B", river:"#A9D3CB", wall:"#6A4428", roof:"#3A2A1F", lit:"#2A1E16" }
  };

  // Hero and story scenes
  window.drawScene = function(kind){
    var hero = kind === "hero";
    var W = hero ? 1600 : 800, H = hero ? 1000 : 1000;
    var P = PALETTES[{hero:"day", fields:"dawn", forest:"forest", village:"dusk"}[kind]];
    var R = rng({hero:9, fields:21, forest:33, village:47}[kind]);
    var out = [];
    out.push('<svg viewBox="0 0 '+W+' '+H+'" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">');
    out.push('<defs><linearGradient id="sky-'+kind+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+P.sky[0]+'"/><stop offset=".75" stop-color="'+P.sky[1]+'"/></linearGradient></defs>');
    out.push('<rect width="'+W+'" height="'+H+'" fill="url(#sky-'+kind+')"/>');

    // sun or moon
    var sx = hero ? W*0.82 : W*(0.25 + R()*0.5), sy = hero ? H*0.2 : H*0.2;
    out.push('<g class="layer sun" style="--i:0" data-depth="0.05"><circle cx="'+sx+'" cy="'+sy+'" r="'+(hero?70:56)+'" fill="'+P.sun+'"/></g>');

    // far range with the pyramid peak (Habba Khatoon)
    var far = ridge(R, W, hero ? H*0.68 : H*0.6, H*0.035, 3, 16);
    var px = hero ? W*0.64 : W*(0.4 + R()*0.25), pTop = hero ? H*0.34 : H*0.3, pBase = hero ? H*0.7 : H*0.62, pw = hero ? W*0.2 : W*0.45;
    var snow = function(x, t, w){ return '<path d="M'+x+' '+t+'L'+(x-w*0.2)+' '+(t+w*0.28)+'L'+(x-w*0.08)+' '+(t+w*0.22)+'L'+(x+w*0.02)+' '+(t+w*0.32)+'L'+(x+w*0.1)+' '+(t+w*0.2)+'L'+(x+w*0.19)+' '+(t+w*0.26)+'Z" fill="#FFFFFF"/>'; };
    out.push('<g class="layer far" style="--i:1" data-depth="0.12">' +
      '<path d="M'+(px-pw)+' '+pBase+'L'+px+' '+pTop+'L'+(px+pw)+' '+pBase+'V'+H+'H'+(px-pw)+'Z" fill="'+P.peak+'"/>' +
      '<path d="M'+px+' '+pTop+'L'+(px+pw)+' '+pBase+'V'+H+'H'+(px+pw*0.1)+'Z" fill="'+P.peakShade+'"/>' +
      snow(px, pTop, pw*0.5) +
      '<path d="'+ridgePath(far, H)+'" fill="'+P.far+'"/></g>');

    // mid ridge with deodars
    var mid = ridge(R, W, hero ? H*0.76 : H*0.7, H*0.03, 2.4, 12);
    out.push('<g class="layer far" style="--i:2" data-depth="0.22"><path d="'+ridgePath(mid, H)+'" fill="'+P.mid+'"/><path d="'+trees(R, mid, W, hero?70:36, hero?30:34, hero?54:60, 6)+'" fill="'+P.midTree+'"/></g>');

    // river
    if (kind !== "village"){
      out.push('<g class="layer" style="--i:3" data-depth="0.3"><path d="M-20 '+(H*0.83)+' C '+(W*0.25)+' '+(H*0.76)+', '+(W*0.45)+' '+(H*0.9)+', '+(W*0.7)+' '+(H*0.82)+' S '+(W+20)+' '+(H*0.8)+', '+(W+20)+' '+(H*0.81)+' L '+(W+20)+' '+(H*0.84)+' C '+(W*0.8)+' '+(H*0.86)+', '+(W*0.5)+' '+(H*0.95)+', '+(W*0.25)+' '+(H*0.82)+' S -20 '+(H*0.87)+', -20 '+(H*0.87)+'Z" fill="'+P.river+'"/></g>');
    }

    // near ridge with bigger deodars
    var near = ridge(R, W, hero ? H*0.85 : H*0.8, H*0.025, 1.6, 12);
    var nearTrees = trees(R, near, W, hero?26:14, hero?70:80, hero?120:140, 10);
    out.push('<g class="layer" style="--i:4" data-depth="0.36"><path d="'+ridgePath(near, H)+'" fill="'+P.near+'"/><path d="'+nearTrees+'" fill="'+P.nearTree+'"/></g>');

    // foreground: meadow, houses, fields, flowers
    var fg = ridge(R, W, hero ? H*0.94 : H*0.92, H*0.012, 1.2, 20);
    var g = '<g class="layer" style="--i:5" data-depth="0.5"><path d="'+ridgePath(fg, H)+'" fill="'+P.ground+'"/>';
    if (kind === "fields"){
      var cols = ["#D8B04A","#9DB15F","#B87A5E","#C9A86C","#7E9A4E"];
      for (var i = 0; i < 6; i++){ var y = H*0.74 + i*H*0.035; g += '<path d="M-20 '+(y+10)+'L'+(W+20)+' '+(y-12)+'L'+(W+20)+' '+(y+H*0.03)+'L-20 '+(y+H*0.045)+'Z" fill="'+cols[i%5]+'" opacity=".92"/>'; }
      g += house(W*0.62, H*0.8, 74, P.wall, P.roof, P.lit);
    }
    if (kind === "hero"){
      g += house(W*0.1, yAt(fg, W*0.1)+6, 60, P.wall, P.roof, P.lit) + house(W*0.18, yAt(fg, W*0.18)+10, 44, P.wall, P.roof, P.lit) + house(W*0.9, yAt(fg, W*0.9)+8, 52, P.wall, P.roof, P.lit);
    }
    if (kind === "village"){
      for (var j = 0; j < 4; j++){ var hx = W*(0.06 + j*0.24), s = 70 + R()*30; g += house(hx, H*0.9 - j%2*18, s, P.wall, P.roof, P.lit); }
    }
    if (kind !== "village"){
      var fl = ["#E3A21A","#FFFFFF","#C98FD0","#B3332B"];
      for (var f = 0; f < (hero?90:50); f++){ var fx = R()*W, fy = yAt(fg, fx) + 8 + R()*(H - yAt(fg, fx) - 12); g += '<circle cx="'+fx.toFixed(1)+'" cy="'+fy.toFixed(1)+'" r="'+(2+R()*3).toFixed(1)+'" fill="'+fl[f%4]+'"/>'; }
    }
    if (kind === "forest"){
      // hives at the forest edge
      [[0.24,0.9],[0.32,0.92]].forEach(function(p){ var x = W*p[0], y = H*p[1]; g += '<rect x="'+(x-26)+'" y="'+(y-46)+'" width="52" height="46" fill="#C9A06A"/><path d="M'+(x-32)+' '+(y-46)+'h64l-6-12h-52z" fill="#6A4428"/><path d="M'+(x-26)+' '+(y-30)+'h52M'+(x-26)+' '+(y-15)+'h52" stroke="#8B6A44" stroke-width="3"/>'; });
    }
    g += '</g>';
    out.push(g);
    out.push('</svg>');
    return out.join("");
  };

  // Product drawings
  function mix(hex, amt){
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, t = amt < 0 ? 0 : 255, p = Math.abs(amt);
    return "rgb(" + Math.round((t - r) * p + r) + "," + Math.round((t - g) * p + g) + "," + Math.round((t - b) * p + b) + ")";
  }
  window.tintBg = function(hex){ return mix(hex, 0.82); };

  window.drawProduct = function(p, seed){
    var t = p.tint, d = mix(t, -0.35), l = mix(t, 0.35), R = rng(seed + 3);
    var wood = "#6A4428", woodD = "#4A2E1B";
    var art = {
      jar: '<ellipse cx="200" cy="330" rx="110" ry="14" fill="'+d+'" opacity=".22"/><path d="M130 122h140l-6 22H136z" fill="#D9C9A5"/><path d="M122 118c20-26 136-26 156 0l-10 12H132z" fill="#E6D8B5"/><path d="M140 136q-8 18 34 24M260 136q8 18-34 24" stroke="#B89A66" stroke-width="3" fill="none"/>' +
           '<path d="M126 150h148v150a26 26 0 0 1-26 26H152a26 26 0 0 1-26-26z" fill="'+t+'"/><path d="M142 168h12v130h-12z" fill="'+l+'" opacity=".6"/><rect x="156" y="206" width="92" height="64" rx="6" fill="#16322C"/><path d="M172 252l20-26 14 16 10-10 16 20z" fill="#F3F5F1"/><path d="M170 222h64" stroke="#E3A21A" stroke-width="4"/>',
      bowl: (function(){ var s = ""; for (var i = 0; i < 46; i++){ var x = 112 + R()*176, y = 196 + R()*34 - Math.abs(x-200)*0.12; s += '<ellipse cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" rx="15" ry="10" transform="rotate('+Math.round(R()*180)+' '+x.toFixed(1)+' '+y.toFixed(1)+')" fill="'+(i%5===0?l:i%3===0?d:t)+'"/>'; }
             return '<ellipse cx="200" cy="330" rx="130" ry="14" fill="'+d+'" opacity=".2"/>' + s + '<path d="M78 222h244c0 60-54 104-122 104S78 282 78 222z" fill="'+wood+'"/><path d="M78 222h244" stroke="'+woodD+'" stroke-width="5"/><path d="M104 248q96 30 192 0" stroke="'+woodD+'" stroke-width="2" fill="none" opacity=".5"/>'; })(),
      nuts: (function(){ var s = '<ellipse cx="200" cy="330" rx="130" ry="14" fill="'+d+'" opacity=".2"/>'; [[140,240],[210,220],[270,250],[170,290],[240,300],[110,300],[300,300]].forEach(function(q,i){ var r = 38 + R()*8; s += '<g transform="rotate('+Math.round(R()*50-25)+' '+q[0]+' '+q[1]+')"><ellipse cx="'+q[0]+'" cy="'+q[1]+'" rx="'+r+'" ry="'+(r*0.86)+'" fill="'+(i%2?t:l)+'"/><path d="M'+q[0]+' '+(q[1]-r*0.85)+'v'+(r*1.7)+'" stroke="'+d+'" stroke-width="3"/><path d="M'+(q[0]-r*0.5)+' '+(q[1]-r*0.35)+'q'+(r*0.4)+' '+(r*0.35)+' 0 '+(r*0.7)+'M'+(q[0]+r*0.5)+' '+(q[1]-r*0.35)+'q-'+(r*0.4)+' '+(r*0.35)+' 0 '+(r*0.7)+'" stroke="'+d+'" stroke-width="2.5" fill="none"/></g>'; }); return s; })(),
      jam: '<ellipse cx="200" cy="330" rx="100" ry="13" fill="'+d+'" opacity=".22"/><path d="M118 128h164l12 26H106z" fill="#F3F5F1"/>' + (function(){ var s=""; for (var i=0;i<8;i++) s += '<rect x="'+(112+i*22)+'" y="130" width="11" height="22" fill="#B3332B" opacity=".8"/>'; return s; })() + '<path d="M150 154h100v14H150z" fill="#C9B994"/><rect x="132" y="166" width="136" height="158" rx="26" fill="'+t+'"/><rect x="146" y="182" width="12" height="120" rx="6" fill="'+l+'" opacity=".45"/><rect x="164" y="220" width="72" height="56" rx="4" fill="#F3F5F1"/><circle cx="200" cy="248" r="14" fill="'+t+'"/>',
      cup: '<ellipse cx="200" cy="330" rx="120" ry="14" fill="'+d+'" opacity=".22"/><ellipse cx="200" cy="316" rx="110" ry="16" fill="#F3F5F1"/><path d="M110 206h180v38c0 44-40 72-90 72s-90-28-90-72z" fill="#F7F7F2" stroke="'+d+'" stroke-width="3"/><path d="M122 246q78 22 156 0" stroke="#B3332B" stroke-width="6" fill="none"/><path d="M128 258q72 18 144 0" stroke="#2F6F6A" stroke-width="3" fill="none"/><ellipse cx="200" cy="207" rx="88" ry="14" fill="'+t+'"/><path d="M290 220q40 4 34 34t-42 26" stroke="'+d+'" stroke-width="6" fill="none"/><path d="M168 176q-14-22 4-44M200 172q-14-22 4-44M232 176q-14-22 4-44" stroke="'+d+'" stroke-width="4" fill="none" opacity=".35" stroke-linecap="round"/>' + '<circle cx="176" cy="204" r="5" fill="#E3A21A"/><circle cx="214" cy="210" r="4" fill="#F3F5F1"/>',
      spice: '<ellipse cx="200" cy="330" rx="130" ry="14" fill="'+d+'" opacity=".2"/><path d="M104 224q96-110 192 0z" fill="'+t+'"/><path d="M150 180q50-40 100 0" stroke="'+l+'" stroke-width="6" fill="none" opacity=".6"/>' + (function(){ var s=""; for (var i=0;i<24;i++){ var x=120+R()*160, y=186+R()*36; s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(2+R()*2).toFixed(1)+'" fill="'+d+'" opacity=".5"/>'; } return s; })() + '<path d="M84 222h232c0 56-52 100-116 100S84 278 84 222z" fill="'+wood+'"/><path d="M84 222h232" stroke="'+woodD+'" stroke-width="5"/><path d="M300 150q40 20 28 70q-44-12-28-70z" fill="#4F7A3A"/><path d="M304 158q14 30 22 58" stroke="#2E4E22" stroke-width="2" fill="none"/>',
      stick: '<ellipse cx="200" cy="330" rx="120" ry="14" fill="'+d+'" opacity=".22"/><g transform="rotate(-10 200 230)"><rect x="92" y="170" width="216" height="118" rx="10" fill="'+t+'"/><rect x="92" y="170" width="216" height="26" rx="10" fill="'+l+'" opacity=".25"/><rect x="120" y="212" width="120" height="16" rx="3" fill="#E3A21A"/><rect x="120" y="238" width="80" height="10" rx="3" fill="#E3A21A" opacity=".6"/><path d="M268 200l24 30-24 30-24-30z" fill="#E3A21A"/></g><g transform="rotate(8 250 300)"><rect x="160" y="276" width="190" height="30" rx="15" fill="#1B1511"/><rect x="176" y="286" width="90" height="10" rx="5" fill="#E3A21A"/></g>',
      textile: '<ellipse cx="200" cy="330" rx="130" ry="14" fill="'+d+'" opacity=".22"/><path d="M92 170h216l-10 150H102z" fill="'+t+'"/><path d="M92 170h216v22H92z" fill="'+d+'"/>' + (function(){ var s=""; for (var r=0;r<3;r++){ var y=218+r*32; for (var i=0;i<9;i++){ var x=112+i*22; s+='<path d="M'+x+' '+y+'l11-11 11 11-11 11z" fill="'+(r===1?"#E3A21A":(i%2?"#B3332B":"#F3F5F1"))+'" opacity=".92"/>'; } } return s; })() + '<path d="M102 320h196" stroke="'+d+'" stroke-width="3" stroke-dasharray="6 6"/>'
    }[p.art] || "";
    var motif = '<g transform="translate(346 54)" opacity=".85"><path d="M0 -18 18 0 0 18 -18 0z" fill="'+t+'"/><path d="M0 -9 9 0 0 9 -9 0z" fill="#F3F5F1"/></g>';
    return '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="400" height="400" fill="'+mix(t,0.82)+'"/><path d="M0 360 C 90 330 160 356 220 340 S 340 320 400 338 V400 H0z" fill="'+mix(t,0.7)+'"/>' + motif + art + '</svg>';
  };
})();
