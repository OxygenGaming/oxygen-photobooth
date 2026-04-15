const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const OpenAI = require('openai');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.static('public'));
app.use(express.json());

const AI_PROMPT = `Edita la imagen manteniendo el rostro, la pose y la identidad exacta de la persona. Transforma la escena para que la persona aparezca dentro de la pantalla de una Game Boy clasica gigante de color azul (#078dfc), como si estuviera dentro de un videojuego. La pantalla debe convertirse en un mundo interactivo estilo videojuego retro, con plataformas, monedas, obstaculos, barra de vida y elementos HUD gaming. La persona debe verse integrada dentro del juego en una pose dinamica, como si estuviera avanzando de nivel. Mantener: rostro exacto, rasgos faciales, peinado, ropa base, esencia natural de la pose. Estilo: mezcla de realismo cinematografico con estetica videojuego retro, iluminacion premium, nostalgia gaming, acabado publicitario viral. Resultado final altamente memorable, creativo y perfecto para redes sociales.`;

app.post('/api/photo', upload.single('photo'), async (req, res) => {
  const filePath = req.file ? req.file.path : null;
  const tempEdited = filePath ? filePath + '_edited.png' : null;

  try {
    if (!filePath) return res.status(400).json({ success: false, error: 'No se recibio foto' });

    // Leer imagen como base64
    const imageData = fs.readFileSync(filePath);
    const base64Image = imageData.toString('base64');
    const mimeType = req.file.mimetype || 'image/jpeg';

    // GPT-4o analiza y describe la transformacion
    const visionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Image}` } },
          { type: 'text', text: `Describe en detalle a la persona en esta imagen (ropa, pose, cabello, rasgos faciales) para usarlo en: ${AI_PROMPT}` }
        ]
      }],
      max_tokens: 500,
    });

    const personDescription = visionResponse.choices[0].message.content;

    // DALL-E 3 genera la imagen con la descripcion detallada
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${AI_PROMPT} La persona tiene estas caracteristicas exactas: ${personDescription}`,
      n: 1,
      size: '1024x1024',
      quality: 'hd',
    });

    const editedImageUrl = imageResponse.data[0].url;

    // Descargar imagen generada
    const { default: fetch } = await import('node-fetch');
    const imgResponse = await fetch(editedImageUrl);
    const imgBuffer = await imgResponse.buffer();
    fs.writeFileSync(tempEdited, imgBuffer);

    // Subir a Cloudinary con expiracion de 1 hora
    const uploaded = await cloudinary.uploader.upload(tempEdited, {
      folder: 'oxygen-photobooth',
      public_id: `foto_${Date.now()}`,
      overwrite: true,
    });

    // Limpiar temporales
    fs.unlinkSync(filePath);
    fs.unlinkSync(tempEdited);

    // Generar QR con URL de descarga
    const downloadUrl = uploaded.secure_url;
    const qrDataUrl = await QRCode.toDataURL(downloadUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#078dfc', light: '#ffffff' },
    });

    res.json({ success: true, qr: qrDataUrl, photoUrl: downloadUrl });

  } catch (error) {
    console.error('Error:', error.message);
    // Limpiar temporales en caso de error
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (tempEdited && fs.existsSync(tempEdited)) fs.unlinkSync(tempEdited);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Oxygen Gaming Photobooth' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Oxygen Photobooth corriendo en puerto ${PORT}`));
