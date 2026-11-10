# 5025251068_Todo-App [Task E05 Pemrograman Web A]


## Identitas
|    NRP     |         Nama                 |    Kelas    |
| :--------: | :--------------------------: | :---------: |
| 5025251068 | Satya Mahardika Sandyaditama |      A      |


## Deskripsi Tugas

SimplyTodo adalah sebuah website statis yang berbentuk antarmuka manajemen todo list sederhana yang diharapkan dapat membantu pengguna dalam mengatur tugas-tugas yang perlu diselesaikan. Website ini dikerjakan sebagai bagian dari kelas Pemrograman Web A.

Pada update E05, website ini diubah menjadi Progressive Web App (PWA) dengan menggunakan app manifest serta dapat dilihat secara offline menggunakan cache Network-First. 

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

### Cache App Shell

### Request Offline

1. Page tidak ada di cache

2. Page ada di cache

### App Install

1. Install Prompt di Chrome

2. Setelah di install
