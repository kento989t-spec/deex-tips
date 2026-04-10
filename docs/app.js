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
        <div class="tip-header" onclick="this.parentElement.classList.toggle('open')">
          <span class="tip-title">${esc(tip.title)}</span>
          <span class="tip-tags">${tip.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</span>
          <span class="chevron">▶</span>
        </div>
        <div class="tip-body">${renderMarkdown(tip.content)}</div>
      </div>
    `).join("");

    // Syntax highlight
    el.querySelectorAll("pre code").forEach(block => {
      hljs.highlightElement(block);
    });
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
