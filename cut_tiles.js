import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputImage = path.join(__dirname, 'public', 'map.png');
const outputDir = path.join(__dirname, 'public', 'maptiles');

console.log('Bắt đầu cắt bản đồ (công đoạn này có thể mất vài phút vì ảnh lớn)...');
console.log('Nguồn: ' + inputImage);
console.log('Đích: ' + outputDir);

sharp(inputImage)
  .png({ quality: 80 })
  .tile({
    size: 256,
    layout: 'google'
  })
  .toFile(outputDir)
  .then(info => {
    console.log('\n✅ CẮT GẠCH HOÀN TẤT!');
    console.log('Đã tạo ra các mức zoom. Bạn có thể xem kết quả trong thư mục /public/maptiles');
    console.log('Sau khi cắt xong, hãy cập nhật TileLayer trong frontend nhé!');
  })
  .catch(err => {
    console.error('❌ LỖI VĂNG RA KHI CẮT TILE:', err);
  });
