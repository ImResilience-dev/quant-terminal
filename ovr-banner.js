// IMIT OVR banner patch for Quant Terminal (MIT licensed app, copyright Lewis Jackson; keep LICENSE and NOTICE).
// Run from inside the quant-terminal folder:  node ovr-banner.js
// Replaces the top promo banner with an IMIT OVR framework banner and adds a Playbook window. Safe to run again; it updates in place.
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const f = (p) => path.join(root, p);
if (!fs.existsSync(f("public/index.html")) || !fs.existsSync(f("public/css/app.css"))) {
  console.error("Run this inside the quant-terminal folder (public/index.html not found).");
  process.exit(1);
}

const BANNER = [
  '<div id="ribbon" class="ribbon hidden"><!-- ovr-banner -->',
  '    <span class="ribbon-badge">IMIT OVR</span>',
  '    <span><b>Edge &rarr; Control &rarr; Acceptance &rarr; Delivery &rarr; Exhaustion &rarr; Reset.</b> Read in order: Structure, Control, Confirmation, Risk.</span>',
  '    <button class="ovr-btn" id="ovr-open" type="button">Playbook</button>',
  '    <button class="ribbon-x" title="Hide for a week" aria-label="Hide">&times;</button>',
  '  </div>',
].join("\n");

const rows = [
  ["B1", "Reclaim + overhead imbalance", "Bull, Tier 4-5", "After the first Control Defense holds, enter on the pullback that tests the reclaim. Target is the imbalance above.", "Close back below the reclaim level."],
  ["B2", "Control Defense continuation", "Bull, Tier 4", "Enter as the Defense resolves upward. First target is the Displacement imbalance above.", "Price breaks below control instead of bouncing."],
  ["B3", "Trap reversal, bull side", "Bull, Tier 4-5", "Bear Sweep, then Bull Reclaim Hold. Enter on the pullback to the reclaim after Control Defense.", "Reclaim fails, or a second Bear Reclaim Hold forms lower."],
  ["S1", "Reclaim + imbalance below", "Bear, Tier 4-5", "After Bear Control Defense, enter on the failed rally back to control. Target is the imbalance below.", "Close back above the reclaim level."],
  ["S2", "Control Defense continuation", "Bear, Tier 4", "Enter as the Defense resolves downward. First target is the Displacement imbalance below.", "Price breaks above control instead of rejecting."],
  ["S3", "Trap reversal, bear side", "Bear, Tier 4-5", "Bull Sweep, then Bear Reclaim Hold. Enter on the failed rally to the reclaim after Control Defense.", "Reclaim fails, or a Bull Reclaim Hold forms."],
  ["N1", "Compression break", "Neutral, Tier 4", "Do not trade the compression. Wait for a Reclaim Hold out of it, then apply B1 or S1 after the Control Defense.", "Break without a Reclaim Hold is a false break."],
  ["N2", "Balance displacement breakout", "Neutral, Tier 4-5", "After a Displacement closes outside the range and the next candle holds, enter the first pullback to the range edge.", "Next candle fully returns inside the range."],
];
const tr = rows.map((r) => "<tr><td><b>" + r[0] + "</b></td><td>" + r[1] + "<br><span class=\"ovr-dim\">" + r[2] + "</span></td><td>" + r[3] + "</td><td>" + r[4] + "</td></tr>").join("");

const RVO = '<tr><td>Delivery is in progress</td><td>Chases the move.</td><td>Observes, notes the target, prepares for the post-delivery structure.</td></tr><tr><td>Stopped out of a valid setup</td><td>Re-enters at once.</td><td>Checks whether structure changed at the stop. If Control Defense broke, stays out. If it held, waits for re-confirmation.</td></tr><tr><td>Slow session, no setups</td><td>Enters something to feel involved.</td><td>Does not trade. No Tier 4-5 condition means no session. Observation is a valid outcome.</td></tr><tr><td>The move went without them</td><td>Chases late, near Exhaustion.</td><td>Accepts the miss. The next sequence makes another window.</td></tr><tr><td>In profit, short of target</td><td>Takes profit early.</td><td>Stop at the structural anchor, target at the imbalance. Exits when structure says so.</td></tr><tr><td>A compelling candle outside the states</td><td>Trades the pattern.</td><td>Runs the four-layer check. Any missing element means no trade.</td></tr><tr><td>Right thesis, losing trade</td><td>Confused and frustrated.</td><td>Audits the process, not the outcome.</td></tr>';

