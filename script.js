/* script.js
   - Dùng chung cho login + dashboard
   - Thực hiện: login, fetch my cakes, search, pagination, logout
*/

const API_BASE = "https://banhngot.fitlhu.com";

// Helpers
function el(id) { return document.getElementById(id); }
function setStatus(text = "", type = "info") {
  const s = el("status");
  if (s) { s.textContent = text; s.className = "status " + (type || ""); }
}

// Simple token check (used on dashboard load)
function ensureAuthOrRedirect() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// LOGIN logic
async function loginSubmitHandler(e) {
  e.preventDefault();
  const username = el("username").value.trim();
  const password = el("password").value.trim();
  const msgEl = el("loginMessage");
  if (!username || !password) { msgEl.textContent = "Vui lòng nhập đủ thông tin."; msgEl.style.color="crimson"; return; }

  msgEl.textContent = "Đang đăng nhập...";
  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    // Support multiple API shapes: check token fields
    const token = data.token || data.access_token || (data.data && data.data.token);
    const user = data.user || data.data || null;

    if (res.ok && token) {
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      msgEl.textContent = "Đăng nhập thành công! Chuyển hướng...";
      msgEl.style.color = "green";
      setTimeout(()=> window.location.href = "index.html", 900);
    } else {
      msgEl.textContent = data.message || "Đăng nhập thất bại";
      msgEl.style.color = "crimson";
    }
  } catch (err) {
    msgEl.textContent = "Lỗi kết nối máy chủ.";
    msgEl.style.color = "crimson";
    console.error(err);
  }
}

// DASHBOARD: fetch my cakes (page + limit)
let currentPage = 1, totalPages = 1, limit = 9;

