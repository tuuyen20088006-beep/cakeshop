// === CẤU HÌNH API ===
const API_URL = "https://banhngot.fitlhu.com/api";
let token = localStorage.getItem("token");

// === TRANG ĐĂNG NHẬP ===
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const msg = document.getElementById("loginMessage");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else msg.textContent = data.message || "Đăng nhập thất bại!";
    } catch {
      msg.textContent = "Lỗi kết nối server!";
    }
  });
}

// === TRANG DASHBOARD ===
const productList = document.getElementById("productList");
if (productList) {
  const modal = document.getElementById("modal");
  const form = document.getElementById("cakeForm");
  const addBtn = document.getElementById("addCakeBtn");
  const closeModal = document.getElementById("closeModal");
  const logoutBtn = document.getElementById("logoutBtn");

  let editingId = null;
  let products = [];

  // Lấy danh sách bánh
  async function fetchProducts() {
    const res = await fetch(`${API_URL}/cakes?page=1&limit=9`);
    const data = await res.json();
    if (data.success) {
      products = data.data;
      renderProducts();
    }
  }

  // Hiển thị bánh ra giao diện
  function renderProducts() {
    productList.innerHTML = products
      .map(
        (p) => `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}" />
        <h3>${p.name}</h3>
        <p>${p.category}</p>
        <p><strong>${p.price.toLocaleString()}đ</strong></p>
        <p>${p.description}</p>
        <div class="actions">
          <button class="edit-btn" onclick="openEdit(${p.id})">✏️</button>
          <button class="delete-btn" onclick="deleteCake(${p.id})">🗑️</button>
        </div>
      </div>`
      )
      .join("");
  }

  // Mở modal thêm/chỉnh sửa
  addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    document.getElementById("modalTitle").textContent = "Thêm bánh mới";
    editingId = null;
    form.reset();
  });

  closeModal.addEventListener("click", () => (modal.style.display = "none"));

  // Thêm hoặc cập nhật bánh
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const cake = {
      name: form.cakeName.value,
      category: form.cakeCategory.value,
      price: Number(form.cakePrice.value),
      image: form.cakeImage.value,
      description: form.cakeDescription.value,
    };

    const method = editingId ? "PUT" : "POST";
    const url = editingId
      ? `${API_URL}/cakes/${editingId}`
      : `${API_URL}/cakes`;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cake),
    });

    const data = await res.json();
    if (data.success) {
      alert(editingId ? "Cập nhật bánh thành công!" : "Thêm bánh thành công!");
      modal.style.display = "none";
      fetchProducts();
    } else alert(data.message || "Lỗi xử lý!");
  });

  // Sửa bánh
  window.openEdit = (id) => {
    const cake = products.find((c) => c.id === id);
    if (!cake) return;
    editingId = id;
    modal.style.display = "flex";
    document.getElementById("modalTitle").textContent = "Chỉnh sửa bánh";
    form.cakeName.value = cake.name;
    form.cakeCategory.value = cake.category;
    form.cakePrice.value = cake.price;
    form.cakeImage.value = cake.image;
    form.cakeDescription.value = cake.description;
  };

  // Xóa bánh
  window.deleteCake = async (id) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    const res = await fetch(`${API_URL}/cakes/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      alert("Đã xóa bánh!");
      fetchProducts();
    } else alert(data.message || "Lỗi khi xóa!");
  };

  // Tìm kiếm bánh
  document.getElementById("search").addEventListener("input", async (e) => {
    const q = e.target.value.trim();
    if (q.length < 2) return fetchProducts();
    const res = await fetch(`${API_URL}/cakes/search?q=${q}`);
    const data = await res.json();
    if (data.success) {
      products = data.data;
      renderProducts();
    } else productList.innerHTML = "<p>Không tìm thấy bánh nào!</p>";
  });

  // Đăng xuất
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  fetchProducts();
}
