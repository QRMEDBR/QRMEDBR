(function () {
  "use strict";

  // ✅ TROQUE para a URL onde você vai hospedar o viewer.html
  // Ex.: GitHub Pages: https://seuusuario.github.io/eqr/viewer.html
  const VIEWER_URL = "https://SEU_DOMINIO_OU_GITHUB_PAGES/viewer.html";

  function csv(v) {
    return (v || "").split(",").map(x => x.trim()).filter(Boolean);
  }

  function meds(v) {
    return (v || "")
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const p = l.split("|").map(x => x.trim());
        return { n: p[0] || "", d: p[1] || "", f: p[2] || "" };
      })
      .filter(m => m.n || m.d || m.f);
  }

  // Base64 "URL-safe" (sem + / =)
  function b64urlEncode(str) {
    const b64 = btoa(unescape(encodeURIComponent(str)));
    return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function gerarQR() {
    if (typeof window.QRCode === "undefined") {
      document.getElementById("debug").innerHTML =
        `<div style="color:#b00020;font-weight:700">Erro: qrcode.min.js não carregou.</div>`;
      return;
    }

    // ✅ Dados compactos (EQR)
    const dados = {
      n: document.getElementById("nome")?.value.trim() || "",
      d: document.getElementById("nascimento")?.value.trim() || "",
      ts: document.getElementById("tipoSangue")?.value.trim() || "",
      a: csv(document.getElementById("alergias")?.value || ""),
      c: csv(document.getElementById("condicoes")?.value || ""),
      m: meds(document.getElementById("meds")?.value || "")
    };

    // Remove campos vazios
    for (const k of Object.keys(dados)) {
      if (dados[k] === "" || (Array.isArray(dados[k]) && dados[k].length === 0)) delete dados[k];
    }

    const json = JSON.stringify(dados);
    const encoded = b64urlEncode(json);

    // ✅ Link HTTPS: dados no fragmento (#) — não vai para o servidor
    const url = `${VIEWER_URL}#${encoded}`;

    const box = document.getElementById("qrcode");
    box.innerHTML = "";

    new window.QRCode(box, {
      text: url,
      width: 300,
      height: 300,
      correctLevel: window.QRCode.CorrectLevel.M
    });

    document.getElementById("debug").innerHTML =
      `Link no QR:<br><code>${url}</code><br><br>` +
      `JSON (antes de codificar):<br><code>${json}</code><br><br>` +
      `Tamanho do link: <b>${url.length}</b> caracteres`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnGerar").addEventListener("click", gerarQR);
  });
})();
