// Inject a floating share button with a small menu (WhatsApp + Copy Link)
(function () {
  var style = document.createElement('style');
  style.innerHTML = "\n    .ff-share-btn{position:fixed;right:20px;bottom:20px;width:56px;height:56px;border-radius:50%;background:#000;color:#fff;display:flex;align-items:center;justify-content:center;font-size:22px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,0.2);z-index:9999;transition:transform .2s,opacity .2s;}\n    .ff-share-btn:hover{transform:translateY(-2px);}\n    .ff-share-menu{position:fixed;right:20px;bottom:84px;background:#fff;border:1px solid #e0e0e0;border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;min-width:220px;z-index:9999;opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .18s,transform .18s;}\n    .ff-share-menu.ff-open{opacity:1;pointer-events:auto;transform:translateY(0);}\n    .ff-share-item{display:flex;gap:10px;align-items:center;padding:12px 14px;color:#000;text-decoration:none;font-size:14px;border-bottom:1px solid #f2f2f2;}\n    .ff-share-item:last-child{border-bottom:none;}\n    .ff-share-item:hover{background:#f8f8f8;}\n    .ff-share-icon{width:18px;height:18px;display:inline-block;}\n    @media (max-width:600px){.ff-share-btn{right:14px;bottom:14px;width:52px;height:52px;font-size:20px}.ff-share-menu{right:14px;bottom:74px;min-width:200px}.ff-share-item{padding:12px}}\n  ";
  document.head.appendChild(style);

  var btn = document.createElement('button');
  btn.className = 'ff-share-btn';
  btn.setAttribute('aria-label', 'Seite teilen');
  btn.title = 'Teilen';
  btn.innerHTML = '⇪';

  var menu = document.createElement('div');
  menu.className = 'ff-share-menu';

  function currentShareText(){
    var title = document.title || 'Schau dir das an';
    var url = window.location.href;
    return encodeURIComponent(title + ' ' + url);
  }
  function currentShareData(){
    return {
      title: document.title || 'Schau dir das an',
      url: window.location.href
    };
  }
  function isMobile(){
    return /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent);
  }

  var wa = document.createElement('a');
  wa.className = 'ff-share-item';
  wa.href = (isMobile() ? 'https://api.whatsapp.com/send?text=' : 'https://web.whatsapp.com/send?text=') + currentShareText();
  wa.target = '_blank';
  wa.rel = 'noopener noreferrer';
  wa.innerHTML = '<span class="ff-share-icon">🟢</span><span>Über WhatsApp teilen</span>';

  var copy = document.createElement('a');
  copy.href = '#';
  copy.className = 'ff-share-item';
  copy.innerHTML = '<span class="ff-share-icon">🔗</span><span>Link kopieren</span>';
  copy.addEventListener('click', function(e){
    e.preventDefault();
    var url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(url).then(function(){
        copy.innerHTML = '<span class="ff-share-icon">✅</span><span>Link kopiert</span>';
        setTimeout(function(){ copy.innerHTML = '<span class=\'ff-share-icon\'>🔗</span><span>Link kopieren</span>'; }, 1800);
      });
    } else {
      var input = document.createElement('input');
      input.value = url; document.body.appendChild(input); input.select();
      try { document.execCommand('copy'); } catch(_) {}
      document.body.removeChild(input);
    }
  });

  menu.appendChild(wa);
  // Optional: Native Web Share API (Desktop/Supported Browser)
  if (navigator.share) {
    var sys = document.createElement('a');
    sys.href = '#';
    sys.className = 'ff-share-item';
    sys.innerHTML = '<span class="ff-share-icon">📤</span><span>System-Teilen</span>';
    sys.addEventListener('click', function(e){
      e.preventDefault();
      navigator.share(currentShareData()).catch(function(){});
    });
    menu.appendChild(sys);
  }
  menu.appendChild(copy);

  btn.addEventListener('click', function(){
    menu.classList.toggle('ff-open');
  });

  document.addEventListener('click', function(e){
    if (!menu.contains(e.target) && e.target !== btn){
      menu.classList.remove('ff-open');
    }
  });

  document.body.appendChild(btn);
  document.body.appendChild(menu);
})();


