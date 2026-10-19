<?php
require_once __DIR__ . '/connect.php';

$page = valid_page($_GET['page'] ?? 'personal');

include __DIR__ . '/includes/header.php';
include __DIR__ . '/includes/menu-bar.php';
include __DIR__ . '/includes/content.php';
include __DIR__ . '/includes/footer.php';
