// === LOGIN LOGIC ===
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const loginMessage = document.getElementById("loginMessage");

    try {
      const res = await fetch("https://banhngot.fitlhu.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
        window.location.href = "dashboard.html";
      } else {
        loginMessage.textContent = "Sai tên đăng nhập hoặc mật khẩu!";
      }
    } catch (err) {
      loginMessage.textContent = "Lỗi kết nối đến máy chủ!";
    }
  });
}

// === DASHBOARD LOGIC ===
const productListEl = document.getElementById("productList");
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

if (productListEl) {
  loadCakes();
}

const defaultImages = [
  "https://source.unsplash.com/600x400/?chocolate-cake",
  "https://source.unsplash.com/600x400/?strawberry-cake",
  "https://source.unsplash.com/600x400/?vanilla-cake",
  "https://source.unsplash.com/600x400/?cheesecake",
  "https://source.unsplash.com/600x400/?cupcake",
  "https://source.unsplash.com/600x400/?matcha-cake",
  "https://source.unsplash.com/600x400/?fruit-cake",
  "https://source.unsplash.com/600x400/?tiramisu",
  "https://source.unsplash.com/600x400/?bakery"
];

// === HÀM LẤY DANH SÁCH BÁNH ===
async function loadCakes() {
  try {
    const res = await fetch("https://banhngot.fitlhu.com/api/cakes?page=1&limit=9");
    const data = await res.json();

    if (data.success && data.data.length > 0) {
      renderCakes(data.data);
    } else {
      productListEl.innerHTML = "<p>Không có bánh nào để hiển thị.</p>";
    }
  } catch (err) {
    console.error(err);
    productListEl.innerHTML = "<p>Lỗi tải dữ liệu bánh.</p>";
  }
}

// === HÀM HIỂN THỊ BÁNH ===
function renderCakes(cakes) {
  productListEl.innerHTML = cakes
    .map(
      (cake, i) => `
      <div class="product-card">
        <img src="${cake.image || defaultImages[i % defaultImages.length]}" alt="${cake.name}">
        <h3>${cake.name}</h3>
        <p>${cake.category}</p>
        <p><strong>${cake.price.toLocaleString()}đ</strong></p>
        <p>${cake.description}</p>
      </div>
    `
    )
    .join("");
}
