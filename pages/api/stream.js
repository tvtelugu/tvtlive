import { youtube } from 'scrape-youtube';

export default async function handler(req, res) {
  try {
    const videos = [
      { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up' },
      { id: '9bZkp7q19f0', title: 'Gangnam Style' }
    ];

    let m3uContent = '#EXTM3U\n';
    
    for (const video of videos) {
      m3uContent += `#EXTINF:-1,${video.title}\n`;
      m3uContent += `https://youtube.com/watch?v=${video.id}\n`;
    }

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(m3uContent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
