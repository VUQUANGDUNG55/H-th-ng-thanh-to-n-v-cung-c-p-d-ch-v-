document.addEventListener("DOMContentLoaded", function() {
    updateCurrentMonth();
    handleRegister();
    handleLogin();
    handleLogout();
    loadUserInfo();
    loadInvoices();
    displayPaymentInfo();
    displayConfirmationInfo();
    loadOrderHistory();
    loadPersonalInfo();
    loadAdminInvoices();
    loadServices();
});

// 🏠 Cập nhật tháng hiện tại
function updateCurrentMonth() {
    let today = new Date();
    let month = today.getMonth() + 1;
    let monthElem = document.getElementById("current-month");
    if (monthElem) monthElem.innerText = month;
}

// 📝 Xử lý đăng ký tài khoản
function handleRegister() {
    let registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let username = document.getElementById("reg-username").value;
            let email = document.getElementById("reg-email").value;
            let password = document.getElementById("reg-password").value;
            
            if (localStorage.getItem(username)) {
                alert("Tên đăng nhập đã tồn tại! Chuyển hướng đến trang đăng nhập...");
                window.location.href = "login.html";
                return;
            }

            let userData = {
                username: username,
                email: email,
                password: password,
                invoices: []
            };
            localStorage.setItem(username, JSON.stringify(userData));
            alert("Đăng ký thành công! Chuyển hướng đến đăng nhập...");
            window.location.href = "login.html";
        });
    }
}

// 🔑 Xử lý đăng nhập
function handleLogin() {
    let loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();
            let username = document.getElementById("username").value;
            let password = document.getElementById("password").value;
            
            let storedUser = localStorage.getItem(username);
            if (storedUser) {
                let userData = JSON.parse(storedUser);
                if (userData.password === password) {
                    localStorage.setItem("user", username);
                    alert("Đăng nhập thành công! Chuyển hướng đến dashboard...");
                    window.location.href = "dashboard.html";
                } else {
                    alert("Mật khẩu không đúng!");
                }
            } else {
                alert("Tên đăng nhập không tồn tại!");
            }
        });
    }
}

// 🚪 Xử lý đăng xuất
function handleLogout() {
    let logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function() {
            localStorage.removeItem("user");
            alert("Đăng xuất thành công!");
            window.location.href = "index.html";
        });
    }
}

// 👤 Hiển thị thông tin khách hàng trên dashboard
function loadUserInfo() {
    let user = localStorage.getItem("user");
    if (user && document.getElementById("customer-name")) {
        document.getElementById("customer-name").innerText = user;
    }
}

// 📜 Hiển thị danh sách dịch vụ
function loadServices() {
    let serviceList = document.getElementById("service-list");
    if (serviceList) {
        const services = [
            { service: "Internet", amount: 200000 },
            { service: "Truyền hình", amount: 150000 },
            { service: "Điện thoại", amount: 100000 }
        ];

        serviceList.innerHTML = "";
        services.forEach((item, index) => {
            serviceList.innerHTML += `
                <tr>
                    <td><input type="checkbox" class="service-checkbox" data-index="${index}" data-amount="${item.amount}" data-service="${item.service}"></td>
                    <td>${item.service}</td>
                    <td>${item.amount}đ</td>
                </tr>
            `;
        });

        const checkboxes = document.querySelectorAll(".service-checkbox");
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("change", updateSelectedServices);
        });
    }
}

// Cập nhật danh sách dịch vụ đã chọn và tổng số tiền
function updateSelectedServices() {
    const checkboxes = document.querySelectorAll(".service-checkbox:checked");
    let total = 0;
    let selectedServices = [];
    const selectedServicesList = document.getElementById("selected-services-list");

    checkboxes.forEach(checkbox => {
        const amount = parseInt(checkbox.getAttribute("data-amount"));
        const service = checkbox.getAttribute("data-service");
        total += amount;
        selectedServices.push({ service, amount });
    });

    // Cập nhật bảng dịch vụ đã chọn
    if (selectedServicesList) {
        selectedServicesList.innerHTML = "";
        selectedServices.forEach(item => {
            selectedServicesList.innerHTML += `
                <tr>
                    <td>${item.service}</td>
                    <td>${item.amount}đ</td>
                    <td><button onclick="confirmPayment('${item.service}', ${item.amount})">Xác nhận</button></td>
                </tr>
            `;
        });
    }

    // Cập nhật tổng số tiền
    document.getElementById("total-amount").innerText = total;
    localStorage.setItem("selectedServices", JSON.stringify(selectedServices));
}

