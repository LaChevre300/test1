export function createUI(rootEl) {
  const ui = document.createElement("div");
  ui.className = "ui";
  ui.innerHTML = `
    <div class="hud" id="hud" style="display:none;">
      <div class="pill" id="status">Laboratoire 4512 — Reste discret.</div>
      <div class="pill" id="hint">WASD · Souris · Maj = courir · Echap = libérer la souris</div>
    </div>
    <div class="crosshair" id="crosshair" style="display:none;"></div>
    <div class="bottomRight" id="br" style="display:none;">
      <div class="pill">Vous êtes chauve</div>
      <div class="bald" title="Chauve"></div>
      <div class="pill danger" id="danger" style="display:none;">DANGER: il est proche…</div>
    </div>
    <div class="panel" id="panel">
      <div class="card">
        <h1 class="title">Laboratoire 4512</h1>
        <p class="muted">
          Vous vous réveillez dans un laboratoire informatique. Les écrans brillent encore.
          Quelque chose gratte le sol… un chien, mais pas normal.
        </p>
        <p class="muted">
          Objectif: survivre 60 secondes. Si le chien vous attrape, c’est terminé.
        </p>
        <div class="row">
          <button id="start">Jouer (clic pour capturer la souris)</button>
          <button id="reset">Recommencer</button>
        </div>
        <pre id="err" style="display:none;margin:12px 0 0;white-space:pre-wrap;word-break:break-word;font-size:12px;line-height:1.35;opacity:.9;background:rgba(0,0,0,.35);border:1px solid rgba(255,80,100,.25);padding:10px;border-radius:12px;"></pre>
        <p class="muted" style="margin-top:12px;font-size:12.5px;">
          Contrôles: WASD pour bouger, Maj pour courir, souris pour regarder. Echap pour libérer la souris.
        </p>
      </div>
    </div>
  `;

  rootEl.appendChild(ui);

  const els = {
    ui,
    panel: ui.querySelector("#panel"),
    start: ui.querySelector("#start"),
    reset: ui.querySelector("#reset"),
    hud: ui.querySelector("#hud"),
    crosshair: ui.querySelector("#crosshair"),
    status: ui.querySelector("#status"),
    danger: ui.querySelector("#danger"),
    br: ui.querySelector("#br"),
    hint: ui.querySelector("#hint"),
    err: ui.querySelector("#err"),
  };

  return {
    els,
    showInGame() {
      els.panel.style.display = "none";
      els.hud.style.display = "";
      els.crosshair.style.display = "";
      els.br.style.display = "";
    },
    showMenu() {
      els.panel.style.display = "";
      els.hud.style.display = "none";
      els.crosshair.style.display = "none";
      els.br.style.display = "none";
      els.danger.style.display = "none";
      els.err.style.display = "none";
    },
    setStatus(text) {
      els.status.textContent = text;
    },
    setDanger(isDanger) {
      els.danger.style.display = isDanger ? "" : "none";
    },
    showError(text) {
      els.err.textContent = text;
      els.err.style.display = "";
    },
  };
}

