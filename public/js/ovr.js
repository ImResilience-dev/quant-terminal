(function () {
  var d = document.getElementById("ovr-dialog"), b = document.getElementById("ovr-open");
  if (!d || !b) return;
  b.addEventListener("click", function () { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  var x = d.querySelector(".ovr-x");
  if (x) x.addEventListener("click", function () { d.close(); });
})();
