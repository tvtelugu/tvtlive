import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

export default async function handler(req, res) {
  try {
    // Load playlist
    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
    
    // Generate M3U8 header
    let m3uContent = '#EXTM3U\n';
    m3uContent += `#PLAYLIST:${playlist.title}\n`;
    
    // Process each video
    for (const video of playlist.videos) {
      // Get HLS stream URL using yt-dlp
      const streamUrl = await new Promise((resolve, reject) => {
        exec(`yt-dlp -g "${video.url}"`, (error, stdout, stderr) => {
          if (error) reject(error);
          resolve(stdout.trim());
        });
      });
      
      m3uContent += `#EXTINF:-1,${video.title}\n`;
      m3uContent += `${streamUrl}\n`;
    }
    
    // Save to public folder
    const outputPath = path.join(process.cwd(), 'public', 'tv.m3u8');
    fs.writeFileSync(outputPath, m3uContent);
    
    res.status(200).json({ success: true, message: 'Playlist generated' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

