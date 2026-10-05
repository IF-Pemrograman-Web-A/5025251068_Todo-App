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
    const notificationInput = document.getElementById('form-task-notification');
    const notificationVal = notificationInput ? notificationInput.value : '';

    let editingTaskItem = null;
    let db;

    const request = indexedDB.open('SimplyTodoDB', 1);

    request.onerror = (event) => {
        console.error("IndexedDB error:", event.target.error);
    };

    request.onsuccess = (event) => {
        db = event.target.result;
        loadTodosFromDB();
    };

    request.onupgradeneeded = (event) => {
        const dbInstance = event.target.result;
        if (!dbInstance.objectStoreNames.contains('todos')) {
            dbInstance.createObjectStore('todos', { keyPath: 'id', autoIncrement: true });
        }
    };

    function loadTodosFromDB() {
        if (!db) return;
        taskList.innerHTML = ''; 
        const transaction = db.transaction(['todos'], 'readonly');
        const store = transaction.objectStore('todos');
        const request = store.getAll();

        request.onsuccess = (event) => {
            const todos = event.target.result;
            todos.forEach(todo => renderTaskElement(todo));
        };
    }


    function renderTaskElement(todo) {
        const newTaskItem = document.createElement('li');
        newTaskItem.className = 'task-item';
        newTaskItem.setAttribute('data-id', todo.id);
        newTaskItem.setAttribute('data-description', todo.description || 'No description provided.');
        newTaskItem.setAttribute('data-image', todo.image || '');
        
        let imageHTML = todo.image ? `<br><img src="${todo.image}" alt="Captured Task Image" style="max-width:100px; margin-top:5px; border-radius:4px;">` : '';

        newTaskItem.innerHTML = `
            <h3 class="task-item-title">${todo.name}</h3>
            <p class="task-item-desc"><strong>Tag: ${todo.tag || 'General'}</strong>${imageHTML}</p>
            <p class="task-deadline"><time>${todo.deadline || 'No deadline'}</time></p>
            <button type="button" class="task-item-button-preview"><strong>Preview Task</strong></button>
            <button type="button" class="task-item-button-edit"><strong>Edit Task</strong></button>
            <label class="checkbox-container">
                <input type="checkbox" class="task-item-checkmark-done">
                <span class="checkmark">Mark As Done</span>
            </label>
        `;
        taskList.appendChild(newTaskItem);
    }

    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const startVideoBtn = document.getElementById('start-video-btn');
    const takeButton = document.getElementById('takeButton');

    let streaming = false;
    let width = 320;
    let height = 0;
    let capturedImageData = null;

    async function getStream() {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    function cameraLaunch(stream) {
        cameraVideo.srcObject = stream;
        cameraVideo.play();
    }

    startVideoBtn.addEventListener('click', async () => {
        try {
            const stream = await getStream();
            cameraLaunch(stream);
            startVideoBtn.style.display = 'none';
            takeButton.style.display = 'inline-block';
        } catch (err) {
            console.error("Error accessing media devices.", err);
            alert("Could not start camera.");
        }
    });

    cameraVideo.addEventListener('canplay', (ev) => {
        if (!streaming) {
            height = cameraVideo.videoHeight / (cameraVideo.videoWidth / width);
            if (isNaN(height)) {
                height = width / (4 / 3);
            }
            cameraVideo.setAttribute('width', width);
            cameraVideo.setAttribute('height', height);
            cameraCanvas.setAttribute('width', width);
            cameraCanvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);

    function cameraTakePicture() {
        const context = cameraCanvas.getContext('2d');
        if (width && height) {
            cameraCanvas.width = width;
            cameraCanvas.height = height;
            context.drawImage(cameraVideo, 0, 0, width, height);
            
            const data = cameraCanvas.toDataURL('image/png');
            cameraCanvas.style.display = 'block';
            capturedImageData = data; 
            return data;
        }
    }

    takeButton.addEventListener('click', () => {
        cameraTakePicture();
    });

    taskForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const nameVal = nameInput.value.trim();
        const tagVal = tagInput.value.trim();
        const descVal = descInput.value.trim();
        const deadlineVal = deadlineInput.value;
        const notificationVal = notificationInput.value;
        const imageToSave = capturedImageData || null;

        saveTodoToDB(nameVal, tagVal, descVal, deadlineVal, notificationVal, imageToSave);
    });

    function saveTodoToDB(name, tag, description, deadline, notification, image) {
        const transaction = db.transaction(['todos'], 'readwrite');
        const store = transaction.objectStore('todos');
        
        const todoData = { name, tag, description, deadline, notification, image };

        if (editingTaskItem) {
            todoData.id = Number(editingTaskItem.getAttribute('data-id'));
            store.put(todoData);
            editingTaskItem = null;
            if (submitBtnText) submitBtnText.textContent = 'Add Task';
        } else {
            store.add(todoData);
        }

        transaction.oncomplete = () => {
            loadTodosFromDB();
            taskForm.reset();
            capturedImageData = null;
            if (cameraCanvas) cameraCanvas.style.display = 'none';
        };
    }

    taskList.addEventListener('click', (event) => {
        const target = event.target;
        const previewBtn = target.closest('.task-item-button-preview');

        if (previewBtn) {
            const taskItem = previewBtn.closest('.task-item');
            const name = taskItem.querySelector('.task-item-title').textContent;
            const tagText = taskItem.querySelector('.task-item-desc').textContent;
            const deadline = taskItem.querySelector('.task-deadline time').textContent;
            const description = taskItem.getAttribute('data-description') || 'No description provided.';
            const taskImage = taskItem.getAttribute('data-image');
            let imagePreviewHTML = taskImage ? `<br><br><img src="${taskImage}" alt="Task Detail Image" style="max-width:200px; border-radius:4px;">` : '';

            detailTitle.innerHTML = `<strong>Task Name: </strong>${name}`;
            detailDesc.innerHTML = `<strong>${tagText}</strong><br><br>${description}${imagePreviewHTML}`;
            detailDeadline.innerHTML = `<strong>Deadline: </strong><time>${deadline}</time>`;
            return;
        }

        const editBtn = target.closest('.task-item-button-edit');
        if (editBtn) {
            const taskItem = editBtn.closest('.task-item');
            const name = taskItem.querySelector('.task-item-title').textContent;
            let tag = taskItem.querySelector('.task-item-desc').textContent.replace(/^Tag:\s*/i, '').trim();
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
                const id = Number(taskItem.getAttribute('data-id'));
                const transaction = db.transaction(['todos'], 'readwrite');
                const store = transaction.objectStore('todos');
                store.delete(id);

                transaction.oncomplete = () => {
                    if (taskItem === editingTaskItem) {
                        editingTaskItem = null;
                        taskForm.reset();
                        if (submitBtnText) submitBtnText.textContent = 'Add Task';
                    }
                    taskItem.remove();
                };
            }
        }
    });

    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggleBtn.addEventListener('click', () => {
        let currentTheme = document.documentElement.getAttribute('data-theme');
        let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((registration) => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch((error) => {
                    console.error('ServiceWorker registration failed: ', error);
                });
        });
    }
});