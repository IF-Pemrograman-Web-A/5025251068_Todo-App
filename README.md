# 5025251068_Todo-App [Task E05 Pemrograman Web A]


## Identitas
|    NRP     |         Nama                 |    Kelas    |
| :--------: | :--------------------------: | :---------: |
| 5025251068 | Satya Mahardika Sandyaditama |      A      |


## Deskripsi Tugas

SimplyTodo adalah sebuah website statis yang berbentuk antarmuka manajemen to-do list sederhana yang diharapkan dapat membantu pengguna dalam mengatur tugas-tugas yang perlu diselesaikan. Website ini dikerjakan sebagai bagian dari kelas Pemrograman Web A.

Pada update E05, website ini diubah menjadi Progressive Web App (PWA) dengan menggunakan app manifest serta dapat dilihat secara offline menggunakan cache Network First. 

## Struktur

```
todo-php/
|-- index.php
|-- config.php
|-- style.css
|-- script.js
|-- sw.js
|-- manifest.json
|-- offline.html
|-- includes/
|   |-- header.php
│   |-- menu-bar.php     
│   |-- content.php      
│   `-- footer.php
|-- actions/
│   |-- save.php         
│   `-- delete.php       
`-- uploads/             
```

## Fitur PWA

- Web App Manifest (`manifest.json`) dengan ikon 192x192 dan 512x512, display `standalone`
- Service Worker (`sw.js`): precache app shell + `offline.html`
- Strategi cache per resource:
  - Halaman PHP: Network First (data dari database harus terbaru, cache hanya cadangan)
  - CSS/JS: Stale-While-Revalidate
  - Foto `uploads/`: Cache First (nama file acak, isi tidak berubah)
- Tombol Install App (`beforeinstallprompt`) dengan fallback petunjuk manual

## Bukti PWA

### App Manifest

1. Manifest

   <img width="1919" height="910" alt="manifest" src="https://github.com/user-attachments/assets/e6906665-7e95-4594-91e5-94b9eb96471d" />

2. Service Worker

   <img width="1919" height="984" alt="serviceworker" src="https://github.com/user-attachments/assets/74109be4-826f-49dd-bf77-b5c98ada42f5" />


### Cache App Shell

1. Page tidak ada di cache

   <img width="1919" height="921" alt="offline-empty" src="https://github.com/user-attachments/assets/ce466285-9fbe-4ff0-a2e9-3472d4ca14ac" />

   <img width="1919" height="986" alt="offline-random" src="https://github.com/user-attachments/assets/3cdb36eb-ffe5-4aaf-ba37-11cfe2cecde5" />

2. Page ada di cache

   <img width="1919" height="894" alt="offline-cached" src="https://github.com/user-attachments/assets/fa853ceb-f70a-4ac0-b7a8-94eade178735" />

3. Add task

   <img width="1919" height="909" alt="add-task" src="https://github.com/user-attachments/assets/6c9abbe9-aea2-49b4-979a-06c2c9699f26" />

   
### App Install

1. Install prompt di Chrome

   <img width="1919" height="990" alt="install-prompt" src="https://github.com/user-attachments/assets/bd7e752c-6b36-4976-bbdb-7675989544b3" />

2. Setelah diinstall

   <img width="1919" height="1031" alt="installed" src="https://github.com/user-attachments/assets/22112b24-393d-4b96-8ca5-fca752d4cafa" />
