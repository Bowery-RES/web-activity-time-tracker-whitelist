document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("signInButton")
    .addEventListener("click", function () {
      chrome.runtime.getBackgroundPage(function (bg) {
        bg.authHelper.runAuthProcess();
        window.close();
      });
    });
});
