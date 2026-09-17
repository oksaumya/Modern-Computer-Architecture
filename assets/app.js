/* CSA222 study notes — shared behaviour.
   TOPICS is the single reading order: it drives the Prev / Next pager on every page. */
var TOPICS = [
  ["m1-00-verilog-basics.html", "Verilog for absolute beginners"],
  ["m1-01-boolean-gates.html", "Boolean algebra & logic gates"],
  ["m1-02-logic-minimization.html", "Logic minimization & K-maps"],
  ["m1-03-mux-demux-decoder.html", "MUX, DEMUX & decoders"],
  ["m1-04-adders.html", "Adders: half, full, ripple, look-ahead"],
  ["m1-05-number-systems.html", "Number systems & two's complement"],
  ["m1-06-overflow.html", "Adder-subtractor & overflow"],
  ["m2-01-latches.html", "Latches: SR & D"],
  ["m2-02-flipflops-timing.html", "Flip-flops & timing"],
  ["m2-03-registers-shift.html", "Registers & shift registers"],
  ["m2-04-counters.html", "Counters"],
  ["m2-05-register-file.html", "Register file"],
  ["m2-06-fsm.html", "FSMs: Moore vs Mealy"],
  ["m2-07-sram-dram.html", "SRAM vs DRAM"],
  ["m3-01-von-neumann-harvard.html", "Von Neumann vs Harvard"],
  ["m3-02-cisc-risc-riscv.html", "CISC vs RISC & RISC-V"],
  ["m3-03-mips-registers-formats.html", "MIPS32 registers & instruction formats"],
  ["m3-04-c-to-mips.html", "C to MIPS: if-else, loops, arrays"],
  ["m3-05-functions-stack.html", "Functions, stack & recursion in MIPS"],
  ["m4-01-single-cycle-datapath.html", "Fetch-decode-execute & single-cycle datapath"],
  ["m4-02-pipeline-5-stage.html", "5-stage pipeline"],
  ["m4-03-hazards-forwarding.html", "Hazards, forwarding & branch prediction"],
  ["m4-04-performance.html", "Performance: CPI, IPC & Amdahl's Law"],
  ["m5-01-memory-wall-locality.html", "Memory wall & locality"],
  ["m5-02-cache-organization.html", "Cache organization & lookup"],
  ["m5-03-cache-policies.html", "Replacement & write policies"],
  ["m5-04-amat.html", "AMAT & multi-level caches"],
  ["m5-05-virtual-memory.html", "Virtual memory, page tables & TLB"],
  ["m6-01-power-wall-multicore.html", "Power wall & multicore"],
  ["m6-02-mesi-cache-coherence.html", "Cache coherence & MESI"],
  ["m6-03-atomics-mutex.html", "Data races, atomics & mutexes"],
  ["m6-04-heterogeneous.html", "Heterogeneous computing"],
  ["m6-05-ilp-superscalar-ooo.html", "ILP: superscalar, OoO & renaming"],
  ["m6-06-simd-gpu-tpu.html", "SIMD, GPUs & AI hardware"],
  ["m6-07-spectre-meltdown.html", "Spectre & Meltdown"]
];

(function () {
  var root = document.documentElement;

  // theme toggle (remembered per browser when storage is available)
  try {
    var saved = localStorage.getItem("csa-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function isDark() {
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      var label = function () { btn.textContent = isDark() ? "Light mode" : "Dark mode"; };
      label();
      btn.addEventListener("click", function () {
        var next = isDark() ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem("csa-theme", next); } catch (e) {}
        label();
      });
    });

    // pager
    var here = location.pathname.split("/").pop();
    document.querySelectorAll("[data-pager]").forEach(function (nav) {
      var i = -1;
      for (var k = 0; k < TOPICS.length; k++) if (TOPICS[k][0] === here) i = k;
      var html = "";
      if (i > 0) html += '<a class="prev" href="' + TOPICS[i - 1][0] + '"><small>← Previous</small>' + TOPICS[i - 1][1] + "</a>";
      html += '<a class="home" href="index.html"><small>All topics</small>Home</a>';
      if (i >= 0 && i < TOPICS.length - 1) html += '<a class="next" href="' + TOPICS[i + 1][0] + '"><small>Next →</small>' + TOPICS[i + 1][1] + "</a>";
      nav.innerHTML = html;
    });

    // "show all answers" button above each practice block
    document.querySelectorAll("[data-practice]").forEach(function (box) {
      var tools = document.createElement("div");
      tools.className = "q-tools";
      var b = document.createElement("button");
      b.className = "btn";
      b.type = "button";
      b.textContent = "Show all answers";
      b.addEventListener("click", function () {
        var qs = box.querySelectorAll("details.q");
        var open = b.textContent.indexOf("Show") === 0;
        qs.forEach(function (d) { d.open = open; });
        b.textContent = open ? "Hide all answers" : "Show all answers";
      });
      tools.appendChild(b);
      box.insertBefore(tools, box.firstChild);
    });

    // stepper: <div class="stepper" data-stepper><div class="stage">…</div>…</div>
    document.querySelectorAll("[data-stepper]").forEach(function (box) {
      var stages = Array.prototype.slice.call(box.querySelectorAll(":scope > .stage"));
      if (stages.length < 2) return;
      var i = 0;
      var ctl = document.createElement("div");
      ctl.className = "stepper-ctl";
      ctl.innerHTML = '<button class="btn" type="button">← Back</button><button class="btn" type="button">Next step →</button><span></span>';
      var back = ctl.children[0], fwd = ctl.children[1], info = ctl.children[2];
      function show() {
        stages.forEach(function (s, k) { s.hidden = k !== i; });
        back.disabled = i === 0;
        fwd.disabled = i === stages.length - 1;
        info.textContent = "Step " + (i + 1) + " of " + stages.length;
      }
      back.addEventListener("click", function () { if (i > 0) { i--; show(); } });
      fwd.addEventListener("click", function () { if (i < stages.length - 1) { i++; show(); } });
      box.appendChild(ctl);
      show();
    });
  });
})();
