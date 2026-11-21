# PERSONA — FIVE FACES. ONE MIND.

Arsip rahasia interaktif: lima identitas, satu sistem. Dibangun dengan HTML, CSS, dan JavaScript murni (tanpa build step, tanpa framework).

## Cara Menjalankan

1. Buka folder `PERSONA/`.
2. Klik dua kali `index.html` — situs langsung berjalan di browser.
3. (Opsional) Jika ingin lewat server lokal:
   ```
   cd PERSONA
   python3 -m http.server 8000
   ```
   lalu buka `http://localhost:8000`.

Tidak ada dependensi yang perlu di-install. Font (Cinzel + Inter) dimuat dari Google Fonts; jika offline, situs tetap memakai font fallback yang elegan.

## Struktur Folder

```
PERSONA/
├── index.html            # Semua tampilan: login, welcome, arsip, dossier
├── css/
│   └── style.css         # Tema gelap sinematik + responsif
├── js/
│   ├── config.js         # KONFIGURASI KODE AKSES (edit file ini)
│   ├── data.js           # Data & cerita karakter (jangan diubah isi ceritanya)
│   └── script.js         # Logika aplikasi: auth, bintang, diagram, audio
├── images/              # fd.jpg, oa.jpg, ak.jpg, mm.jpg, ja.jpg
└── audio/               # ambient1.mp3, click.mp3, ja_glitch.mp3
```

## Mengisi Kode Nobel (WAJIB sebelum dipakai)

Buka `js/config.js`:

```js
users: [
  { name: "Theo",  code: "" },   // isi: code: "1234"
  ...
],
owner: { name: "OWNER", code: "" }
```

- Isi `code` masing-masing anggota dengan kode 4 digit yang sudah ditentukan.
- Kode yang masih `""` akan ditolak saat login (ACCESS DENIED).
- **OWNER** adalah satu-satunya yang bisa membuka dossier **J.A**. Kode OWNER tidak pernah ditampilkan di antarmuka.

### Catatan keamanan OWNER

`config.js` dikirim bersama frontend, sehingga isi filenya bisa dibuka lewat DevTools browser. Untuk penggunaan lokal/kelompok kecil ini cukup; jika situs dipublikasikan ke internet, pindahkan verifikasi kode OWNER ke endpoint backend (mis. Node/Express) sehingga frontend hanya menerima jawaban `granted: true/false`, bukan kode aslinya.

## Foto Karakter

Letakkan foto dengan nama persis di folder `images/`:

| File | Subjek |
| --- | --- |
| `fd.jpg` | F.D — The Resolve |
| `oa.jpg` | O.A — The Scholar |
| `ak.jpg` | A.K — The Wanderer |
| `mm.jpg` | M.M — The King |
| `ja.jpg` | J.A — The Author |

Jika foto belum ada, dossier otomatis menampilkan placeholder inisial yang elegan — situs tidak error.

## Audio

Letakkan di folder `audio/`:

| File | Fungsi |
| --- | --- |
| `ambient1.mp3` | Musik latar (loop) |
| `click.mp3` | Suara klik tombol |
| `ja_glitch.mp3` | Efek khusus saat membuka J.A. |

Audio tidak diputar sebelum pengguna menekan tombol sound (pojok kanan atas). Status on/off tersimpan otomatis. Jika file audio tidak ditemukan, situs tetap berjalan tanpa suara dan tanpa error.

## Hierarki Diagram (penting)

```
                 J.A  (THE AUTHOR — induk utama, terkunci untuk non-OWNER)
              /   |   |   \
            F.D  O.A  M.M  A.K   (keempatnya turunan LANGSUNG J.A)
```

Tidak ada hubungan induk-anak di antara F.D, O.A, M.M, dan A.K. Keempatnya sejajar.

## Fitur Utama

- Login Nobel: input password, tombol mata show/hide, Enter untuk submit, animasi loading, ACCESS DENIED (glitch) / ACCESS GRANTED.
- Sambutan personal otomatis: "WELCOME, [NAMA]." + partikel.
- Diagram konstelasi responsif dengan garis bercahaya beranimasi (desktop & mobile).
- Dossier lengkap tiap karakter: status, designation, personality, record, traits, caption.
- J.A. terkunci untuk pengunjung biasa; OWNER membuka urutan reveal 6 tahap (denial layers → final reveal).
- Langit bintang berlapis dengan parallax lembut saat scroll, nebula samar, vignette, dan grain sinematik.
- Tombol sound dengan preferensi tersimpan; volume rendah; fallback senyap bila file hilang.
- Responsif: desktop, laptop, tablet, smartphone; tanpa horizontal scroll.