const DIALOG = [
  '<!-- ovr-dialog-start -->',
  '<link rel="stylesheet" href="/css/ovr.css">',
  '<dialog id="ovr-dialog" class="ovr-dialog">',
  '  <div class="ovr-head"><h2>IMIT OVR Playbook</h2><button class="ovr-x" type="button" aria-label="Close">&times;</button></div>',
  '  <div class="ovr-body">',
  '  <h3>The loop</h3>',
  '  <p>Edge (a sweep fails) &rarr; Control (Reclaim Hold) &rarr; Acceptance (Control Defense) &rarr; Delivery (Displacement) &rarr; Exhaustion &rarr; Reset (Compression, Balance or Completion).</p>',
  '  <h3>Reading order, every time</h3>',
  '  <p><b>1 Structure:</b> which state is active. <b>2 Control:</b> who holds the auction. <b>3 Confirmation:</b> is participation backing the move. <b>4 Risk:</b> do conditions support it.</p>',
  '  <h3>A setup needs all four</h3>',
  '  <p>Control confirmed by a Reclaim Hold or Control Defense. An unfilled imbalance in the path. The sequence intact, not in Exhaustion. Risk conditions supporting: session window, distance from control, key levels.</p>',
  '  <h3>Setups</h3>',
  '  <div class="ovr-scroll"><table class="ovr-table"><thead><tr><th></th><th>Setup</th><th>Entry</th><th>Invalid when</th></tr></thead><tbody>' + tr + '</tbody></table></div>',
  '  <h3>Size by tier</h3>',
  '  <p>Tier 3 or below: observe only. Tier 4: one entry at reduced size. Tier 5: full size, and only when all four elements agree. The farther price is from the Reclaim Hold, the smaller the size. At Exhaustion, size is zero. The 9am and 3pm windows carry full weight, 6pm is reduced, overnight is Tier 3 at best. One imbalance target at a time.</p>',
  '  <h3>Managing the trade</h3>',
  '  <p>In Delivery, do not add and do not tighten into the body. Move the stop to the latest Control Defense. Displacement is not an entry; wait for the retest. Retaliation that closes in your direction means the thesis is intact. Near Exhaustion, no adds, tighten, and consider a partial exit. If delivery fails mid-arc, exit, reset bias to neutral and read the new sequence.</p>',
  '  <details><summary>All 19 states</summary>',
  '  <p><b>Bullish, buyers in control:</b> Sweep, Reclaim Hold, Control Defense, Delivery, Displacement, Retaliation, Exhaustion.</p>',
  '  <p><b>Bearish, sellers in control:</b> the same seven, mirrored.</p>',
  '  <p><b>Neutral, control contested:</b> Compression, Balance, Indecision, Completion.</p>',
  '  <p>Do not trade the sweep. Bias moves at the Reclaim Hold, not before. Delivery is management, not entry. Do not fade Displacement. Retaliation means the thesis is intact. Exhaustion means no new entries.</p>',
  '  </details>',
  '  <details><summary>The five sequences</summary>',
  '  <p><b>1 Bullish:</b> Sweep, Reclaim Hold, Control Defense, Delivery, Displacement, Retaliation, Exhaustion.</p>',
  '  <p><b>2 Bearish:</b> the mirror of the bullish arc.</p>',
  '  <p><b>3 Trap:</b> a sweep, no reclaim, failed participation, then exhaustion or reset. Often the setup for the opposite direction. Most reactive losses come from trading the sweep as if it were a reclaim.</p>',
  '  <p><b>4 Trend continuation:</b> Control Defense, Displacement, Delivery. No sweep needed because the regime is already set. One of the highest-confidence continuation reads.</p>',
  '  <p><b>5 End of move:</b> Delivery, Exhaustion, then Compression, Balance or Completion. Stop pressing and wait for the next chapter.</p>',
  '  </details>',
  '  <details><summary>When control shifts</summary>',
  '  <p>Bull Sweep then Bear Reclaim Hold (or the mirror): trap sequence, drop the old bias at once. Bull or Bear Exhaustion then Compression: wait. Compression then a Reclaim Hold either way: the new regime has begun and bias moves there. Bull Delivery then Bear Sweep (or the mirror): a full trap, the highest-probability setup for the other side. Bull Control Defense then Bear Reclaim Hold (or the mirror): the defense failed and the old thesis is invalid. Completion then Compression: the natural reset. Balance then Displacement either way: a high-confidence breakout.</p>',
  '  <p>Disruption is information, not failure. Holding a bias through a confirmed disruption is denial.</p>',
  '  </details>',
  '  <details><summary>Operator discipline</summary>',
  '  <p><b>Observation.</b> Read the state before anything else. The four-layer order is a loop that restarts on every state change or disruption. Waiting is an action. Compression and balance say wait. The first twenty minutes of the 9am session is a diagnostic: initiative or responsive, carried from the prior session, balanced or directional.</p>',
  '  <div class="ovr-scroll"><table class="ovr-table"><thead><tr><th>Situation</th><th>Reactor</th><th>Operator</th></tr></thead><tbody>' + RVO + '</tbody></table></div>',
  '  <p><b>Ten core values.</b> Structural: state before setup, sequence awareness, disruption recognition. Process: tier before size, entry from confirmation not anticipation, exit from structure not emotion, process audit over result audit. Identity: identity before strategy, the market as teacher, the mentorless deserve structure.</p>',
  '  <p><b>The path.</b> Reactor, Seeker, Narrator, Structural Perceiver, Operator, Fund Manager, Cartographer. Stage is set by behavior under pressure, not years or account size.</p>',
  '  </details>',
  '  <p class="ovr-foot"><b>State without imbalance = context. Imbalance without state = noise. Both together = setup.</b><br>From the OVRstanding Group playbook. Educational only, not financial advice.</p>',
  '  </div>',
  '</dialog>',
  '<script src="/js/ovr.js" defer></script>',
  '<!-- ovr-dialog-end -->',
].join("\n");

