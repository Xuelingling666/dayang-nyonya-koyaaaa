# Dayang Nyonya Koyaaaa — Discord Music Bot

Starter bot Discord berbasis Node.js + Lavalink. Perintah tersedia: `/play`, `/skip`, `/stop`, `/queue`.

## Penting sebelum deploy
- Butuh Node.js 20+.
- Bot Discord membutuhkan `DISCORD_TOKEN` dan `CLIENT_ID`.
- Bot ini **tidak menyertakan hosting Lavalink**. Lavalink adalah server audio terpisah dan harus berjalan serta dapat diakses bot.
- File konfigurasi Lavalink disediakan sebagai contoh saja. Jangan commit token/password asli ke GitHub.
- Dukungan sumber musik bergantung pada plugin Lavalink yang dipasang dan kebijakan sumber tersebut. YouTube tidak diaktifkan pada contoh konfigurasi Lavalink karena konfigurasi/plugin YouTube perlu disesuaikan dengan versi server.

## Deploy dari GitHub
1. Upload isi repository ini ke GitHub.
2. Di hosting Node.js, pilih repository, branch `main`, dan target folder `.`.
3. Build/install command: `npm install`
4. Start command: `npm start`
5. Isi environment variables sesuai `.env.example` melalui panel hosting (jangan upload `.env`).
6. Jalankan sekali `npm run register` setelah `DISCORD_TOKEN` dan `CLIENT_ID` diatur untuk mendaftarkan slash commands.
7. Pastikan node Lavalink berjalan, lalu masukkan host, port, password, dan secure sesuai konfigurasi server tersebut.

## Menyiapkan Discord application
1. Buka https://discord.com/developers/applications
2. Buat application dan tambahkan Bot.
3. Salin token bot ke environment variable `DISCORD_TOKEN`; jangan bagikan token.
4. Salin Application ID ke `CLIENT_ID`.
5. Undang bot ke server dengan scope `bot` dan `applications.commands`, serta izin View Channels, Send Messages, Connect, dan Speak.

## Struktur
- `src/index.js` — bot utama
- `src/register-commands.js` — pendaftaran slash commands
- `.env.example` — daftar environment variables
- `application.yml.example` — contoh konfigurasi server Lavalink
