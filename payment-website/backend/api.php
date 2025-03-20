<?php
header('Content-Type: application/json');
$mysqli = new mysqli("localhost", "root", "", "payment_system");

if ($mysqli->connect_error) {
    die(json_encode(["error" => "Kết nối thất bại: " . $mysqli->connect_error]));
}

$action = $_GET['action'] ?? '';

if ($action === "register") {
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    $checkUser = $mysqli->prepare("SELECT * FROM users WHERE username=?");
    $checkUser->bind_param("s", $username);
    $checkUser->execute();
    $result = $checkUser->get_result();

    if ($result->num_rows > 0) {
        echo json_encode(["error" => "Tên đăng nhập đã tồn tại"]);
    } else {
        $stmt = $mysqli->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $username, $email, $password);
        $stmt->execute();
        echo json_encode(["success" => true]);
    }
}

if ($action === "login") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $mysqli->prepare("SELECT * FROM users WHERE username=?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            echo json_encode(["success" => true, "username" => $user['username']]);
        } else {
            echo json_encode(["error" => "Sai mật khẩu"]);
        }
    } else {
        echo json_encode(["error" => "Tên đăng nhập không tồn tại"]);
    }
}

if ($action === "save_invoice") {
    $user = $_POST['user'];
    $service = $_POST['service'];
    $amount = $_POST['amount'];

    $stmt = $mysqli->prepare("INSERT INTO invoices (user, service, amount, date) VALUES (?, ?, ?, NOW())");
    $stmt->bind_param("ssi", $user, $service, $amount);
    $stmt->execute();
    echo json_encode(["success" => true, "message" => "Hóa đơn đã lưu"]);
}

if ($action === "get_invoices") {
    $user = $_GET['user'];
    $stmt = $mysqli->prepare("SELECT service, amount, date FROM invoices WHERE user=? ORDER BY date DESC");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $invoices = [];
    while ($row = $result->fetch_assoc()) {
        $invoices[] = $row;
    }
    echo json_encode($invoices);
}

$mysqli->close();
?>
