// ========================== CẤU HÌNH CHUNG ==========================
const API_BASE_URL = "https://banhngot.fitlhu.com";

// ========================== HỖ TRỢ CHUNG ==========================
function formatVND(value) {
  try {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  } catch {
    return value + " ₫";
  }
}

function showMessage(message, type = "info", targetId = "message") {
  const box = document.getElementById(targetId);
  if (!box) return;
  box.textContent = message;
  box.style.display = "block";
  box.className = `message-box ${type}`;
}

// ========================== ĐĂNG NHẬP ==========================
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  showMessage("⏳ Đang đăng nhập...", "loading", "loginMessage");

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      showMessage("✅ Đăng nhập thành công!", "success", "loginMessage");
      setTimeout(() => (window.location.href = "index.html"), 1200);
    } else {
      showMessage(data.message || "❌ Sai thông tin đăng nhập!", "error", "loginMessage");
    }
  } catch (err) {
    showMessage("⚠️ Không thể kết nối máy chủ.", "error", "loginMessage");
  }
}

// ========================== ĐĂNG XUẤT ==========================
function logoutUser() {
  localStorage.clear();
  window.location.href = "login.html";
}

// ========================== LẤY DANH SÁCH BÁNH ==========================
async function fetchCakes() {
  const token = localStorage.getItem("token");
  if (!token) return logoutUser();

  try {
    const res = await fetch(`${API_BASE_URL}/api/cakes?page=1&limit=9`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();

    if (data.success) {
      renderCakes(data.data);
    } else {
      showMessage(data.message || "Không thể tải danh sách bánh!", "error", "cakesStatus");
    }
  } catch (err) {
    showMessage("⚠️ Lỗi kết nối đến máy chủ.", "error", "cakesStatus");
  }
}

function renderCakes(cakes) {
  const grid = document.getElementById("cakesGrid");
  if (!grid) return;

  if (!cakes || cakes.length === 0) {
    grid.innerHTML = "<p>Chưa có bánh nào 🍞</p>";
    return;
  }

  grid.innerHTML = cakes
    .map(
      (cake) => `
      <div class="cake-card">
        <div class="cake-thumb">
          <img src="${cake.image || "https://via.placeholder.com/400x250?text=Cake"}" alt="${cake.name}">
        </div>
        <div class="cake-body">
          <h3>${cake.name}</h3>
          <p>${cake.description || "Không có mô tả"}</p>
          <div class="cake-meta">
            <span>${cake.category}</span>
            <span>${formatVND(cake.price)}</span>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// ========================== THÊM BÁNH ==========================
async function handleAddCake(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  if (!token) return logoutUser();

  const formData = {
    name: document.getElementById("name").value,
    category: document.getElementById("category").value,
    price: parseInt(document.getElementById("price").value),
    image: document.getElementById("image").value,
    description: document.getElementById("description").value,
  };

  showMessage("⏳ Đang thêm bánh...", "loading");

  try {
    const res = await fetch(`${API_BASE_URL}/api/cakes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (data.success) {
      showMessage("✅ Thêm bánh thành công!", "success");
      setTimeout(() => (window.location.href = "index.html"), 1500);
    } else {
      showMessage("❌ Không thể thêm bánh.", "error");
    }
  } catch (err) {
    showMessage("⚠️ Lỗi kết nối máy chủ.", "error");
  }
}

// ========================== TÌM KIẾM BÁNH ==========================
async function handleSearch() {
  const token = localStorage.getItem("token");
  const keyword = document.getElementById("searchInput").value.trim();
  if (!keyword) return fetchCakes();

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/cakes/search?q=${encodeURIComponent(keyword)}&page=1&limit=9`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (data.success) renderCakes(data.data);
    else showMessage("Không tìm thấy bánh phù hợp.", "error", "cakesStatus");
  } catch (err) {
    showMessage("⚠️ Lỗi tìm kiếm.", "error", "cakesStatus");
  }
}

// ========================== KHỞI TẠO THEO TRANG ==========================
document.addEventListener("DOMContentLoaded", () => {
  const path = window.location.pathname;

  // Nếu đang ở trang đăng nhập
  if (path.endsWith("login.html")) {
    const form = document.getElementById("loginForm");
    if (form) form.addEventListener("submit", handleLogin);
  }

  // Nếu đang ở trang dashboard
  if (path.endsWith("index.html")) {
    fetchCakes();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logoutUser);

    const searchBtn = document.getElementById("searchBtn");
    if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  }

  // Nếu đang ở trang thêm bánh
  if (path.endsWith("add-cake.html")) {
    const form = document.getElementById("addCakeForm");
    if (form) form.addEventListener("submit", handleAddCake);
  }
});