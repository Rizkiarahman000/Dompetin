# Dompetin — PWA Catatan Keuangan

Aplikasi **Progressive Web App (PWA)** untuk mencatat pemasukan dan pengeluaran
harian. Dibuat dari awal dengan tema bebas, memakai teknologi yang sama seperti modul
praktikum: **React + Vite + vite-plugin-pwa + Supabase**.

> **Identitas**
> Nama: **Rizkia Rahman**
> NIM: **21120124130086**
> Kelompok: **21**

---

## ✨ Fitur

- **3 halaman yang dapat dinavigasi** (tab atas di desktop, tab bawah di mobile):
  - **Beranda** — saldo, ringkasan pemasukan/pengeluaran bulan ini, transaksi terbaru, dan grafik pengeluaran per kategori.
  - **Transaksi** — daftar transaksi lengkap dengan pencarian, filter jenis, dan **CRUD penuh** (tambah, lihat, ubah, hapus).
  - **Profil** — nama, NIM, kelompok, status koneksi, ringkasan, info aplikasi, panduan pasang, dan reset data.
- **Database Supabase** — tabel `public.transactions` diakses lewat PostgREST (axios), pola yang sama seperti modul 5.
- **PWA**:
  - Dapat di-*install* (manifest + ikon 192/512 + `beforeinstallprompt`).
  - **Bekerja offline** — service worker (Workbox) mem-precache app shell; data terakhir di-cache di `localStorage`, dan perubahan yang dibuat saat offline masuk **antrean sinkronisasi** yang otomatis dikirim saat kembali online.
  - Banner status offline & tombol pasang aplikasi.
- **Responsif** — layout desktop & mobile (bottom tab bar), mendukung *safe area* iOS.
- **Aksesibel** — fokus terlihat, label ARIA, kontras memadai.

## 🧱 Teknologi

| Bagian | Teknologi |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| PWA | vite-plugin-pwa (Workbox) |
| Database | Supabase (PostgREST) |
| HTTP client | axios |
| Ikon | lucide-react |
| Cache offline | `localStorage` + sync queue |
| Styling | CSS murni (design token) |

## 🗄️ Konfigurasi Supabase

Aplikasi memakai project Supabase `ppbmod5` (ref `pbngzienqipxluliaxgk`).

**Environment variable** (opsional — ada nilai default di `src/config/api.js`):

```env
VITE_API_BASE_URL=https://pbngzienqipxluliaxgk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vLr2fsfXaxGXZikVKFpBEw_hDG6YjWT
```

**Skema tabel** (`public.transactions`):

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid (PK) | dibuat di client |
| `type` | text | `income` / `expense` |
| `amount` | numeric | nominal > 0 |
| `category` | text | id kategori |
| `note` | text | catatan |
| `date` | date | tanggal transaksi |
| `created_at` | timestamptz | default `now()` |

RLS aktif dengan policy publik (select/insert/update/delete) agar dapat diakses
memakai *publishable key* — sama seperti pola praktikum.

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
5. (Opsional) Tambahkan Environment Variables `VITE_API_BASE_URL` dan
   `VITE_SUPABASE_PUBLISHABLE_KEY` bila ingin memakai project Supabase lain.
6. Klik **Deploy**, lalu salin URL `https://<project>.vercel.app`.
7. Uji: navigasi 3 halaman, CRUD transaksi, **Install**, lalu matikan internet →
   reload → aplikasi tetap terbuka.

## 📁 Struktur

```
src/
  config/api.js        axios client untuk Supabase PostgREST
  services/            transactionService (list/upsert/delete)
  hooks/               useTransactions (Supabase + cache + sync queue + statistik)
  pages/               Dashboard, Transactions, Profile
  components/          Header, TabBar, Footer, PWABadge, TransactionModal, dll.
  utils/               storage, format (Rupiah/tanggal), categories
  App.jsx              navigasi tab + toast + layout
  index.css            design system
public/
  icon.svg, icon-192.png, icon-512.png, apple-touch-icon.png
```

## 🔄 Cara kerja offline

1. Saat online, daftar transaksi diambil dari Supabase lalu disimpan ke
   `localStorage` (`dompetin.cache.transactions`).
2. Saat offline, aplikasi memakai cache tersebut, dan setiap perubahan langsung
   diterapkan ke tampilan + cache.
3. Perubahan yang belum terkirim disimpan di `dompetin.sync.queue`.
4. Begitu koneksi kembali (`online` event), antrean dikirim ke Supabase lalu data
   disegarkan.
