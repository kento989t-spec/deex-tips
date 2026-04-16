(() => {
  let tips = [];
  let activeTag = null;

  async function init() {
    const res = await fetch("tips.json");
    tips = await res.json();
    renderFilters();
    renderTips();
  }

  function allTags() {
    const set = new Set();
    tips.forEach(t => t.tags.forEach(tag => set.add(tag)));
    return [...set].sort();
  }

  function renderFilters() {
    const el = document.getElementById("filters");
    const tags = allTags();
    el.innerHTML =
      `<button class="filter-btn${activeTag === null ? " active" : ""}" data-tag="">すべて</button>` +
      tags.map(tag =>
        `<button class="filter-btn${activeTag === tag ? " active" : ""}" data-tag="${tag}">${tag}</button>`
      ).join("");
    el.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tag = btn.dataset.tag;
        activeTag = tag === "" ? null : tag;
        renderFilters();
        renderTips();
      });
    });
  }

  function renderTips() {
    const el = document.getElementById("tips");
    const filtered = activeTag
      ? tips.filter(t => t.tags.includes(activeTag))
      : tips;

    el.innerHTML = filtered.map((tip, i) => `
      <div class="tip-card" data-index="${i}">
        <div class="tip-header">
          <span class="tip-title">${esc(tip.title)}</span>
          <span class="tip-tags">${tip.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</span>
          <button class="copy-tip-btn" type="button" title="このTip全体をMarkdownでコピー">コピー</button>
          <span class="chevron">▶</span>
        </div>
        <div class="tip-body">${renderMarkdown(tip.content)}</div>
      </div>
    `).join("");

    el.querySelectorAll(".tip-card").forEach((card, idx) => {
      const tip = filtered[idx];
      const header = card.querySelector(".tip-header");
      const copyBtn = card.querySelector(".copy-tip-btn");

      header.addEventListener("click", (e) => {
        if (e.target.closest(".copy-tip-btn")) return;
        card.classList.toggle("open");
      });

      copyBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const md = `## ${tip.title}\n\n${tip.tags.length ? `tags: ${tip.tags.join(", ")}\n\n` : ""}${tip.content}\n`;
        copyToClipboard(md, copyBtn);
      });
    });

    el.querySelectorAll("pre").forEach(pre => {
      const code = pre.querySelector("code");
      if (!code) return;
      hljs.highlightElement(code);
      const btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.type = "button";
      btn.textContent = "コピー";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        copyToClipboard(code.textContent, btn);
      });
      pre.appendChild(btn);
    });
  }

  function copyToClipboard(text, btn) {
    const original = btn.textContent;
    const done = () => {
      btn.textContent = "✓ コピー済み";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1500);
    };
    const fail = () => {
      btn.textContent = "失敗";
      setTimeout(() => { btn.textContent = original; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fallback);
    } else {
      fallback();
    }
    function fallback() {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        done();
      } catch (_) {
        fail();
      }
    }
  }

  function renderMarkdown(md) {
    return marked.parse(md, { breaks: true });
  }

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  init();
})();
