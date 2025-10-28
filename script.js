// ------------------- CẤU HÌNH -------------------
const API_URL = "https://banhngot.fitlhu.com/api"; // base API
// ------------------- HILPER: tìm token trong response nhiều dạng -------------------
function extractToken(obj) {
  // thử nhiều chỗ có thể chứa token (tùy API)
  if (!obj) return null;
  if (typeof obj === "string") return obj; // nếu trả thẳng token
  if (obj.token) return obj.token;
  if (obj.access_token) return obj.access_token;
  if (obj.data && (obj.data.token || obj.data.access_token)) return obj.data.token || obj.data.access_token;
  if (obj.result && (obj.result.token || obj.result.access_token)) return obj.result.token || obj.result.access_token;
  return null;
}

// ------------------- LOGIN HANDLER -------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const msgEl = document.getElementById("message") || document.getElementById("loginMessage") || document.querySelector(".message");

  // nếu đã có token thì chuyển đến dashboard (nếu đang ở index.html)
  const storedToken = localStorage.getItem("token");
  if (storedToken && window.location.pathname.endsWith("index.html")) {
    console.log("[Auth] token found in localStorage -> redirecting to dashboard");
    window.location.href = "dashboard.html";
    return;
  }

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      // clear message
      if (msgEl) msgEl.textContent = "";

      const username = document.getElementById("username").value.trim();
      const password = document.getElementById("password").value.trim();

      // basic check
      if (!username || !password) {
        if (msgEl) msgEl.textContent = "Vui lòng nhập username và password.";
        return;
      }

      try {
        // Gọi API login
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({ username, password })
        });

        // Log chi tiết để debug
        console.log("[Login] HTTP status:", res.status, res.statusText);
        const text = await res.text(); // đọc raw text để ghi log
        console.log("[Login] raw response text:", text);

        // Thử parse json nếu có thể
        let data = null;
        try { data = JSON.parse(text); } catch (err) { data = null; }

        console.log("[Login] parsed JSON:", data);

        // Nếu HTTP 2xx
        if (res.ok) {
          // Lấy token theo nhiều cấu trúc
          const token = extractToken(data) || extractToken(text);
          if (token) {
            localStorage.setItem("token", token);
            // lưu thêm username cho hiển thị
            localStorage.setItem("username", username);
            console.log("[Login] token saved to localStorage.");
            window.location.href = "dashboard.html";
            return;
          } else {
            // thành công (res.ok) nhưng không tìm token -> có thể API trả success + user data
            if (data && (data.success === true || data.status === "success")) {
              // nếu API không trả token, bạn có thể lưu 1 flag đăng nhập tạm
              localStorage.setItem("token", "no-token-provided");
              localStorage.setItem("username", username);
              console.warn("[Login] server returned success but no token found. Stored fallback token.");
              window.location.href = "dashboard.html";
              return;
            }
          }
        }

        // Nếu đến đây: lỗi
        // 1) hiển thị thông báo rõ ràng từ server nếu có
        if (data && data.message) {
          if (msgEl) msgEl.textContent = data.message;
        } else if (data && data.error) {
          if (msgEl) msgEl.textContent = data.error;
        } else {
          if (msgEl) msgEl.textContent = `Đăng nhập thất bại (HTTP ${res.status}).`;
        }

      } catch (err) {
        console.error("[Login] Exception:", err);
        if (msgEl) msgEl.textContent = "Lỗi mạng hoặc CORS. Kiểm tra Console/Network.";
      }
    });
  }

  // ------------------- DASHBOARD PAGE -------------------
  const productListEl = document.getElementById("productList") || document.getElementById("cakes") || document.getElementById("productList");
  if (productListEl) {
    // kiểm tra token, nếu không có -> quay về login
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Bạn chưa đăng nhập. Quay về trang đăng nhập.");
      window.location.href = "index.html";
      return;
    }

    // Hiển thị username nếu có
    const usernameEl = document.getElementById("welcome-text");
    const storedUser = localStorage.getItem("username");
    if (usernameEl && storedUser) usernameEl.textContent = `Xin chào, ${storedUser}!`;

    // Hàm lấy danh sách cakes (hỗ trợ page & limit)
    async function fetchCakes(page = 1, limit = 9) {
      try {
        const url = `${API_URL}/cakes?page=${page}&limit=${limit}`;
        console.log("[Fetch cakes] GET", url);
        const res = await fetch(url, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            // nếu server yêu cầu auth cho GET thì set header Authorization
            ...(token && token !== "no-token-provided" ? { "Authorization": `Bearer ${token}` } : {})
          }
        });

        console.log("[Fetch cakes] status:", res.status);
        const data = await res.json().catch(() => null);
        console.log("[Fetch cakes] data:", data);

        if (!res.ok) {
          // hiển thị lỗi từ server
          if (data && data.message) productListEl.innerHTML = `<p style="color:red">${data.message}</p>`;
          else productListEl.innerHTML = `<p style="color:red">Lỗi khi tải danh sách bánh (HTTP ${res.status})</p>`;
          return;
        }

        // API trả { success: true, data: [...] }
        const items = data && data.data ? data.data : (Array.isArray(data) ? data : []);
        if (!items.length) {
          productListEl.innerHTML = "<p>Không có bánh nào.</p>";
          return;
        }

        // Render items
        productListEl.innerHTML = items.map(p => `
            <div class="product-card">
              <img src="${p.image}" alt="${p.name}" />
              <h3>${p.name}</h3>
              <p>${p.category || ''}</p>
              <p><strong>${(p.price || 0).toLocaleString()}đ</strong></p>
              <p>${p.description || ''}</p>
              <div class="actions">
                <button onclick="openEdit(${p.id})">✏️</button>
                <button onclick="deleteCake(${p.id})">🗑️</button>
              </div>
            </div>`).join("");

      } catch (err) {
        console.error("[Fetch cakes] Exception:", err);
        productListEl.innerHTML = "<p style='color:red'>Lỗi khi gọi API. Kiểm tra Console/Network.</p>";
      }
    }

    // khởi chạy
    fetchCakes();

    // Expose edit/delete functions (cần token for auth)
    window.openEdit = async function (id) {
      console.log("Open edit modal for id", id);
      // bạn có modal form -> tìm cake trong current list hoặc gọi detail API
      // (nêu cần mình sẽ viết phần modal edit)
    };

    window.deleteCake = async function (id) {
      if (!confirm("Bạn có chắc muốn xóa?")) return;
      try {
        const res = await fetch(`${API_URL}/cakes/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": (token && token !== "no-token-provided") ? `Bearer ${token}` : ""
          }
        });
        const data = await res.json().catch(()=>null);
        console.log("[Delete] res.status", res.status, "data", data);
        if (res.ok && data && data.success) {
          alert("Xóa thành công");
          fetchCakes();
        } else {
          alert(data && data.message ? data.message : `Xóa thất bại (HTTP ${res.status})`);
        }
      } catch (err) {
        console.error("[Delete] Exception:", err);
        alert("Lỗi khi xóa. Kiểm tra Console/Network.");
      }
    };
  }

  // logout (nếu có nút)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      window.location.href = "index.html";
    });
  }
});
