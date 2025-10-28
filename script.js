// ----- Chuyển tab đăng nhập / đăng ký -----
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

if (loginTab && registerTab) {
  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.classList.add("active");
    registerForm.classList.remove("active");
  });

  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.classList.add("active");
    loginForm.classList.remove("active");
  });
}

// ----- Giả lập đăng nhập -----
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("loginUser").value.trim();
    const password = document.getElementById("loginPass").value.trim();

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    // Tài khoản admin mặc định
    if (username === "admin" && password === "12345") {
      localStorage.setItem("role", "admin");
      window.location.href = "dashboard.html";
    } else {
      localStorage.setItem("role", "user");
      window.location.href = "dashboard.html";
    }
  });
}

// ----- Kiểm tra quyền trên dashboard -----
const adminLink = document.getElementById("adminLink");
const logoutBtn = document.getElementById("logoutBtn");

if (adminLink) {
  const role = localStorage.getItem("role");
  if (role === "admin") {
    adminLink.style.display = "inline-block";
  }
}

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("role");
  });
}

// ----- Bảo vệ trang add-cake.html -----
if (window.location.pathname.includes("add-cake.html")) {
  const role = localStorage.getItem("role");
  if (role !== "admin") {
    alert("🚫 Bạn không có quyền truy cập trang này!");
    window.location.href = "dashboard.html";
  }
}

// ----- Thêm bánh mới -----
const addCakeForm = document.getElementById("addCakeForm");
const cakeImage = document.getElementById("cakeImage");
const imagePreview = document.getElementById("imagePreview");
const cakeContainer = document.getElementById("cakeContainer");

if (cakeImage) {
  cakeImage.addEventListener("change", () => {
    const file = cakeImage.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview.src = reader.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });
}

if (addCakeForm) {
  addCakeForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("cakeName").value;
    const price = document.getElementById("cakePrice").value;
    const imgSrc = imagePreview.src;

    if (name && price && imgSrc) {
      const cakeCard = document.createElement("div");
      cakeCard.classList.add("cake-card");
      cakeCard.innerHTML = `
        <img src="${imgSrc}" alt="${name}">
        <h3>${name}</h3>
        <p>${parseInt(price).toLocaleString()}₫</p>
      `;
      cakeContainer.appendChild(cakeCard);

      addCakeForm.reset();
      imagePreview.style.display = "none";
      alert("✅ Đã thêm bánh mới thành công!");
    } else {
      alert("Vui lòng nhập đầy đủ thông tin!");
    }
  });
}
