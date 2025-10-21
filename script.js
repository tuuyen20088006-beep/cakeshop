// === LOGIN ===
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
  
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const error = document.getElementById("error");
  
        try {
          const res = await fetch("https://banhngot.fitlhu.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          });
  
          if (!res.ok) throw new Error("Sai tài khoản hoặc mật khẩu!");
          const data = await res.json();
  
          localStorage.setItem("token", data.token);
          window.location.href = "dashboard.html";
        } catch (err) {
          error.textContent = err.message;
        }
      });
    }
  
    // === DASHBOARD ===
    const productList = document.getElementById("productList");
    if (productList) {
      const products = [
        { name: "Bánh Tiramisu", price: 45000, img: "https://i.imgur.com/JmFv0Jq.jpg" },
        { name: "Bánh Phô Mai Dâu", price: 55000, img: "https://i.imgur.com/4fL5l7F.jpg" },
        { name: "Bánh Cupcake", price: 30000, img: "https://i.imgur.com/RutY2wb.jpg" },
      ];
  
      let cart = [];
  
      function renderProducts() {
        productList.innerHTML = "";
        products.forEach((p, i) => {
          const div = document.createElement("div");
          div.className = "product-card";
          div.innerHTML = `
            <img src="${p.img}" alt="${p.name}">
            <h3>${p.name}</h3>
            <p>${p.price}đ</p>
            <button onclick="addToCart(${i})">Thêm vào giỏ</button>
          `;
          productList.appendChild(div);
        });
      }
  
      renderProducts();
  
      window.addToCart = (i) => {
        cart.push(products[i]);
        document.getElementById("cartCount").textContent = cart.length;
        document.getElementById("cartModal").style.display = "flex";
        renderCart();
      };
  
      function renderCart() {
        const cartItems = document.getElementById("cartItems");
        const cartTotal = document.getElementById("cartTotal");
        cartItems.innerHTML = "";
        let total = 0;
        cart.forEach((c) => {
          const li = document.createElement("li");
          li.textContent = `${c.name} - ${c.price}đ`;
          cartItems.appendChild(li);
          total += c.price;
        });
        cartTotal.textContent = total;
      }
  
      document.getElementById("closeCart").onclick = () => {
        document.getElementById("cartModal").style.display = "none";
      };
  
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
      };
    }
  });
  