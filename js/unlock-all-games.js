/*
 * Unlocks every Santa's Village game and activity right away, instead of
 * waiting for each one's December 2018 launch date. Uses the 2018 app's own
 * built-in "unlock all houses" switch once the app has loaded.
 */
(function () {
  var tries = 0;
  var timer = setInterval(function () {
    var app = document.getElementById('santaApp');
    if (app && typeof app.unlockAllHouses === 'function') {
      app.unlockAllHouses();
      clearInterval(timer);
    } else if (++tries > 240) {
      clearInterval(timer);
    }
  }, 250);
})();
