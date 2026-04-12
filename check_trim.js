import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

sharp(path.join(__dirname, 'public', 'map.png'))
  .trim()
  .toBuffer({ resolveWithObject: true })
  .then(({ info }) => {
    console.log('Original Width: 9465, Original Height: 13833');
    console.log('Trimmed Width:', info.width, 'Trimmed Height:', info.height);
    console.log('Trim Offset X:', info.trimOffsetLeft, 'Trim Offset Y:', info.trimOffsetTop);
  })
  .catch(err => console.error(err));
