# Oxygen Gaming Photobooth

Game Boy AI Photobooth para eventos. Toma una foto, la IA la transforma en una escena de videojuego retro y el usuario la descarga escaneando un QR.

---

## ARCHIVOS DEL PROYECTO

```
oxygen-photobooth/
├── server.js          ← El cerebro del servidor
├── package.json       ← Lista de dependencias
├── .gitignore         ← Archivos a ignorar
└── public/
    ├── index.html     ← La app de la tablet
    └── logo.png       ← Logo Oxygen Gaming
```

---

## VARIABLES DE ENTORNO (pegar en Render)

```
OPENAI_API_KEY        = sk-proj-TU_CLAVE_NUEVA_AQUI
CLOUDINARY_CLOUD_NAME = dfyjrfzc3
CLOUDINARY_API_KEY    = 578894565824214
CLOUDINARY_API_SECRET = PigzLyq6ehJQJ0d_1La8B7LkqEw
```

---

## PASOS PARA SUBIR A GITHUB

1. Ve a github.com → botón verde "New" → nombre: `oxygen-photobooth`
2. NO marques ninguna casilla → clic "Create repository"
3. Verás instrucciones, copia los comandos de "…or push an existing repository"

---

## PASOS PARA DESPLEGAR EN RENDER

1. render.com → "New Web Service"
2. Conecta tu repositorio de GitHub
3. En "Environment Variables" añade las 4 claves de arriba
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Clic "Deploy" → esperar 3 minutos → ¡listo!