// Chuyển hướng đến trang thanh toán
function proceedToPayment() {
    const selectedServices = JSON.parse(localStorage.getItem("selectedServices") || "[]");
    if (selectedServices.length === 0) {
        alert("Vui lòng chọn ít nhất một dịch vụ!");
        return;
    }
    
    const total = selectedServices.reduce((sum, item) => sum + item.amount, 0);
    localStorage.setItem("servicePrice", total);
    localStorage.setItem("selectedService", selectedServices.map(s => s.service).join(", "));
    window.location.href = "payment.html";
}

// 📜 Hiển thị hóa đơn theo tháng
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
            })
            .catch(error => console.error('Error:', error));
    }
}

// 💳 Chọn dịch vụ để thanh toán
function confirmPayment(service, price) {
    localStorage.setItem("selectedService", service);
    localStorage.setItem("servicePrice", price);
    window.location.href = "payment.html";
}

// 🔄 Hiển thị thông tin trên trang thanh toán
function displayPaymentInfo() {
    if (window.location.pathname.includes("payment.html")) {
        document.getElementById("service-name").innerText = localStorage.getItem("selectedService");
        document.getElementById("service-price").innerText = localStorage.getItem("servicePrice");
    }
}

// ✅ Xử lý thanh toán
function processPayment() {
    let user = localStorage.getItem("user");
    let service = localStorage.getItem("selectedService");
    let price = localStorage.getItem("servicePrice");
    let date = new Date().toLocaleDateString();

    let userData = JSON.parse(localStorage.getItem(user));
    userData.invoices.push({
        date: date,
        service: service,
        amount: price
    });
    localStorage.setItem(user, JSON.stringify(userData));

    localStorage.setItem("confirmedService", service);
    localStorage.setItem("confirmedAmount", price);
    window.location.href = "confirmation.html";
}

// 🎉 Hiển thị thông tin xác nhận
function displayConfirmationInfo() {
    if (window.location.pathname.includes("confirmation.html")) {
        document.getElementById("confirmed-service").innerText = localStorage.getItem("confirmedService");
        document.getElementById("confirmed-amount").innerText = localStorage.getItem("confirmedAmount");
    }
}

// 📜 Hiển thị lịch sử hóa đơn
function loadOrderHistory() {
    let orderHistory = document.getElementById("order-history");
    if (orderHistory) {
        let user = localStorage.getItem("user");
        if (user) {
            let userData = JSON.parse(localStorage.getItem(user));
            orderHistory.innerHTML = "";
            userData.invoices.forEach(invoice => {
                orderHistory.innerHTML += `
                    <tr>
                        <td>${invoice.date}</td>
                        <td>${invoice.service}</td>
                        <td>${invoice.amount}đ</td>
                    </tr>
                `;
            });
        }
    }
}

// 👤 Hiển thị và cập nhật thông tin cá nhân
function loadPersonalInfo() {
    let user = localStorage.getItem("user");
    if (user && document.getElementById("username")) {
        let userData = JSON.parse(localStorage.getItem(user));
        document.getElementById("username").value = userData.username;
        document.getElementById("email").value = userData.email;

        let form = document.querySelector("form");
        if (form) {
            form.addEventListener("submit", function(event) {
                event.preventDefault();
                userData.email = document.getElementById("email").value;
                localStorage.setItem(user, JSON.stringify(userData));
                alert("Cập nhật thông tin thành công!");
            });
        }
    }
}

// 🛠 Hiển thị danh sách hóa đơn cho admin
function loadAdminInvoices() {
    let invoiceList = document.getElementById("invoice-list");
    if (invoiceList) {
        let allInvoices = [];
        for (let i = 0; i < localStorage.length; i++) {
            let key = localStorage.key(i);
            if (key !== "user") {
                let userData = JSON.parse(localStorage.getItem(key));
                userData.invoices.forEach(invoice => {
                    allInvoices.push({
                        user: userData.username,
                        ...invoice
                    });
                });
            }
        }
        
        invoiceList.innerHTML = "";
        allInvoices.forEach(invoice => {
            invoiceList.innerHTML += `
                <tr>
                    <td>${invoice.user}</td>
                    <td>${invoice.service}</td>
                    <td>${invoice.amount}đ</td>
                    <td>${invoice.date}</td>
                </tr>
            `;
        });
    }
}