async function fetchMyCakes(page = 1) {
  if (!ensureAuthOrRedirect()) return;
  const token = localStorage.getItem("token");
  setStatus("Đang tải bánh...", "loading");

  try {
    const url = new URL(`${API_BASE}/api/cakes/my`);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const res = await fetch(url.toString(), {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const j = await res.json();

    if (!res.ok || !j.success) {
      // If token invalid, log out after showing a message
      setStatus(j.message || "Không thể tải dữ liệu.", "error");
      if (/token|auth|unauthorized/i.test(j.message || "")) {
        setTimeout(()=> { localStorage.clear(); window.location.href="login.html"; }, 1200);
      }
      return;
    }

    currentPage = (j.pagination && j.pagination.page) || page;
    totalPages = (j.pagination && j.pagination.totalPages) || 1;
    renderGrid(j.data || []);
    renderPagination();
    setStatus("");
  } catch (err) {
    console.error(err);
    setStatus("Lỗi kết nối máy chủ.", "error");
  }
}

function renderGrid(items) {
  const grid = el("grid");
  if (!grid) return;
  if (!items || items.length === 0) {
    grid.innerHTML = `<div class="card"><p class="muted">Bạn chưa có bánh nào.</p></div>`;
    return;
  }
  grid.innerHTML = items.map(c=>{
    const img = (c.image && /^https?:\/\//.test(c.image)) ? c.image : "https://via.placeholder.com/600x400?text=Cake";
    const price = (typeof c.price === "number") ? c.price : Number(c.price || 0);
    return `
      <article class="cake-card">
        <div class="cake-thumb"><img class="cake-img" src="${img}" alt="${escapeHtml(c.name||'Bánh')}"></div>
        <div class="cake-body">
          <div class="cake-title">${escapeHtml(c.name||'Không tên')}</div>
          <div class="cake-desc">${escapeHtml(c.description || '')}</div>
          <div class="cake-meta"><span>${escapeHtml(c.category||'khác')}</span><span>${formatNumber(price)} ₫</span></div>
        </div>
      </article>
    `;
  }).join("");
}

function renderPagination() {
  const prev = el("prevPage"), next = el("nextPage"), info = el("pageInfo");
  if (info) info.textContent = `Trang ${currentPage} / ${totalPages}`;
  if (prev) prev.disabled = currentPage <= 1;
  if (next) next.disabled = currentPage >= totalPages;
}

function formatNumber(n){ return new Intl.NumberFormat('vi-VN').format(n); }
function escapeHtml(s){ if(!s) return ""; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

// SEARCH
async function handleSearch() {
  const q = (el("searchInput") && el("searchInput").value.trim()) || "";
  if (!q) return fetchMyCakes(1);
  const token = localStorage.getItem("token");
  setStatus(`Tìm: "${q}" ...`);
  try {
    const res = await fetch(`${API_BASE}/api/cakes/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const j = await res.json();
    if (res.ok && j.success && Array.isArray(j.data)) {
      renderGrid(j.data);
      // show minimal pagination info from result if available
      if (j.pagination) { currentPage = j.pagination.page || 1; totalPages = j.pagination.totalPages || 1; renderPagination(); }
      setStatus(`Tìm thấy ${ (j.pagination && j.pagination.total) || (j.data && j.data.length) || 0 } kết quả.`);
    } else {
      setStatus(j.message || "Không tìm thấy kết quả.", "error");
      el("grid").innerHTML = "";
    }
  } catch (err) {
    console.error(err);
    setStatus("Lỗi tìm kiếm", "error");
  }
}

// NAV / EVENTS init on DOM
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname.split("/").pop();

  // Login page initialization
  if (path === "login.html" || path === "" ) {
    const form = el("loginForm");
    if (form) form.addEventListener("submit", loginSubmitHandler);
    return;
  }

  // Dashboard initialization
  if (path === "index.html" || path === "dashboard.html") {
    // ensure authenticated (redirect if not)
    if (!ensureAuthOrRedirect()) return;

    // load user info from storage (if exists)
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try {
        const u = JSON.parse(userRaw);
        // optionally show user details somewhere (not required)
        const summary = el("summary");
        if (summary) summary.textContent = u.full_name || u.username || "";
      } catch {}
    }

    // attach handlers
    const prev = el("prevPage"), next = el("nextPage");
    if (prev) prev.addEventListener("click", ()=>{ if(currentPage>1) fetchMyCakes(currentPage-1); });
    if (next) next.addEventListener("click", ()=>{ if(currentPage<totalPages) fetchMyCakes(currentPage+1); });

    const searchBtn = el("searchBtn"); if (searchBtn) searchBtn.addEventListener("click", handleSearch);
    const logout = el("logoutBtn"); if (logout) logout.addEventListener("click", ()=>{ localStorage.clear(); window.location.href="login.html"; });
    const addBtn = el("addCakeBtn"); if (addBtn) addBtn.addEventListener("click", ()=> window.location.href="add-cake.html");

    // initial fetch
    fetchMyCakes(1);
  }

  // add-cake page (optional)
  if (path === "add-cake.html") {
    if (!ensureAuthOrRedirect()) return;
    const form = el("addCakeForm");
    if (form) {
      form.addEventListener("submit", async (e)=>{
        e.preventDefault();
        const name = el("name").value.trim();
        const category = el("category").value.trim();
        const price = Number(el("price").value || 0);
        const image = el("image").value.trim();
        const description = el("description").value.trim();
        if (!name || !category || !price) { showMessage('Vui lòng điền tên, loại và giá.', 'error', 'message'); return; }
        setStatus('Đang gửi...', 'loading');

        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${API_BASE}/api/cakes`, {
            method: "POST",
            headers: { "Content-Type":"application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ name, category, price, image, description })
          });
          const j = await res.json();
          if (res.ok && j.success) {
            setStatus('Thêm bánh thành công!', 'success');
            setTimeout(()=> window.location.href = 'index.html', 900);
          } else {
            setStatus(j.message || 'Không thể thêm bánh', 'error');
          }
        } catch (err){ console.error(err); setStatus('Lỗi máy chủ', 'error'); }
      });
    }
  }
});
