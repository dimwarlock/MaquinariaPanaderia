const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const nodemailer = require('nodemailer');

// Inicializa la app de Firebase Admin
const serviceAccount = require('./ClavePrivada.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://maquinariapanaderia-f7f18-default-rtdb.firebaseio.com",
  storageBucket: "maquinariapanaderia-f7f18.appspot.com"
});

const bucket = admin.storage().bucket();

const app = express();
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware para validar los datos de la solicitud
function validateUploadRequest(req, res, next) {
  const { fileName, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ error: 'fileName and fileData are required' });
  }
  // Validar que fileName no contenga caracteres peligrosos
  if (path.basename(fileName) !== fileName) {
    return res.status(400).json({ error: 'Invalid fileName' });
  }
  next();
}

// Rutas para manejar imágenes
app.post('/upload', validateUploadRequest, async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    const file = bucket.file(`images/${fileName}`);

    // Guarda el archivo en Firebase Storage
    await file.save(Buffer.from(fileData, 'base64'), {
      metadata: { contentType: 'image/png' },
    });

    // Genera una URL firmada para el archivo
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2500',
    });

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.get('/images', async (req, res) => {
  try {
    const [files] = await bucket.getFiles({ prefix: 'images/' });
    const imageUrls = await Promise.all(
      files.map(async (file) => {
        const [url] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2500',
        });
        return {
          fileName: path.basename(file.name),
          url
        };
      })
    );

    res.status(200).json(imageUrls);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Error fetching images' });
  }
});

app.put('/update', validateUploadRequest, async (req, res) => {
  try {
    const { fileName, fileData } = req.body;
    const filePath = `images/${fileName}`;
    const file = bucket.file(filePath);
  
    // Verifica si el archivo existe antes de intentar eliminarlo
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ error: 'File does not exist' });
    }
  
    // Elimina el archivo antiguo
    await file.delete();
  
    // Guarda el nuevo archivo
    const newFile = bucket.file(filePath);
    await newFile.save(Buffer.from(fileData, 'base64'), {
      metadata: { contentType: 'image/png' },
    });
  
    // Genera una URL firmada para el archivo actualizado
    const [url] = await newFile.getSignedUrl({
      action: 'read',
      expires: '01-01-2500',
    });
  
    res.status(200).json({ url });
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const { fileName } = req.body;
    if (!fileName) {
      return res.status(400).json({ error: 'fileName is required' });
    }
    const file = bucket.file(`images/${fileName}`);

    // Elimina el archivo del bucket
    await file.delete();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

app.post('/submit-presupuesto', async (req, res) => {
  try {
    const { presupuesto } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'destinatario@gmail.com',
      subject: 'Solicitud de Presupuesto',
      text: `Detalles del presupuesto: ${presupuesto}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Error sending email' });
      }
      console.log('Email sent:', info.response);
      res.status(200).json({ message: 'Email sent' });
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Error submitting form' });
  }
});

// Obtener la información de contacto
app.get('/contact-info', async (req, res) => {
  try {
    const contactInfoRef = admin.database().ref('contactInfo');
    const snapshot = await contactInfoRef.once('value');
    const contactInfo = snapshot.val();

    if (!contactInfo) {
      return res.status(404).json({ error: 'Contact info not found' });
    }

    res.status(200).json(contactInfo);
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({ error: 'Error fetching contact info' });
  }
});

// Actualizar la información de contacto
app.put('/contact-info', async (req, res) => {
  try {
    const { phone, email, address } = req.body;
    
    if (!phone || !email || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const contactInfoRef = admin.database().ref('contactInfo');
    await contactInfoRef.set({ phone, email, address });

    res.status(200).json({ message: 'Contact info updated successfully' });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ error: 'Error updating contact info' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