const CSS = `
/* ovr-banner */
.ovr-btn { flex: none; background: #087ee5; color: #fff; font-weight: 600; font-size: 12px; padding: 7px 16px; border-radius: 999px; border: 0; cursor: pointer; }
.ovr-btn:hover { filter: brightness(0.93); }
.ovr-dialog { width: min(900px, 94vw); max-height: 88vh; padding: 0; border: 1px solid var(--border); border-radius: 10px; background: var(--panel); color: var(--text); }
.ovr-dialog::backdrop { background: rgba(0, 0, 0, 0.6); }
.ovr-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 18px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--panel); }
.ovr-head h2 { margin: 0; font-size: 16px; }
.ovr-x { border: 0; background: transparent; color: var(--muted); font-size: 22px; cursor: pointer; }
.ovr-body { padding: 4px 18px 16px; font-size: 13px; line-height: 1.5; overflow: auto; max-height: calc(88vh - 54px); }
.ovr-body h3 { margin: 16px 0 4px; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); }
.ovr-body p { margin: 0; }
.ovr-scroll { overflow-x: auto; }
.ovr-table { border-collapse: collapse; width: 100%; font-size: 12px; }
.ovr-table th, .ovr-table td { text-align: left; vertical-align: top; padding: 6px 8px; border-bottom: 1px solid var(--border); }
.ovr-dim { color: var(--muted); }
.ovr-body details { border-top: 1px solid var(--border); margin-top: 10px; padding-top: 8px; }
.ovr-body summary { cursor: pointer; font-weight: 600; margin-bottom: 6px; }
.ovr-body details p { margin: 6px 0; }
.ovr-foot { margin-top: 16px !important; color: var(--muted); }
`;

const JS = `(function () {
  var d = document.getElementById("ovr-dialog"), b = document.getElementById("ovr-open");
  if (!d || !b) return;
  b.addEventListener("click", function () { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  var x = d.querySelector(".ovr-x");
  if (x) x.addEventListener("click", function () { d.close(); });
})();
`;

let html = fs.readFileSync(f("public/index.html"), "utf8");
const re = /<div id="ribbon"[\s\S]*?<\/div>/;
if (!re.test(html)) { console.error("Could not find the top banner in index.html, so I changed nothing."); process.exit(1); }
if (!html.includes("</body>")) { console.error("index.html has no </body>, so I changed nothing."); process.exit(1); }
// remove any earlier copy of the Playbook window (both the first and the current format)
html = html.replace(/<!-- ovr-dialog-start -->[\s\S]*?<!-- ovr-dialog-end -->\s*/, "");
html = html.replace(/<!-- ovr-banner -->\s*<dialog[\s\S]*?<\/dialog>\s*<script src="\/js\/ovr\.js" defer><\/script>\s*/, "");
html = html.replace(re, () => BANNER);
html = html.replace("</body>", () => DIALOG + "\n  </body>");
fs.writeFileSync(f("public/index.html"), html);
fs.writeFileSync(f("public/css/ovr.css"), CSS.trim() + "\n");
fs.writeFileSync(f("public/js/ovr.js"), JS);

// undo the earlier "never show the banner" tweak, if it was applied
const app = f("public/js/app.js");
if (fs.existsSync(app)) {
  const s = fs.readFileSync(app, "utf8");
  if (s.includes("showRibbon() { return;")) fs.writeFileSync(app, s.replace("showRibbon() { return;", "showRibbon() {"));
}
console.log("Done. IMIT OVR banner and Playbook installed. Refresh your browser.");
