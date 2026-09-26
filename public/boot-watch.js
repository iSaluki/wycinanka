/*
 * Reports a start-up that never finishes. Deliberately old-fashioned JavaScript in a file of its own: when a
 * browser can't even parse the app's code (an old iPad), none of the app's own error reporting runs, but this
 * does. The app sets window.__wycinankaStarted once it has rendered.
 */
(function () {
  var WAIT = 15000;
  setTimeout(function () {
    if (window.__wycinankaStarted || document.visibilityState === 'hidden') return;
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/report', true);
      xhr.setRequestHeader('content-type', 'application/json');
      var main = document.querySelector('script[type="module"][src*="/assets/"]');
      xhr.send(
        JSON.stringify({
          kind: 'boot',
          message: 'The app did not start within ' + WAIT / 1000 + ' seconds',
          path: location.pathname.slice(0, 200),
          build: main ? (main.getAttribute('src') || '').split('/').pop().slice(0, 40) : undefined,
        }),
      );
    } catch (e) {
      /* nothing more can be done */
    }
  }, WAIT);
})();
