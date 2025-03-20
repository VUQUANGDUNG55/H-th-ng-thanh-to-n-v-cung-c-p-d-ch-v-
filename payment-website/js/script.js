document.addEventListener("DOMContentLoaded", function() {
    updateCurrentMonth();
    handleRegister();
    handleLogin();
    handleLogout();
    loadUserInfo();
    loadInvoices();
    displayPaymentInfo();
    displayConfirmationInfo();
});

// Cập nhật tháng hiện tại
function updateCurrentMonth() {
    let today = new Date();
    let month = today.getMonth() + 1;
    let monthElem = document.getElementById("current-month");
    if (monthElem) monthElem.innerText = month;
}

// Xử lý đăng ký tài khoản
function handleRegister() {
    let registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let username = document.getElementById("reg-username").value;
            let email = document.getElementById("reg-email").value;
            let password = document.getElementById("reg-password").value;

            fetch("backend/api.php?action=register", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `username=${username}&email=${email}&password=${password}`
            })
            .then(response => response.json())
            .then(data => {
                let message = document.getElementById("register-message");
                if (data.success) {
                    message.style.color = "green";
                    message.innerText = "Đăng ký thành công! Chuyển hướng...";
                    setTimeout(() => window.location.href = "login.html", 2000);
                } else {
                    message.style.color = "red";
                    message.innerText = data.error;
                }
            });
        });
    }
}

// Xử lý đăng nhập
function handleLogin() {
    let loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;

            fetch("backend/api.php?action=login", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `username=${username}&password=${password}`
            })
            .then(response => response.json())
            .then(data => {
                let message = document.getElementById("login-message");
                if (data.success) {
                    localStorage.setItem("user", username);
                    message.style.color = "green";
                    message.innerText = "Đăng nhập thành công!";
                    setTimeout(() => window.location.href = "dashboard.html", 2000);
                } else {
                    message.style.color = "red";
                    message.innerText = data.error;
                }
            });
        });
    }
}

// Xử lý đăng xuất
function handleLogout() {
    let logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("user");
            window.location.href = "login.html";
        });
    }
}

// Hiển thị thông tin khách hàng trên dashboard
function loadUserInfo() {
    let user = localStorage.getItem("user");
    if (user && document.getElementById("customer-name")) {
        document.getElementById("customer-name").innerText = user;
    }
}

// Hiển thị hóa đơn theo tháng
function loadInvoices() {
    let invoiceList = document.getElementById("billing-list");
    if (invoiceList) {
        fetch("backend/api.php?action=get_invoices")
            .then(response => response.json())
            .then(data => {
                invoiceList.innerHTML = "";
                data.forEach(invoice => {
                    invoiceList.innerHTML += `
                        <tr>
                            <td>${invoice.service}</td>
                            <td>${invoice.amount}đ</td>
                            <td><button onclick="confirmPayment('${invoice.service}', ${invoice.amount})">Xác nhận</button></td>
                        </tr>
                    `;
                });
            });
    }
}

// Chọn dịch vụ để thanh toán
function confirmPayment(service, price) {
    localStorage.setItem("selectedService", service);
    localStorage.setItem("servicePrice", price);
    window.location.href = "payment.html";
}

// Hiển thị thông tin trên trang thanh toán
function displayPaymentInfo() {
    if (window.location.pathname.includes("payment.html")) {
        document.getElementById("service-name").innerText = localStorage.getItem("selectedService");
        document.getElementById("service-price").innerText = localStorage.getItem("servicePrice");
    }
}

// Xử lý thanh toán
function processPayment() {
    let user = localStorage.getItem("user");
    let service = localStorage.getItem("selectedService");
    let price = localStorage.getItem("servicePrice");

    fetch("backend/api.php?action=save_invoice", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `user=${user}&service=${service}&amount=${price}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem("confirmedService", service);
            localStorage.setItem("confirmedAmount", price);
            window.location.href = "confirmation.html";
        }
    });
}

// Hiển thị thông tin xác nhận trên trang confirmation.html
function displayConfirmationInfo() {
    if (window.location.pathname.includes("confirmation.html")) {
        document.getElementById("confirmed-service").innerText = localStorage.getItem("confirmedService");
        document.getElementById("confirmed-amount").innerText = localStorage.getItem("confirmedAmount");
    }
}
