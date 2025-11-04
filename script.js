const API_BASE_URL = "https://banhngot.fitlhu.com";

// ====== ĐĂNG NHẬP ======
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();
      const error = document.getElementById("error-message");

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (res.ok && data.token) {
          localStorage.setItem("token", data.token);
          alert("Đăng nhập thành công!");
          window.location.href = "dashboard.html";
        } else {
          error.textContent = data.message || "Sai tên đăng nhập hoặc mật khẩu!";
        }
      } catch (err) {
        error.textContent = "Không thể kết nối tới server!";
      }
    });
  }
});

// ====== DASHBOARD ======
const token = localStorage.getItem("token");
if (window.location.pathname.includes("dashboard.html") && !token) {
  window.location.href = "index.html";
}

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
}

// ====== HÀM HIỂN THỊ THÔNG BÁO ======
function showMessage(msg, type = "info") {
  const box = document.getElementById("messageBox");
  box.textContent = msg;
  box.className = type;
}

function setLoading(state) {
  document.getElementById("loading").style.display = state ? "block" : "none";
}

// ====== LẤY DANH SÁCH BÁNH ======
async function fetchCakes() {
  const res = await fetch(`${API_BASE_URL}/api/cakes?page=1&limit=9`);
  const data = await res.json();
  if (data.success) renderCakes(data.data);
}

function renderCakes(cakes) {
  const container = document.getElementById("cakeContainer");
  container.innerHTML = "";
  cakes.forEach((cake) => {
    const div = document.createElement("div");
    div.classList.add("cake-item");
    div.innerHTML = `
      <img src="${cake.image}" alt="${cake.name}">
      <h3>${cake.name}</h3>
      <p>${cake.category}</p>
      <p><b>${cake.price.toLocaleString()} VND</b></p>
      <p>${cake.description}</p>
    `;
    container.appendChild(div);
  });
}

// ====== THÊM BÁNH ======
const addCakeForm = document.getElementById("addCakeForm");
if (addCakeForm) {
  addCakeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      name: document.getElementById("cakeName").value.trim(),
      category: document.getElementById("cakeCategory").value.trim(),
      price: Number(document.getElementById("cakePrice").value),
      image: document.getElementById("cakeImage").value.trim(),
      description: document.getElementById("cakeDescription").value.trim(),
    };

    if (!formData.name || !formData.category || !formData.price || formData.price <= 0) {
      showMessage("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/cakes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        showMessage("🎂 Thêm bánh thành công!", "success");
        addCakeForm.reset();
        fetchCakes();
      } else {
        showMessage(data.message || "Không thể thêm bánh!", "error");
      }
    } catch (error) {
      showMessage("Lỗi kết nối đến máy chủ!", "error");
    } finally {
      setLoading(false);
    }
  });

  fetchCakes();
}
