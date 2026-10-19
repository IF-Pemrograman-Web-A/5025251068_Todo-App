document.addEventListener('DOMContentLoaded', () => {
    const mainEl = document.getElementById('main-content');
    const taskForm = document.querySelector('.new-tasks-form');
    const taskList = document.querySelector('.task-list');

    const submitBtnText = document.querySelector('.form-task-button b');
    const formTitle = document.getElementById('form-title');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const detailTitle = document.querySelector('.task-details-task-name');
    const detailDesc = document.querySelector('.task-details-task-desc');
    const detailDeadline = document.querySelector('.task-details-task-deadline');

    const idInput = document.getElementById('form-task-id');
    const nameInput = document.getElementById('form-task-name');
    const tagInput = document.getElementById('form-task-tag');
    const descInput = document.getElementById('form-task-desc');
    const deadlineInput = document.getElementById('form-task-deadline');
    const notificationInput = document.getElementById('form-task-notification');
    const existingImageInput = document.getElementById('form-task-existing-image');
    const imageDataInput = document.getElementById('form-task-image-data');

    /* ---------- Camera (Media Capture and Stream API + Canvas API) ---------- */
    const cameraVideo = document.getElementById('camera-video');
    const cameraCanvas = document.getElementById('camera-canvas');
    const startVideoBtn = document.getElementById('start-video-btn');
    const takeButton = document.getElementById('takeButton');

    let streaming = false;
    let width = 320;
    let height = 0;
    let cameraStream = null;

    async function getStream() {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    }

    function cameraLaunch(stream) {
        cameraVideo.srcObject = stream;
        cameraVideo.play();
    }

    function cameraStop() {
        if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            cameraStream = null;
        }
        cameraVideo.srcObject = null;
        streaming = false;
        startVideoBtn.style.display = 'inline-block';
        takeButton.style.display = 'none';
    }

    startVideoBtn.addEventListener('click', async () => {
        try {
            cameraStream = await getStream();
            cameraLaunch(cameraStream);
            startVideoBtn.style.display = 'none';
            takeButton.style.display = 'inline-block';
        } catch (err) {
            console.error('Error accessing media devices.', err);
            alert('Could not start camera.');
        }
    });

    cameraVideo.addEventListener('canplay', () => {
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

    takeButton.addEventListener('click', () => {
        const context = cameraCanvas.getContext('2d');
        if (width && height) {
            cameraCanvas.width = width;
            cameraCanvas.height = height;
            context.drawImage(cameraVideo, 0, 0, width, height);
            cameraCanvas.style.display = 'block';
            // Dikirim ke PHP lewat hidden input, lalu disimpan sebagai file di uploads/
            imageDataInput.value = cameraCanvas.toDataURL('image/png');
        }
    });

    /* ---------- Preview & Edit (data dari atribut data-* hasil render PHP) ---------- */
    function resetForm() {
        taskForm.reset();
        idInput.value = '';
        existingImageInput.value = '';
        imageDataInput.value = '';
        cameraCanvas.style.display = 'none';
        if (submitBtnText) submitBtnText.textContent = 'Add Task';
        if (formTitle) formTitle.textContent = 'Add New Task';
        cancelEditBtn.style.display = 'none';
        cameraStop();
    }

    taskList.addEventListener('click', (event) => {
        const taskItem = event.target.closest('.task-item');
        if (!taskItem) return;
        const data = taskItem.dataset;

        if (event.target.closest('.task-item-button-preview')) {
            const tag = data.tag || 'General';
            const deadline = data.deadline || 'No deadline';
            const description = data.description || 'No description provided.';

            // textContent supaya aman dari XSS
            detailTitle.textContent = '';
            detailTitle.append(strong('Task Name: '), document.createTextNode(data.name));

            detailDesc.textContent = '';
            detailDesc.append(strong('Tag: ' + tag), document.createElement('br'),
                document.createElement('br'), document.createTextNode(description));
            if (data.image) {
                const img = document.createElement('img');
                img.src = data.image;
                img.alt = 'Task detail image';
                img.style.cssText = 'max-width:200px; border-radius:4px; display:block; margin-top:8px;';
                detailDesc.append(img);
            }

            detailDeadline.textContent = '';
            const time = document.createElement('time');
            time.textContent = deadline;
            detailDeadline.append(strong('Deadline: '), time);
            return;
        }

        if (event.target.closest('.task-item-button-edit')) {
            idInput.value = data.id;
            nameInput.value = data.name;
            tagInput.value = data.tag || '';
            descInput.value = data.description || '';
            deadlineInput.value = data.deadline || '';
            notificationInput.value = data.notification || '';
            existingImageInput.value = data.image || '';
            imageDataInput.value = '';

            if (submitBtnText) submitBtnText.textContent = 'Update Task';
            if (formTitle) formTitle.textContent = 'Edit Task';
            cancelEditBtn.style.display = 'inline-block';
            nameInput.focus();
        }
    });

    function strong(text) {
        const el = document.createElement('strong');
        el.textContent = text;
        return el;
    }

    cancelEditBtn.addEventListener('click', resetForm);

    /* ---------- Mark As Done -> submit form POST ke actions/delete.php ---------- */
    taskList.addEventListener('change', (event) => {
        if (event.target.classList.contains('task-item-checkmark-done')) {
            event.target.closest('form').submit();
        }
    });

    /* ---------- Theme toggle ---------- */
    const toggleBtn = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    toggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    /* ---------- Notification API + Service Worker ---------- */
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }

    // Setelah PHP redirect dari save.php, tampilkan notifikasi untuk task yang baru disimpan
    const flashName = mainEl ? mainEl.dataset.flashName : '';
    if (flashName && 'serviceWorker' in navigator && 'Notification' in window && Notification.permission === 'granted') {
        const flashDeadline = mainEl.dataset.flashDeadline;
        navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('SimplyTodo Reminder', {
                body: `Task "${flashName}" is set for ${flashDeadline || 'soon'}!`,
                icon: './favicon.ico'
            });
        });
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then((registration) => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch((error) => {
                console.error('ServiceWorker registration failed: ', error);
            });
    }
});
