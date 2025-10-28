// ------------------- LOGIN -------------------
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  // Nếu có token → chuyển luôn sang dashboard
  const token = localStorage.getItem("token");
  if (token && window.location.pathname.endsWith("index.html")) {
    window.location.href = "dashboard.html";
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const message = document.getElementById("message");

      try {
        const response = await fetch("https://banhngot.fitlhu.com/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success && data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "dashboard.html";
        } else {
          message.textContent = "Sai tên đăng nhập hoặc mật khẩu!";
        }
      } catch (error) {
        message.textContent = "Lỗi kết nối server!";
      }
    });
  }

  // ------------------- DASHBOARD -------------------
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }

  // Hiển thị danh sách bánh
  const cakeContainer = document.getElementById("cakes");
  if (cakeContainer) {
    fetch("https://banhngot.fitlhu.com/api/cakes?page=1&limit=9")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          cakeContainer.innerHTML = data.data
            .map(
              (cake) => `
              <div class="cake-card">
                <img src="${cake.image}" alt="${cake.name}">
                <h3>${cake.name}</h3>
                <p>${cake.category}</p>
                <p><strong>${cake.price.toLocaleString()}₫</strong></p>
              </div>
            `
            )
            .join("");
        } else {
          cakeContainer.innerHTML = "<p>Không tải được danh sách bánh!</p>";
        }
      })
      .catch(() => {
        cakeContainer.innerHTML = "<p>Lỗi khi tải dữ liệu!</p>";
      });
  }
});
