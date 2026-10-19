<?php

$stmt = $conn->prepare(
    "SELECT id, name, tag, description, deadline, notification, image
     FROM todos
     WHERE type = ?
     ORDER BY deadline IS NULL, deadline ASC, id DESC"
);
$stmt->bind_param('s', $page);
$stmt->execute();
$result = $stmt->get_result();

$flash = $_SESSION['flash'] ?? null;
unset($_SESSION['flash']);
?>
    <main id="main-content" tabindex="-1"
          <?php if (!empty($flash['name'])): ?>
          data-flash-name="<?= e($flash['name']) ?>"
          data-flash-deadline="<?= e($flash['deadline']) ?>"
          <?php endif; ?>>
        <section class="left-panel">
            <div>
                <div>
                    <h2 class="left-panel-title">Active Tasks — <?= e(ucfirst($page)) ?></h2>
                    <?php if (!empty($flash['message'])): ?>
                        <p class="flash" role="status"><?= e($flash['message']) ?></p>
                    <?php endif; ?>
                </div>
                <ul class="task-list">
                    <?php if ($result->num_rows > 0): ?>
                        <?php while ($row = $result->fetch_assoc()): ?>
                            <li class="task-item"
                                data-id="<?= (int) $row['id'] ?>"
                                data-name="<?= e($row['name']) ?>"
                                data-tag="<?= e($row['tag']) ?>"
                                data-description="<?= e($row['description']) ?>"
                                data-deadline="<?= e($row['deadline']) ?>"
                                data-notification="<?= e($row['notification']) ?>"
                                data-image="<?= e($row['image']) ?>">
                                <h3 class="task-item-title"><?= e($row['name']) ?></h3>
                                <p class="task-item-desc">
                                    <strong>Tag: <?= e($row['tag'] ?: 'General') ?></strong>
                                    <?php if ($row['image']): ?>
                                        <br><img src="<?= e($row['image']) ?>" alt="Captured image for task <?= e($row['name']) ?>"
                                                 style="max-width:100px; margin-top:5px; border-radius:4px;">
                                    <?php endif; ?>
                                </p>
                                <p class="task-deadline"><time><?= e($row['deadline'] ?: 'No deadline') ?></time></p>
                                <button type="button" class="task-item-button-preview"><strong>Preview Task</strong></button>
                                <button type="button" class="task-item-button-edit"><strong>Edit Task</strong></button>

                                <form method="post" action="actions/delete.php" class="done-form">
                                    <input type="hidden" name="id" value="<?= (int) $row['id'] ?>">
                                    <input type="hidden" name="page" value="<?= e($page) ?>">
                                    <label class="checkbox-container">
                                        <input type="checkbox" class="task-item-checkmark-done">
                                        <span class="checkmark">Mark As Done</span>
                                    </label>
                                </form>
                            </li>
                        <?php endwhile; ?>
                    <?php else: ?>
                        <li class="task-empty">Belum ada task di menu <?= e(ucfirst($page)) ?>.</li>
                    <?php endif; ?>
                </ul>
            </div>
        </section>

        <aside class="right-panel">
            <div class="task-details">
                <h2 class="task-details-title">Current Task Details</h2>
                <div class="task-details-details">
                    <h3 class="task-details-task-name"><strong>Task Name: </strong></h3>
                    <p class="task-details-task-desc"><strong>Tag: </strong>
                        <br>
                        <br>
                    </p>
                    <p class="task-details-task-deadline"><strong>Deadline: </strong><time></time></p>
                </div>
            </div>
            <h2 class="right-panel-title" id="form-title">Add New Task</h2>
            <div class="add-new-tasks">
                <form action="actions/save.php" method="post" class="new-tasks-form">
                    <input type="hidden" name="id" id="form-task-id" value="">
                    <input type="hidden" name="page" value="<?= e($page) ?>">
                    <input type="hidden" name="existing_image" id="form-task-existing-image" value="">
                    <input type="hidden" name="image_data" id="form-task-image-data" value="">

                    <div class="form-group">
                        <label for="form-task-name">Task Name:</label>
                        <input type="text" class="form-task-name" id="form-task-name" name="name" maxlength="100" required>
                    </div>
                    <div class="form-group">
                        <label for="form-task-tag">Task Tag:</label>
                        <input type="text" class="form-task-tag" id="form-task-tag" name="tag" maxlength="50">
                    </div>
                    <div class="form-group">
                        <label for="form-task-desc">Description:</label>
                        <textarea class="form-task-desc" id="form-task-desc" name="description"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="form-task-deadline">Deadline:</label>
                        <input type="date" class="form-task-deadline" id="form-task-deadline" name="deadline">
                    </div>
                    <div class="form-group">
                        <label>Task Image:</label>
                        <video id="camera-video" width="320" height="180" autoplay playsinline aria-label="Camera preview" style="background:#ffffff; display:block; margin-bottom:10px;"></video>
                        <button type="button" id="start-video-btn" style="margin-bottom:10px;">Start Video</button>
                        <button type="button" id="takeButton" style="display:none; margin-bottom:10px;">Take Photo</button>
                        <canvas id="camera-canvas" aria-label="Captured photo" style="display:none; max-width:100%; border:1px solid #ccc;"></canvas>
                    </div>
                    <div class="form-group">
                        <label for="form-task-notification">Notification Time:</label>
                        <input type="datetime-local" class="form-task-notification" id="form-task-notification" name="notification">
                    </div>
                    <button type="submit" class="form-task-button"><h2><b>Add Task</b></h2></button>
                    <button type="button" id="cancel-edit-btn" style="display:none;">Cancel Edit</button>
                </form>
            </div>
        </aside>
    </main>
<?php $stmt->close(); ?>
