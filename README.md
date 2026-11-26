# GTA: San Sidoarjo — Grand Telkom Academy: Sidoarjo 3D

> **Main Langsung Online (GitHub Pages):** https://fdhil273.github.io/gta-san-sidoarjo/

Game cerita siswa 3D interaktif berbasis **Computer Vision (Webcam MediaPipe 21-titik)** + **Three.js & Polyfork 3D** untuk pameran **Dies Natalis ke-7 SMK Telkom Sidoarjo (SKOMDA)**, lengkap dengan logo resmi tim **`Grand Telkom Academy: San Sidoarjo`** dan dukungan **100% Offline Ready**.

## Fitur Lengkap

- **Logo Resmi `Grand Telkom Academy: San Sidoarjo`** tampil di layar loading, layar pembuka, header HUD, hingga billboard 3D di atas gedung kampus!
- **Musik Latar GTA San Sidoarjo (Web Audio BGM):** Musik groove santai bergaya West Coast / Lo-Fi yang berubah nuansa antara pagi & senja, otomatis mengecil (*ducking*) saat bermain Piano 3D, serta punya tombol toggle terpisah (**`🎵`** Musik & **`🔊`** SFX).
- **100% Tanpa Keyboard (*Keyboard-Less / Hands-Free*):** Seluruh game bisa dimainkan penuh lewat gestur tangan di kamera:
  - **`🖐️ Telapak Terbuka`:** Jalan & berlari.
  - **`🤏 Cubit`:** Interaksi misi utama, side-quest (berlian biru), lanjut dialog, & tutup pop-up.
  - **`☝️ ✌️ 🤟` (1–3 Jari):** Pilih jawaban kuis, pilih preset seragam, & pilih aksi di layar Ending (`☝️ Main Ulang`, `✌️ Jelajah Bebas`).
  - **`✊ Kepal`:** Lempar basket (`✊➜🖐️`) & tendang penalti.
  - **`✌️ Peace` (Tahan 2 detik):** Mengaktifkan Easter Egg Rahasia #3 tanpa perlu mengetik keyboard!
- **Seragam Resmi Rompi Marun SMK Telkom Permanen:** Rafi & teman sekelas mengenakan seragam asli SMK Telkom (rompi rajut V-neck marun `#6d1526` berlis abu/putih, kemeja putih, dasi abu-abu, emblem perisai Telkom, sabuk hitam, celana panjang abu-abu `#64748b`, sepatu hitam) — HUD makin bersih tanpa menu ganti seragam.
- **Pilihan Bebas Spoiler:** Tidak ada bocoran *(Benar!)* atau *(+/- poin)* pada tombol pilihan — pengunjung harus berpikir sendiri sebelum memilih!
- **Pertanyaan Kuis Pengetahuan Umum & Sidoarjo (Ramah Semua Pengunjung):** Kuliner khas Sidoarjo (*Lontong Kupang*), makna warna bendera Indonesia, alat musik tradisional (*Angklung*), dan tata surya (*Jupiter*) — tanpa istilah IT/AI yang rumit!
- **Pilihan Berisiko (Bisa Mengurangi Poin!) + Interaksi Random Kampus:**
  - Jawaban ngawur atau aksi iseng (*pencet tabung APAR koridor*, *bolos ke bus depan*, *pukul monitor lab*) akan memotong poin dengan notifikasi **`WADUH!`**.
  - Komentar spontan otomatis saat melewati sudut kampus (*"Wih, banyak banget pialanya!"* di Lorong Piala, loker, parkiran sepeda, tiang bendera, piano, dll.).
- **4 Mini-Game 3D dengan Layar Lega (HUD Otomatis Ringkas saat Mini-Game!):**
  1. **🎹 Piano 3D** (Ruang Seni bersama Pak Hendra)
  2. **🔬 Fokus Mikroskop 3D** (Lab bersama Dinda)
  3. **🏀 Basket Senja 3D** (Lapangan Basket bersama Dimas)
  4. **⚽ Penalti Sepak Bola 3D** melawan **Kiper Manusia 3D Beranimasi** (Lapangan Bola)
- **3 Easter Egg Rahasia:**
  1. Spot *"Here We Go Again"* dekat Bus Sekolah Timur.
  2. **Monumen Emas Kota Udang** tersembunyi di balik pohon sisi timur.
  3. Tahan gestur **Peace ✌️ (2 Jari) selama 2 detik** saat eksplorasi (atau ketik `HESOYAM`/`SKOMDA` bila ada keyboard)!
- **4 Alternative Ending** (termasuk *Secret Ending: Legenda San Sidoarjo*).

## Cara Menjalankan (100% Offline Ready — Tanpa Internet!)

Seluruh *library* (`Three.js`, 53 model & 9 animasi 3D, serta `MediaPipe WASM + hand_landmarker.task`) sudah tersimpan lokal di folder `vendor/` — aman dijalankan meski tanpa koneksi Wi-Fi saat pameran!

Klik dua kali **[jalankan.bat](jalankan.bat)** atau jalankan lewat CMD:

```cmd
cd /d E:\sekolah-cv-3d && node server.mjs
```

Buka **`http://localhost:4173`** di Chrome/Edge.
