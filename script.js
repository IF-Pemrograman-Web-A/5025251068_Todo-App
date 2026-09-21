document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.querySelector('.new-tasks-form');
    const taskList = document.querySelector('.task-list');
    
    const submitBtnText = document.querySelector('.form-task-button b');
    const detailTitle = document.querySelector('.task-details-task-name');
    const detailDesc = document.querySelector('.task-details-task-desc');
    const detailDeadline = document.querySelector('.task-details-task-deadline');

    const nameInput = document.getElementById('form-task-name');
    const tagInput = document.getElementById('form-task-tag');
    const descInput = document.getElementById('form-task-desc');
    const deadlineInput = document.getElementById('form-task-deadline');

    let editingTaskItem = null;

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameVal = nameInput.value.trim();
        const tagVal = tagInput.value.trim();
        const descVal = descInput.value.trim();
        const deadlineVal = deadlineInput.value;

        if (editingTaskItem) {
            editingTaskItem.setAttribute('data-description', descVal || 'No description provided.');
            editingTaskItem.querySelector('.task-item-title').textContent = nameVal;
            editingTaskItem.querySelector('.task-item-desc').innerHTML = `<strong>Tag: ${tagVal || 'General'}</strong>`;
            editingTaskItem.querySelector('.task-deadline time').textContent = deadlineVal || 'No deadline';

            editingTaskItem = null;
            if (submitBtnText) submitBtnText.textContent = 'Add Task';
        } else {
            const newTaskItem = document.createElement('li');
            newTaskItem.className = 'task-item';
            newTaskItem.setAttribute('data-description', descVal || 'No description provided.');
            newTaskItem.innerHTML = `
                <h3 class="task-item-title">${nameVal}</h3>
                <p class="task-item-desc"><strong>Tag: ${tagVal || 'General'}</strong></p>
                <p class="task-deadline"><time>${deadlineVal || 'No deadline'}</time></p>
                <button type="button" class="task-item-button-preview"><strong>Preview Task</strong></button>
                <button type="button" class="task-item-button-edit"><strong>Edit Task</strong></button>
                <label class="checkbox-container">
                    <input type="checkbox" class="task-item-checkmark-done">
                    <span class="checkmark">Mark As Done</span>
                </label>
            `;
            taskList.appendChild(newTaskItem);
        }
        taskForm.reset();
    });

    taskList.addEventListener('click', (event) => {
        const target = event.target;
        const previewBtn = target.closest('.task-item-button-preview');

        if (previewBtn) {
            const taskItem = previewBtn.closest('.task-item');
            
            const name = taskItem.querySelector('.task-item-title').textContent;
            const tagText = taskItem.querySelector('.task-item-desc').textContent;
            const deadline = taskItem.querySelector('.task-deadline time').textContent;
            const description = taskItem.getAttribute('data-description') || 'No description provided.';

            detailTitle.innerHTML = `<strong>Task Name: </strong>${name}`;
            detailDesc.innerHTML = `<strong>${tagText}</strong><br><br>${description}`;
            detailDeadline.innerHTML = `<strong>Deadline: </strong><time>${deadline}</time>`;
            return;
        }

        const editBtn = target.closest('.task-item-button-edit');
        if (editBtn) {
            const taskItem = editBtn.closest('.task-item');

            const name = taskItem.querySelector('.task-item-title').textContent;
            let tag = taskItem.querySelector('.task-item-desc').textContent.replace(/^Tag:\s*/i, '');
            const deadline = taskItem.querySelector('.task-deadline time').textContent;
            const description = taskItem.getAttribute('data-description') || '';

            nameInput.value = name;
            tagInput.value = tag === 'General' ? '' : tag;
            descInput.value = description === 'No description provided.' ? '' : description;
            deadlineInput.value = deadline === 'No deadline' ? '' : deadline;

            editingTaskItem = taskItem;
            if (submitBtnText) submitBtnText.textContent = 'Update Task';
            return;
        }
    });

    taskList.addEventListener('change', (event) => {
        if (event.target.classList.contains('task-item-checkmark-done')) {
            const taskItem = event.target.closest('.task-item');
            
            if (taskItem) {
                if (taskItem === editingTaskItem) {
                    editingTaskItem = null;
                    taskForm.reset();
                    if (submitBtnText) submitBtnText.textContent = 'Add Task';
                }

                setTimeout(() => {taskItem.remove();}, 200);
            }
        }
    });
});