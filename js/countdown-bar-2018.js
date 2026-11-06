/*
 * Countdown fallback for the 2018 Santa Tracker bar.
 * The 2018 app already draws the pink bar with a DAYS / HRS / MIN / SEC
 * countdown, but that countdown depends on Google's old live-data service.
 * If the built-in countdown stays hidden, this adds an identical-looking one
 * to the bar that counts down locally to Santa's takeoff.
 */
(function () {
  // Santa took off at 10:00 UTC on 24 December. Date is mocked to 2018 above.
  var TAKEOFF = Date.UTC(2018, 11, 24, 10, 0, 0);
  var LABELS = ['Days', 'Hrs', 'Min', 'Sec'];
  var CSS = '#cd2018{display:flex;align-items:center;margin:0 8px 0 auto;flex:none;' +
    'font-family:Roboto,sans-serif;color:#fff;pointer-events:none}' +
    '#cd2018[hidden]{display:none}' +
    '#cd2018 .u{display:flex;flex-direction:column;align-items:center;min-width:30px;margin-left:10px}' +
    '#cd2018 .n{font-size:20px;font-weight:700;line-height:18px;letter-spacing:.5px}' +
    '#cd2018 .l{font-size:8px;font-weight:800;line-height:10px;letter-spacing:.5px;text-transform:uppercase}' +
    '@media (max-width:480px){#cd2018 .u{margin-left:6px;min-width:24px}#cd2018 .n{font-size:16px}}';

  function findDeep(root, selector) {
    var hit = root.querySelector(selector);
    if (hit) return hit;
    var all = root.querySelectorAll('*');
    for (var i = 0; i < all.length; i++) {
      if (all[i].shadowRoot && (hit = findDeep(all[i].shadowRoot, selector))) return hit;
    }
    return null;
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function secondsLeft() { return Math.max(0, Math.floor((TAKEOFF - Date.now()) / 1000)); }

  var box = null, nums = [];

  function build() {
    box = document.createElement('div');
    box.id = 'cd2018';
    box.setAttribute('aria-hidden', 'true');
    nums = LABELS.map(function (label) {
      var u = document.createElement('div'); u.className = 'u';
      var n = document.createElement('span'); n.className = 'n';
      var l = document.createElement('span'); l.className = 'l'; l.textContent = label;
      u.appendChild(n); u.appendChild(l); box.appendChild(u);
      return n;
    });
  }

  function update() {
    var chrome = findDeep(document, 'santa-chrome');
    var root = chrome && chrome.shadowRoot;
    var title = root && root.getElementById('title');
    if (!title) return;

    var native = title.querySelector('countdown-timer');
    var nativeShowing = native && !native.hidden && native.offsetWidth > 0;
    var left = secondsLeft();

    if (!box) build();
    if (box.parentNode !== title) {
      var style = document.createElement('style');
      style.textContent = CSS;
      title.appendChild(style);
      title.appendChild(box);
    }
    box.hidden = nativeShowing || left === 0;
    var parts = [Math.floor(left / 86400), Math.floor(left / 3600) % 24,
                 Math.floor(left / 60) % 60, left % 60];
    for (var i = 0; i < 4; i++) nums[i].textContent = pad(parts[i]);
  }

  setInterval(update, 1000);
})();
