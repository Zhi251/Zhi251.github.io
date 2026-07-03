/* ============================================================
   資安小工具 - 邏輯
   進制換算 / 編碼解碼 / Hash 計算 / 工程計算器
   ============================================================ */
(function () {
  "use strict";

  var COPY_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
  var CHECK_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function init() {
    var root = document.getElementById("sec-tools");
    if (!root || root.dataset.stReady === "1") return;
    root.dataset.stReady = "1";

    var $ = function (s) { return root.querySelector(s); };
    var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

    var DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

    function parseInBase(str, base) {
      if (str == null) return null;
      str = String(str).trim().toLowerCase();
      if (str === "") return null;
      var neg = false;
      if (str[0] === "-") { neg = true; str = str.slice(1); }
      if (str === "") return undefined;
      var b = BigInt(base);
      var r = 0n;
      for (var i = 0; i < str.length; i++) {
        var d = DIGITS.indexOf(str[i]);
        if (d < 0 || d >= base) return undefined;
        r = r * b + BigInt(d);
      }
      return neg ? -r : r;
    }

    function toBase(val, base) { return val.toString(base).toUpperCase(); }

    /* ---------- 複製 ---------- */
    function flashCopied(btn) {
      btn.classList.add("is-copied");
      btn.innerHTML = CHECK_SVG;
      clearTimeout(btn._t);
      btn._t = setTimeout(function () {
        btn.classList.remove("is-copied");
        btn.innerHTML = COPY_SVG;
      }, 1200);
    }
    function fallbackCopy(text, btn) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); flashCopied(btn); } catch (e) {}
      document.body.removeChild(ta);
    }
    function doCopy(text, btn) {
      if (!text) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { flashCopied(btn); })
          .catch(function () { fallbackCopy(text, btn); });
      } else {
        fallbackCopy(text, btn);
      }
    }
    $$(".st-copy").forEach(function (btn) { btn.innerHTML = COPY_SVG; });
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = $("#" + btn.getAttribute("data-copy"));
        if (el) doCopy(el.value, btn);
      });
    });
    $$("[data-copy-el]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var el = root.querySelector('[data-codec-out="' + btn.getAttribute("data-copy-el") + '"]');
        if (el) doCopy(el.value, btn);
      });
    });

    /* ---------- Tabs ---------- */
    $$("[data-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var name = tab.getAttribute("data-tab");
        $$("[data-tab]").forEach(function (t) { t.classList.toggle("is-active", t === tab); });
        $$("[data-panel]").forEach(function (p) {
          p.classList.toggle("is-active", p.getAttribute("data-panel") === name);
        });
        if (name === "calc") {
          var ce = $("#calc-entry");
          if (ce) ce.focus();
        }
      });
    });

    /* ====================================================
       1. 進制換算
    ==================================================== */
    var baseInput = $("#base-input");
    var baseFrom = $("#base-from");
    var baseFromCustom = $("#base-from-custom");
    var baseToCustom = $("#base-to-custom");
    var baseError = $("#base-error");

    function clampBase(el) {
      var n = parseInt(el.value, 10);
      if (isNaN(n) || n < 2) n = 2;
      if (n > 36) n = 36;
      return n;
    }
    function runBaseConvert() {
      var fromBase = baseFrom.value === "custom" ? clampBase(baseFromCustom) : parseInt(baseFrom.value, 10);
      var outs = { "base-bin": "", "base-oct": "", "base-dec": "", "base-hex": "", "base-cus": "" };
      baseError.textContent = "";
      var raw = baseInput.value.trim();
      if (raw !== "") {
        var val = parseInBase(raw, fromBase);
        if (val === undefined) {
          baseError.textContent = "含有不屬於 " + fromBase + " 進制的字元";
        } else if (val !== null) {
          outs["base-bin"] = toBase(val, 2);
          outs["base-oct"] = toBase(val, 8);
          outs["base-dec"] = toBase(val, 10);
          outs["base-hex"] = toBase(val, 16);
          outs["base-cus"] = toBase(val, clampBase(baseToCustom));
        }
      }
      Object.keys(outs).forEach(function (id) { $("#" + id).value = outs[id]; });
    }
    baseFrom.addEventListener("change", function () {
      baseFromCustom.style.display = baseFrom.value === "custom" ? "" : "none";
      runBaseConvert();
    });
    [baseInput, baseFromCustom, baseToCustom].forEach(function (el) {
      el.addEventListener("input", runBaseConvert);
    });

    /* ====================================================
       2. 編碼解碼
    ==================================================== */
    function strToBytes(s) { return new TextEncoder().encode(s); }
    function bytesToStr(b) { return new TextDecoder("utf-8", { fatal: false }).decode(b); }
    function bytesToBase64(bytes) {
      var bin = "";
      for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    }
    function base64ToBytes(b64) {
      var bin = atob(b64.replace(/\s+/g, ""));
      var arr = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }
    function bytesToHex(bytes, sep) {
      var out = [];
      for (var i = 0; i < bytes.length; i++) out.push(("0" + bytes[i].toString(16)).slice(-2));
      return out.join(sep).toUpperCase();
    }
    function hexToBytes(hex) {
      hex = hex.replace(/[^0-9a-fA-F]/g, "");
      if (hex.length % 2 !== 0) throw new Error("HEX 長度需為偶數");
      var arr = new Uint8Array(hex.length / 2);
      for (var i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16);
      return arr;
    }
    function processCodec(type, mode) {
      var inEl = root.querySelector('[data-codec-in="' + type + '"]');
      var outEl = root.querySelector('[data-codec-out="' + type + '"]');
      var text = inEl.value;
      var result = "";
      try {
        if (type === "base64") {
          result = mode === "encode" ? bytesToBase64(strToBytes(text)) : bytesToStr(base64ToBytes(text));
        } else if (type === "hex") {
          if (mode === "encode") {
            var sepSel = root.querySelector('[data-codec-sep="hex"]').value;
            var sep = sepSel === "space" ? " " : sepSel;
            result = bytesToHex(strToBytes(text), sep);
          } else {
            result = bytesToStr(hexToBytes(text));
          }
        } else if (type === "url") {
          result = mode === "encode" ? encodeURIComponent(text) : decodeURIComponent(text.replace(/\+/g, " "));
        }
      } catch (e) {
        result = "[錯誤] " + e.message;
      }
      outEl.value = result;
    }
    $$("[data-codec]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        processCodec(btn.getAttribute("data-codec"), btn.getAttribute("data-mode"));
      });
    });

    /* ====================================================
       3. Hash 計算
    ==================================================== */
    var hashInput = $("#hash-input");
    var hmacAlgo = $("#hmac-algo");
    var hmacKey = $("#hmac-key");

    function runHash() {
      var text = hashInput.value;
      if (typeof CryptoJS === "undefined") {
        $("#hash-md5").value = "[CryptoJS 尚未載入]";
        return;
      }
      $("#hash-md5").value = CryptoJS.MD5(text).toString();
      $("#hash-sha1").value = CryptoJS.SHA1(text).toString();
      $("#hash-sha256").value = CryptoJS.SHA256(text).toString();
      $("#hash-sha512").value = CryptoJS.SHA512(text).toString();
      runHmac();
    }
    function runHmac() {
      if (typeof CryptoJS === "undefined") return;
      var text = hashInput.value;
      var key = hmacKey.value;
      var fn = {
        MD5: CryptoJS.HmacMD5,
        SHA1: CryptoJS.HmacSHA1,
        SHA256: CryptoJS.HmacSHA256,
        SHA512: CryptoJS.HmacSHA512
      }[hmacAlgo.value];
      $("#hmac-out").value = key === "" ? "" : fn(text, key).toString();
    }
    hashInput.addEventListener("input", runHash);
    hmacAlgo.addEventListener("change", runHmac);
    hmacKey.addEventListener("input", runHmac);

    /* ====================================================
       4. 計算器（工程 / 程式設計師）
    ==================================================== */
    var OPSYM = { "+": "+", "-": "−", "*": "×", "/": "÷", "&": "AND", "|": "OR", "^": "XOR", "<<": "<<", ">>": ">>" };
    var calc = { entry: "0", base: 10, acc: null, op: null, justOp: false, justEq: false, exprParts: [], showEq: false };
    var calcEntry = $("#calc-entry");
    var calcExpr = $("#calc-expr");

    function calcCurrentVal() {
      var v = parseInBase(calc.entry, calc.base);
      return (v === null || v === undefined) ? 0n : v;
    }
    function calcRenderExpr() {
      if (!calcExpr) return;
      if (calc.showEq) {
        calcExpr.textContent = calc.exprParts.join(" ") + " =";
      } else if (calc.exprParts.length === 0) {
        calcExpr.textContent = "";
      } else {
        var parts = calc.exprParts.slice();
        if (!calc.justOp) parts.push(calc.entry);
        calcExpr.textContent = parts.join(" ");
      }
    }
    function calcRender() {
      calcEntry.value = calc.entry;
      var v = calcCurrentVal();
      $("#calc-bin").textContent = v.toString(2).toUpperCase();
      $("#calc-oct").textContent = v.toString(8).toUpperCase();
      $("#calc-dec").textContent = v.toString(10);
      $("#calc-hex").textContent = v.toString(16).toUpperCase();
      calcRenderExpr();
    }
    function updateDigitButtons() {
      $$("[data-digit]").forEach(function (b) {
        var d = DIGITS.indexOf(b.getAttribute("data-digit").toLowerCase());
        b.disabled = d >= calc.base;
      });
    }
    function calcCompute(a, op, b) {
      switch (op) {
        case "+": return a + b;
        case "-": return a - b;
        case "*": return a * b;
        case "/": return b === 0n ? a : a / b;
        case "&": return a & b;
        case "|": return a | b;
        case "^": return a ^ b;
        case "<<": return a << (b < 0n ? 0n : b);
        case ">>": return a >> (b < 0n ? 0n : b);
        default: return b;
      }
    }
    function calcInputDigit(d) {
      if (calc.justEq) { calc.exprParts = []; calc.showEq = false; calc.entry = "0"; calc.justEq = false; }
      if (calc.justOp) { calc.entry = "0"; calc.justOp = false; }
      calc.entry = (calc.entry === "0") ? d : calc.entry + d;
      calcRender();
    }
    function calcSetOp(op) {
      // NOT：對目前數值做位元反相
      if (op === "~") {
        calc.entry = toBase(~calcCurrentVal(), calc.base);
        if (calc.justEq) { calc.exprParts = []; calc.showEq = false; calc.justEq = false; }
        calc.justOp = false;
        calcRender();
        return;
      }
      var sym = OPSYM[op] || op;
      // 等號後再接運算子：以結果作為新算式的第一個運算元
      if (calc.justEq) {
        calc.exprParts = [calc.entry, sym];
        calc.acc = calcCurrentVal();
        calc.op = op;
        calc.justOp = true;
        calc.justEq = false;
        calcRender();
        return;
      }
      // 連續按運算子：替換最後一個運算子
      if (calc.justOp) {
        if (calc.exprParts.length) calc.exprParts[calc.exprParts.length - 1] = sym;
        calc.op = op;
        calcRender();
        return;
      }
      // 正常：把剛輸入的運算元與運算子寫入算式
      if (calc.op === null) {
        calc.acc = calcCurrentVal();
      } else {
        calc.acc = calcCompute(calc.acc, calc.op, calcCurrentVal());
      }
      calc.exprParts.push(calc.entry, sym);
      calc.op = op;
      calc.justOp = true;
      calc.entry = toBase(calc.acc, calc.base);
      calcRender();
    }
    function calcEquals() {
      if (calc.justEq) return;
      if (calc.op !== null) {
        calc.acc = calcCompute(calc.acc, calc.op, calcCurrentVal());
        calc.exprParts.push(calc.entry);
        calc.op = null;
      } else {
        calc.acc = calcCurrentVal();
        if (calc.exprParts.length === 0) calc.exprParts.push(calc.entry);
      }
      calc.entry = toBase(calc.acc, calc.base);
      calc.showEq = true;
      calc.justEq = true;
      calc.justOp = false;
      calcRender();
    }
    function calcClear() {
      calc.entry = "0"; calc.acc = null; calc.op = null;
      calc.justOp = false; calc.justEq = false;
      calc.exprParts = []; calc.showEq = false;
      calcRender();
    }
    function calcBack() {
      if (calc.justOp || calc.justEq) return;
      calc.entry = calc.entry.length > 1 ? calc.entry.slice(0, -1) : "0";
      calcRender();
    }

    $$("[data-digit]").forEach(function (b) {
      b.addEventListener("click", function () { if (!b.disabled) calcInputDigit(b.getAttribute("data-digit")); });
    });
    $$("[data-op]").forEach(function (b) {
      b.addEventListener("click", function () { calcSetOp(b.getAttribute("data-op")); });
    });
    $$("[data-action]").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-action");
        if (a === "equals") calcEquals();
        else if (a === "clear") calcClear();
        else if (a === "back") calcBack();
      });
    });
    $$("[data-base]").forEach(function (b) {
      b.addEventListener("click", function () {
        var v = calcCurrentVal();
        calc.base = parseInt(b.getAttribute("data-base"), 10);
        $$("[data-base]").forEach(function (x) { x.classList.toggle("is-active", x === b); });
        // 切換進制會清掉進行中的算式（避免不同進制混在同一行），但保留目前數值
        calc.entry = toBase(v, calc.base);
        calc.acc = null; calc.op = null;
        calc.justOp = false; calc.justEq = false;
        calc.exprParts = []; calc.showEq = false;
        updateDigitButtons();
        calcRender();
      });
    });

    /* ---------- 鍵盤直接輸入 ---------- */
    function pressKey(el) {
      if (!el) return;
      el.classList.add("is-press");
      setTimeout(function () { el.classList.remove("is-press"); }, 110);
    }
    var calcPanel = root.querySelector('[data-panel="calc"]');
    var calcScreen = root.querySelector(".st-screen");
    var calcEntryEl = $("#calc-entry");
    if (calcScreen && calcEntryEl) {
      calcScreen.addEventListener("click", function () { calcEntryEl.focus(); });
    }
    document.addEventListener("keydown", function (e) {
      if (!calcPanel || !calcPanel.classList.contains("is-active")) return;
      var ae = document.activeElement;
      if (ae && ae !== calcEntryEl && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA" || ae.tagName === "SELECT")) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var k = e.key;

      if (/^[0-9a-fA-F]$/.test(k)) {
        var d = DIGITS.indexOf(k.toLowerCase());
        if (d < calc.base) {
          calcInputDigit(k.toUpperCase());
          pressKey(root.querySelector('[data-digit="' + k.toUpperCase() + '"]'));
          e.preventDefault();
        }
        return;
      }

      var opMap = { "+": "+", "-": "-", "*": "*", "/": "/", "&": "&", "|": "|", "^": "^", "~": "~", "<": "<<", ">": ">>" };
      if (Object.prototype.hasOwnProperty.call(opMap, k)) {
        calcSetOp(opMap[k]);
        pressKey(root.querySelector('[data-op="' + opMap[k] + '"]'));
        e.preventDefault();
        return;
      }

      if (k === "Enter" || k === "=") {
        calcEquals();
        pressKey(root.querySelector('[data-action="equals"]'));
        e.preventDefault();
      } else if (k === "Backspace") {
        calcBack();
        pressKey(root.querySelector('[data-action="back"]'));
        e.preventDefault();
      } else if (k === "Escape" || k === "Delete") {
        calcClear();
        pressKey(root.querySelector('[data-action="clear"]'));
        e.preventDefault();
      }
    });

    /* ---------- 初始渲染 ---------- */
    runBaseConvert();
    runHash();
    updateDigitButtons();
    calcRender();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
