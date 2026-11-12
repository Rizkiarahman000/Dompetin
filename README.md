# Dompetin — PWA Catatan Keuangan

Aplikasi **Progressive Web App (PWA)** untuk mencatat pemasukan dan pengeluaran
harian. Dibuat dari awal dengan tema bebas, memakai teknologi yang sama seperti modul
praktikum: **React + Vite + vite-plugin-pwa**.

> **Identitas**
> Nama: **Rizkia Rahman**
> NIM: **21120124130086**
> Kelompok: **21**

---

## ✨ Fitur

- **3 halaman yang dapat dinavigasi** (tab atas di desktop, tab bawah di mobile):
  - **Beranda** — saldo, ringkasan pemasukan/pengeluaran bulan ini, transaksi terbaru, dan grafik pengeluaran per kategori.
  - **Transaksi** — daftar transaksi lengkap dengan pencarian, filter jenis, dan **CRUD penuh** (tambah, lihat, ubah, hapus).
  - **Profil** — nama, NIM, kelompok, ringkasan, info aplikasi, panduan pasang, dan reset data.
- **PWA**:
  - Dapat di-*install* (manifest + ikon 192/512 + `beforeinstallprompt`).
  - **Bekerja offline** — service worker (Workbox) mem-precache app shell; seluruh data disimpan di `localStorage`.
  - Banner status offline & tombol pasang aplikasi.
- **Responsif** — layout desktop & mobile (bottom tab bar), mendukung *safe area* iOS.
- **Aksesibel** — fokus terlihat, label ARIA, kontras memadai.

## 🧱 Teknologi

| Bagian | Teknologi |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| PWA | vite-plugin-pwa (Workbox) |
| Ikon | lucide-react |
| Penyimpanan | `localStorage` (offline-first) |
| Styling | CSS murni (design token) |

## 🚀 Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

### Build produksi

```bash
npm run build
npm run preview
```

## ☁️ Deploy ke Vercel

1. Buat repository GitHub baru, misalnya `Dompetin`.
2. Dari folder ini, jalankan:

   ```bash
   git init
   git add .
   git commit -m "Dompetin - PWA catatan keuangan"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/Dompetin.git
   git push -u origin main
   ```

3. Buka [vercel.com](https://vercel.com) → **Add New… → Project** → import repository
   `Dompetin`.
4. Vercel otomatis mendeteksi **Vite**. Pastikan:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Klik **Deploy**. Setelah selesai, salin URL `https://<project>.vercel.app`.
6. Buka URL tersebut, lalu uji:
   - Navigasi Beranda / Transaksi / Profil.
   - Tambah, ubah, dan hapus transaksi.
   - **Install** aplikasi dari menu browser.
   - Matikan internet → reload → aplikasi tetap terbuka (offline).

> Tidak perlu environment variable atau database — semua data lokal di perangkat.

## 📁 Struktur

```
src/
  components/   Header, TabBar, Footer, PWABadge, TransactionModal, TransactionRow, dll.
  hooks/        useTransactions (CRUD + ringkasan + persistensi localStorage)
  pages/        Dashboard, Transactions, Profile
  utils/        storage, format (Rupiah/tanggal), categories
  App.jsx       navigasi tab + toast + layout
  index.css     design system
public/
  icon.svg, icon-192.png, icon-512.png, apple-touch-icon.png
```

## 🔒 Catatan data

Semua transaksi disimpan di `localStorage` perangkat (key `dompetin.transactions`).
Data tidak dikirim ke server mana pun. Gunakan tombol **Hapus semua data** di halaman
Profil untuk membersihkannya.
