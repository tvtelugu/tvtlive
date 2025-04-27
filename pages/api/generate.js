// pages/api/generate.js
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export default async function handler(req, res) {
  try {
    // Install youtube-dl-exec if not present
    await execAsync('npm install youtube-dl-exec');

    // Load playlist
    const playlistPath = path.join(process.cwd(), 'data', 'playlist.json');
    const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf-8'));
    
    let m3uContent = '#EXTM3U\n';
    m3uContent += `#PLAYLIST:${playlist.title}\n`;
    
    // Process each video
    for (const video of playlist.videos) {
      try {
        // Get stream URL using youtube-dl-exec
        const { stdout } = await execAsync(`npx youtube-dl-exec ${video.url} --get-url --format best`);
        const streamUrl = stdout.trim();
        
        m3uContent += `#EXTINF:-1,${video.title}\n`;
        m3uContent += `${streamUrl}\n`;
      } catch (error) {
        console.error(`Error processing ${video.title}:`, error);
      }
    }
    
    // Save to public folder
    const outputPath = path.join(process.cwd(), 'public', 'tv.m3u8');
    fs.writeFileSync(outputPath, m3uContent);
    
    res.status(200).json({ success: true, message: 'Playlist generated' });
  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}
