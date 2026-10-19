<?php
$menus = [
    'personal' => 'Personal',
    'shared'   => 'Shared',
];
?>
<nav class="menu-bar" aria-label="Main menu">
    <ul>
        <?php foreach ($menus as $key => $label): ?>
            <li>
                <a href="index.php?page=<?= e($key) ?>"
                   class="<?= $page === $key ? 'active' : '' ?>"
                   <?= $page === $key ? 'aria-current="page"' : '' ?>>
                    <?= e($label) ?>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</nav>
