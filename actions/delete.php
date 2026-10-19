<?php
require_once __DIR__ . '/../connect.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ../index.php');
    exit;
}

$id   = (int) ($_POST['id'] ?? 0);
$page = valid_page($_POST['page'] ?? 'personal');

if ($id > 0) {
    // Ambil path foto dulu supaya filenya ikut dihapus (file handling)
    $sel = $conn->prepare("SELECT image FROM todos WHERE id = ? AND type = ?");
    $sel->bind_param('is', $id, $page);
    $sel->execute();
    $row = $sel->get_result()->fetch_assoc();
    $sel->close();

    $del = $conn->prepare("DELETE FROM todos WHERE id = ? AND type = ?");
    $del->bind_param('is', $id, $page);
    $ok = $del->execute();
    $del->close();

    if ($ok && $row && $row['image'] && preg_match('#^uploads/task_[a-f0-9]+\.png$#', $row['image'])) {
        $path = __DIR__ . '/../' . $row['image'];
        if (file_exists($path)) {
            unlink($path);
        }
    }
    $_SESSION['flash'] = ['message' => $ok ? 'Task selesai dan dihapus.' : 'Gagal menghapus task.', 'name' => '', 'deadline' => ''];
}

header("Location: ../index.php?page=$page");
exit;
