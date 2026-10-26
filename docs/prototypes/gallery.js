// Builds the prototype gallery from src/screens.json (kept as the single source of truth).
fetch('src/screens.json')
  .then((res) => res.json())
  .then((screens) => {
    const main = document.getElementById('gallery');
    for (const s of screens) {
      const fig = document.createElement('figure');
      const img = document.createElement('img');
      img.src = `${s.id}.png`;
      img.alt = `WebOS prototype: ${s.title}`;
      img.loading = 'lazy';
      img.width = 1440;
      img.height = 900;
      const cap = document.createElement('figcaption');
      const num = document.createElement('span');
      num.className = 'num';
      num.textContent = s.id.slice(0, 2);
      const title = document.createElement('b');
      title.textContent = s.title;
      const link = document.createElement('a');
      link.href = `src/${s.file}${s.query || ''}`;
      link.textContent = 'Open HTML';
      cap.append(num, title, link);
      fig.append(img, cap);
      main.append(fig);
    }
    window.__galleryReady = true;
  });
