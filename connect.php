<?php
session_start();

$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "tugas_pweb";

mysqli_report(MYSQLI_REPORT_OFF);
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die($conn->connect_error);
}
$conn->set_charset("utf8mb4");

const ALLOWED_PAGES = ['personal', 'shared'];
const UPLOAD_DIR    = __DIR__ . '/uploads/';

function e($value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function valid_page($page): string
{
    return in_array($page, ALLOWED_PAGES, true) ? $page : 'personal';
}
