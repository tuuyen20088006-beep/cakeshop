// ========== XỬ LÝ ĐĂNG NHẬP ==========
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const msg = document.getElementById("loginMessage");

    try {
      const res = await fetch("https://banhngot.fitlhu.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        localStorage.setItem("token", data.token);
        window.location.href = "dashboard.html";
      } else {
        msg.textContent = data.message || "Sai tên đăng nhập hoặc mật khẩu!";
      }
    } catch (err) {
      msg.textContent = "Lỗi kết nối tới máy chủ!";
    }
  });
}

// ========== DASHBOARD ==========
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// ========== HIỂN THỊ DANH SÁCH BÁNH ==========
const productListEl = document.getElementById("productList");

if (productListEl) {
  const defaultImages = [
    "https://images.unsplash.com/photo-1608198093002-4d1b72bb61b2",
    "https://images.unsplash.com/photo-1589308078053-04451d9f463e",
    "https://images.unsplash.com/photo-1601972599720-1e8a92d442c3",
    "https://images.unsplash.com/photo-1608532333744-9936cf4e1b8a",
    "https://images.unsplash.com/photo-1601049437403-9345d2d9a83e",
    "https://images.unsplash.com/photo-1599785209707-29f25a0b05c5",
    "https://images.unsplash.com/photo-1617196037304-6b8e15d97d64",
    "https://images.unsplash.com/photo-1626788074625-2f4b2a4200a1",
    "https://images.unsplash.com/photo-1612197527762-3e1f5eec1f22"
  ];

  async function loadCakes() {
    try {
      const res = await fetch("https://banhngot.fitlhu.com/api/cakes?page=1&limit=9");
      const data = await res.json();

      if (data.success) {
        renderCakes(data.data);
      } else {
        productListEl.innerHTML = "<p>Không tải được danh sách bánh!</p>";
      }
    } catch (err) {
      productListEl.innerHTML = "<p>Lỗi kết nối tới API!</p>";
    }
  }

  function renderCakes(cakes) {
    productListEl.innerHTML = cakes.map((cake, i) => `
      <div class="product-card">
        <img src="${cake.image || defaultImages[i % defaultImages.length]}" alt="${cake.name}">
        <h3>${cake.name}</h3>
        <p>${cake.category}</p>
        <p><strong>${cake.price.toLocaleString()}đ</strong></p>
        <p>${cake.description}</p>
      </div>
    `).join("");
  }
  
}
