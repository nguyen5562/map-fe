import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sharp(path.join(__dirname, 'public', 'map.png')).metadata().then(m => {
  console.log('WIDTH:', m.width, 'HEIGHT:', m.height);
});
