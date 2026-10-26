import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { LavalinkManager } from 'lavalink-client';

const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'LAVALINK_HOST', 'LAVALINK_PASSWORD'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing environment variables: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in the values.');
  process.exit(1);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const lavalink = new LavalinkManager({
  nodes: [{
    id: 'main',
    host: process.env.LAVALINK_HOST,
    port: Number(process.env.LAVALINK_PORT || 2333),
    authorization: process.env.LAVALINK_PASSWORD,
    secure: (process.env.LAVALINK_SECURE || 'false') === 'true'
  }],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  client: { id: process.env.CLIENT_ID, username: process.env.BOT_USERNAME || 'Dayang Nyonya Koyaaaa' },
  playerOptions: { defaultSearchPlatform: 'ytsearch', onDisconnect: { destroyPlayer: false }, onEmptyQueue: { destroyAfterMs: 30_000 } }
});

client.once(Events.ClientReady, async (bot) => {
  console.log(`✅ Logged in as ${bot.user.tag}`);
  lavalink.init({ ...bot.user, id: bot.user.id });
});

client.on('raw', (packet) => lavalink.sendRawData(packet));
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName, guild, member } = interaction;
  try {
    if (commandName === 'play') {
      const query = interaction.options.getString('query', true);
      const voice = member.voice?.channel;
      if (!voice) return interaction.reply({ content: 'Masuk voice channel dulu ya 🎧', ephemeral: true });
      await interaction.deferReply();
      let player = lavalink.getPlayer(guild.id);
      if (!player) {
        player = lavalink.createPlayer({ guildId: guild.id, voiceChannelId: voice.id, textChannelId: interaction.channelId, selfDeaf: true, selfMute: false, volume: 80 });
      }
      if (player.voiceChannelId !== voice.id) await player.changeVoiceState({ voiceChannelId: voice.id });
      await player.connect();
      const result = await player.search({ query, requester: interaction.user.id });
      if (!result?.tracks?.length) return interaction.editReply('Lagu tidak ditemukan. Coba judul atau URL lain.');
      const track = result.tracks[0];
      await player.queue.add(track);
      if (!player.playing && !player.paused) await player.play();
      return interaction.editReply(`🎶 Ditambahkan ke antrean: **${track.info.title || query}**`);
    }
    if (commandName === 'skip') {
      const player = lavalink.getPlayer(guild.id);
      if (!player?.queue?.current) return interaction.reply('Belum ada lagu yang diputar.');
      await player.skip();
      return interaction.reply('⏭️ Lagu dilewati!');
    }
    if (commandName === 'stop') {
      const player = lavalink.getPlayer(guild.id);
      if (player) { player.queue.clear(); await player.stopPlaying(true, false); await player.disconnect(); }
      return interaction.reply('⏹️ Musik dihentikan dan antrean dibersihkan.');
    }
    if (commandName === 'queue') {
      const player = lavalink.getPlayer(guild.id);
      const tracks = player?.queue?.tracks || [];
      const current = player?.queue?.current;
      const lines = tracks.slice(0, 10).map((t, i) => `${i + 1}. ${t.info.title}`);
      return interaction.reply({ content: `🎵 **Sedang diputar:** ${current?.info?.title || 'Tidak ada'}\n${lines.length ? `**Berikutnya:**\n${lines.join('\n')}` : 'Antrean berikutnya kosong.'}`, ephemeral: false });
    }
  } catch (error) {
    console.error('Command error:', error);
    const message = 'Ada masalah saat menjalankan perintah. Pastikan server Lavalink aktif dan koneksinya benar.';
    if (interaction.deferred || interaction.replied) await interaction.followUp({ content: message, ephemeral: true }).catch(() => {});
    else await interaction.reply({ content: message, ephemeral: true }).catch(() => {});
  }
});

client.on('error', (error) => console.error('Discord client error:', error));
process.on('unhandledRejection', (error) => console.error('Unhandled rejection:', error));
client.login(process.env.DISCORD_TOKEN);
