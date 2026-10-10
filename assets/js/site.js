(function () {
  "use strict";
  var KEY = "bh_age_ok";
  var MIN_AGE = 18;
  var root = document.documentElement;

  function verified() {
    try {
      var v = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
      if (!v) return false;
      var exp = parseInt(v, 10);
      return exp > Date.now();
    } catch (e) { return false; }
  }
  function remember(persist) {
    var exp = Date.now() + (persist ? 30 * 24 * 3600 * 1000 : 12 * 3600 * 1000);
    try { (persist ? localStorage : sessionStorage).setItem(KEY, String(exp)); } catch (e) {}
  }
  function ageOf(d, m, y) {
    var dob = new Date(y, m - 1, d);
    if (dob.getFullYear() !== y || dob.getMonth() !== m - 1 || dob.getDate() !== d) return null;
    var now = new Date();
    var age = now.getFullYear() - y;
    if (now.getMonth() < m - 1 || (now.getMonth() === m - 1 && now.getDate() < d)) age--;
    return age;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var gate = document.getElementById("age-gate");
    if (gate) {
      if (!verified()) { root.classList.add("needs-gate"); }
      var form = document.getElementById("age-form");
      var err = document.getElementById("age-error");
      var inputs = form.querySelectorAll("input[type=text]");
      Array.prototype.forEach.call(inputs, function (inp, i) {
        inp.addEventListener("input", function () {
          inp.value = inp.value.replace(/\D/g, "");
          if (inp.value.length >= inp.maxLength && inputs[i + 1]) inputs[i + 1].focus();
        });
      });
      if (root.classList.contains("needs-gate") && inputs[0]) { inputs[0].focus(); }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var d = parseInt(inputs[0].value, 10), m = parseInt(inputs[1].value, 10), y = parseInt(inputs[2].value, 10);
        if (!d || !m || !y || inputs[2].value.length !== 4 || y < 1900) { err.textContent = "Please enter a valid date of birth."; return; }
        var age = ageOf(d, m, y);
        if (age === null || age < 0) { err.textContent = "Please enter a valid date of birth."; return; }
        if (age < MIN_AGE) {
          document.getElementById("age-ask").hidden = true;
          document.getElementById("age-denied").hidden = false;
          return;
        }
        remember(document.getElementById("age-remember").checked);
        root.classList.remove("needs-gate");
      });
    }

    var btn = document.querySelector(".menu-btn");
    var list = document.getElementById("nav-list");
    if (btn && list) {
      btn.addEventListener("click", function () {
        var open = list.classList.toggle("open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    }

    var filters = document.querySelectorAll("[data-filter]");
    if (filters.length) {
      var tiles = Array.prototype.slice.call(document.querySelectorAll("#tiles .tile"));
      var count = document.getElementById("filter-count");
      var empty = document.getElementById("filter-empty");
      var apply = function () {
        var want = {};
        Array.prototype.forEach.call(filters, function (f) { want[f.getAttribute("data-filter")] = f.value; });
        var shown = 0;
        tiles.forEach(function (t) {
          var ok = Object.keys(want).every(function (k) { return !want[k] || t.getAttribute("data-" + k) === want[k]; });
          t.hidden = !ok;
          if (ok) shown++;
        });
        if (count) count.textContent = shown + " of " + tiles.length + " cocktails";
        if (empty) empty.hidden = shown !== 0;
      };
      Array.prototype.forEach.call(filters, function (f) { f.addEventListener("change", apply); });
      apply();
    }

    function mailForm(id, subjectFn, fields) {
      var wf = document.getElementById(id);
      if (!wf) return;
      wf.addEventListener("submit", function (e) {
        e.preventDefault();
        var f = new FormData(wf);
        var g = function (k) { return (f.get(k) || "").toString().trim(); };
        var body = fields.map(function (p) { return p[0] + ": " + g(p[1]); }).join("\n") + "\n\n" + g("message");
        window.location.href = "mailto:" + wf.getAttribute("data-to") +
          "?subject=" + encodeURIComponent(subjectFn(g)) + "&body=" + encodeURIComponent(body);
      });
    }
    mailForm("wholesale-form", function (g) { return "Wholesale enquiry: " + (g("company") || g("name")); },
      [["Name", "name"], ["Company", "company"], ["Country", "country"], ["Business type", "type"], ["Email", "email"]]);
    mailForm("contact-form", function (g) { return "Beach Heaven: " + g("topic"); },
      [["Name", "name"], ["Email", "email"], ["Topic", "topic"]]);
  });
})();
