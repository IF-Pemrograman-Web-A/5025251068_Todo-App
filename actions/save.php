<?php
require_once __DIR__ . '/../connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$page         = valid_page($_POST['page'] ?? 'personal');
$id           = (int) ($_POST['id'] ?? 0);
$name         = trim($_POST['name'] ?? '');
$tag          = trim($_POST['tag'] ?? '');
$description  = trim($_POST['description'] ?? '');
$deadline     = trim($_POST['deadline'] ?? '');
$notification = $_POST['notification'] ?? '';
$image        = trim($_POST['existing_image'] ?? '');
$imageData    = $_POST['image_data'] ?? '';

if ($name === '') {
    $_SESSION['flash'] = ['message' => 'Nama task wajib diisi.', 'name' => '', 'deadline' => ''];
    header("Location: ../index.php?page=$page");
    exit;
}

// Notification Time (input datetime-local, format Y-m-d\TH:i)
$notificationValue = null;
$n = DateTime::createFromFormat('Y-m-d\TH:i', trim($notification));
if ($n && $n->format('Y-m-d\TH:i') === trim($notification)) {
    $notificationValue = trim($notification);
}

$deadlineValue = null;
if ($deadline !== '') {
    $d = DateTime::createFromFormat('Y-m-d', $deadline);
    if ($d && $d->format('Y-m-d') === $deadline) {
        $deadlineValue = $deadline;
    }
}

if ($imageData !== '' && strpos($imageData, 'data:image/png;base64,') === 0) {
    $binary = base64_decode(substr($imageData, strlen('data:image/png;base64,')), true);

    // Cek signature PNG & batasi ukuran 2MB
    if ($binary !== false && strlen($binary) <= 2 * 1024 * 1024 && strpos($binary, "\x89PNG") === 0) {
        if (!is_dir(UPLOAD_DIR)) {
            mkdir(UPLOAD_DIR, 0755, true);
        }
        $filename = 'task_' . bin2hex(random_bytes(8)) . '.png';
        if (file_put_contents(UPLOAD_DIR . $filename, $binary) !== false) {
            // Hapus foto lama kalau sedang update
            if ($image !== '' && strpos($image, 'uploads/') === 0 && file_exists(__DIR__ . '/../' . $image)) {
                unlink(__DIR__ . '/../' . $image);
            }
            $image = 'uploads/' . $filename;
        }
    }
}


if ($image !== '' && !preg_match('#^uploads/task_[a-f0-9]+\.png$#', $image)) {
    $image = '';
}
$imageValue = $image !== '' ? $image : null;
$tagValue   = $tag !== '' ? $tag : null;

if ($id > 0) {
    // UPDATE (hanya task di menu yang sama)
    $stmt = $conn->prepare(
        "UPDATE todos SET name=?, tag=?, description=?, deadline=?, notification=?, image=?
         WHERE id=? AND type=?"
    );
    $stmt->bind_param('ssssssis', $name, $tagValue, $description, $deadlineValue, $notificationValue, $imageValue, $id, $page);
    $message = 'Task berhasil diperbarui.';
} else {
    // CREATE
    $stmt = $conn->prepare(
        "INSERT INTO todos (name, tag, description, deadline, notification, image, type)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('sssssss', $name, $tagValue, $description, $deadlineValue, $notificationValue, $imageValue, $page);
    $message = 'Task berhasil ditambahkan.';
}

if ($stmt->execute()) {
    $_SESSION['flash'] = [
        'message'  => $message,
        'name'     => $name,
        'deadline' => $deadlineValue ?? '',
    ];
} else {
    $_SESSION['flash'] = ['message' => 'Gagal menyimpan: ' . $stmt->error, 'name' => '', 'deadline' => ''];
}
$stmt->close();

header("Location: ../index.php?page=$page");
exit;
