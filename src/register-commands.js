import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

if (!process.env.DISCORD_TOKEN || !process.env.CLIENT_ID) {
  console.error('Isi DISCORD_TOKEN dan CLIENT_ID terlebih dahulu di environment variables.');
  process.exit(1);
}
const commands = [
  new SlashCommandBuilder().setName('play').setDescription('Putar lagu atau tambahkan ke antrean').addStringOption(o => o.setName('query').setDescription('Judul lagu atau URL').setRequired(true)),
  new SlashCommandBuilder().setName('skip').setDescription('Lewati lagu saat ini'),
  new SlashCommandBuilder().setName('stop').setDescription('Hentikan musik dan bersihkan antrean'),
  new SlashCommandBuilder().setName('queue').setDescription('Lihat lagu yang sedang diputar dan antrean')
].map(c => c.toJSON());
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
console.log('✅ Slash commands berhasil didaftarkan.');
