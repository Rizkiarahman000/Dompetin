# Dompetin — PWA Catatan Pengeluaran

Aplikasi **Progressive Web App (PWA)** untuk mencatat dan mengelola **pengeluaran
harian**. Dibuat dengan teknologi yang sama seperti modul praktikum: **React + Vite +
vite-plugin-pwa + Supabase**.

> **Identitas**
> Nama: **Rizkia Rahman**
> NIM: **21120124130086**
> Kelompok: **21**

---

## ✨ Fitur

- **3 halaman yang dapat dinavigasi** (tab atas di desktop, tab bawah di mobile):
  - **Beranda** — ringkasan pengeluaran bulan ini & hari ini, rata-rata harian,
    kategori terboros, **grafik pengeluaran Harian/Mingguan/Bulanan**, pengeluaran
    terbaru, dan pengeluaran per kategori.
  - **Pengeluaran** — daftar pengeluaran dengan pencarian, **filter kategori**, dan
    **CRUD penuh** (tambah, lihat, ubah, hapus).
  - **Profil** — nama, NIM, kelompok, ringkasan pengeluaran, **kelola kategori
    pengeluaran** (tambah/edit/hapus), panduan pasang, dan reset data.
- **Kategori kustom** — tambah, edit, dan hapus kategori pengeluaran sendiri
  (nama, ikon, warna); tersimpan di Supabase dan langsung muncul di form.
- **Grafik pengeluaran** — batang bertumpuk mengikuti warna tiap kategori; latar merah
  = periode boros, latar hijau = hemat; ketuk batang untuk melihat rincian dan
  persentase per kategori.
- **Database Supabase** — tabel `public.transactions` (khusus `expense`) dan
  `public.categories`, diakses lewat PostgREST (axios) seperti modul 5.
- **PWA**:
  - Dapat di-*install* (manifest + ikon 192/512 + `beforeinstallprompt`).
  - **Bekerja offline** — service worker (Workbox) mem-precache app shell; data
    terakhir di-cache di `localStorage`, dan perubahan saat offline masuk **antrean
    sinkronisasi** yang dikirim otomatis ketika kembali online.
- **Responsif & aksesibel** — layout desktop/mobile, fokus terlihat, label ARIA.

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

Project Supabase `ppbmod5` (ref `pbngzienqipxluliaxgk`).

**Environment variable** (opsional — ada nilai default di `src/config/api.js`):

```env
VITE_API_BASE_URL=https://pbngzienqipxluliaxgk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_vLr2fsfXaxGXZikVKFpBEw_hDG6YjWT
```

**Tabel `public.transactions`** (aplikasi hanya memakai `type = 'expense'`):

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid (PK) | dibuat di client |
| `type` | text | selalu `expense` |
| `amount` | numeric | nominal > 0 |
| `category` | text | id kategori pengeluaran |
| `note` | text | catatan |
| `date` | date | tanggal pengeluaran |
| `created_at` | timestamptz | default `now()` |

**Tabel `public.categories`** (kategori kustom pengeluaran):

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid (PK) | dibuat di client |
| `type` | text | selalu `expense` |
| `label` | text | nama kategori |
| `icon` | text | nama ikon (lucide) |
| `color` | text | warna aksen (hex) |
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
2. Dari folder ini:

   ```bash
   git init
   git add .
   git commit -m "Dompetin - PWA catatan pengeluaran"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/Dompetin.git
   git push -u origin main
   ```

3. Buka [vercel.com](https://vercel.com) → **Add New… → Project** → import repo.
4. Vercel otomatis mendeteksi **Vite** (build `npm run build`, output `dist`).
5. (Opsional) tambahkan environment variable Supabase di atas.
6. **Deploy**, lalu salin URL `https://<project>.vercel.app`.

## 📁 Struktur

```
src/
  config/api.js        axios client untuk Supabase PostgREST
  services/            transactionService, categoryService
  hooks/               useTransactions, useCategories (cache + sync queue)
  context/             CategoriesContext
  pages/               Dashboard, Transactions, Profile
  components/          Header, TabBar, PWABadge, ExpenseChart, CategoryModal, dll.
  utils/               expenseBuckets, storage, format, categories
  App.jsx              navigasi tab + toast + layout
  index.css            design system
public/
  icon.svg, icon-192.png, icon-512.png, apple-touch-icon.png
```

## 🔄 Cara kerja offline

1. Saat online, data pengeluaran & kategori diambil dari Supabase lalu disimpan ke
   `localStorage` (`dompetin.cache.transactions`, `dompetin.cache.categories`).
2. Saat offline, aplikasi memakai cache tersebut, dan setiap perubahan langsung
   diterapkan ke tampilan + cache.
3. Perubahan yang belum terkirim disimpan di `dompetin.sync.queue` (pengeluaran) dan
   `dompetin.sync.categories` (kategori).
4. Begitu koneksi kembali, antrean dikirim ke Supabase lalu data disegarkan.
