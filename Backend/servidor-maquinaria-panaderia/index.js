const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid'); // Importar uuid
require('dotenv').config();
const fs = require('fs');

// Inicializa la app de Firebase Admin
//const serviceAccount = require('./ClavePrivada.json');
function loadFirebaseConfig() {
  const templatePath = path.join(__dirname, 'ClavePrivada.json');
  let configContent = fs.readFileSync(templatePath, 'utf-8');

  // Reemplazar las variables del template por los valores de entorno
  configContent = configContent.replace(/\$\{(\w+)\}/g, (match, variable) => {
    return process.env[variable] || match;
  });

  return JSON.parse(configContent);
}

const serviceAccount = loadFirebaseConfig();






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
  const { fileData, imageName, description } = req.body;
  if (!fileData || !imageName || !description) {
    return res.status(400).json({ error: 'fileData, imageName, and description are required' });
  }
  next();
}

// Rutas para manejar imágenes
app.post('/upload', validateUploadRequest, async (req, res) => {
  try {
    const { fileData, imageName, description } = req.body;
    const uuid = uuidv4(); // Generar un UUID
    const file = bucket.file(`images/${uuid}.png`); // Usar UUID como nombre de archivo

    // Guarda el archivo en Firebase Storage
    await file.save(Buffer.from(fileData, 'base64'), {
      metadata: { contentType: 'image/png' },
    });

    // Genera una URL firmada para el archivo
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '01-01-2500',
    });

    // Almacena la información en la Realtime Database de Firebase
    const imageInfoRef = admin.database().ref('images').push();
    await imageInfoRef.set({
      uuid, // Usar UUID en lugar de fileName
      imageName,
      description,
      url
    });

    res.status(200).json({ url });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Error uploading file' });
  }
});

app.get('/images', async (req, res) => {
  try {
    const snapshot = await admin.database().ref('images').once('value');
    const images = snapshot.val();

    if (!images) {
      return res.status(200).json([]);
    }

    const imageList = Object.keys(images).map(key => ({
      uuid: images[key].uuid, // Agregar UUID a la lista de imágenes
      imageName: images[key].imageName,
      description: images[key].description,
      url: images[key].url,
    }));

    res.status(200).json(imageList);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Error fetching images' });
  }
});

app.put('/update', async (req, res) => {
  try {
    const { uuid, fileData, imageName, description } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }

    const filePath = `images/${uuid}.png`; // Usar UUID como nombre de archivo
    const file = bucket.file(filePath);

    const [exists] = await file.exists();

    if (!exists) {
      return res.status(404).json({ error: 'File does not exist' });
    }

    if (fileData) {
      // Si hay nueva imagen, elimina el archivo antiguo y guarda el nuevo
      await file.delete();

      const newFile = bucket.file(filePath);
      await newFile.save(Buffer.from(fileData, 'base64'), {
        metadata: { contentType: 'image/png' },
      });

      const [url] = await newFile.getSignedUrl({
        action: 'read',
        expires: '01-01-2500',
      });

      // Actualiza la información en la Realtime Database de Firebase
      const imageInfoRef = admin.database().ref('images');
      const snapshot = await imageInfoRef.orderByChild('uuid').equalTo(uuid).once('value');
      const updates = {};
      snapshot.forEach(childSnapshot => {
        updates[childSnapshot.key] = {
          uuid,
          imageName: imageName || childSnapshot.val().imageName,
          description: description || childSnapshot.val().description,
          url
        };
      });
      await imageInfoRef.update(updates);

      res.status(200).json({ url });
    } else {
      const imageInfoRef = admin.database().ref('images');
      const snapshot = await imageInfoRef.orderByChild('uuid').equalTo(uuid).once('value');
      const updates = {};
      snapshot.forEach(childSnapshot => {
        updates[childSnapshot.key] = {
          uuid,
          imageName: imageName || childSnapshot.val().imageName,
          description: description || childSnapshot.val().description,
          url: childSnapshot.val().url
        };
      });
      await imageInfoRef.update(updates);

      res.status(200).json({ message: 'Image metadata updated successfully' });
    }
  } catch (error) {
    console.error('Error updating file:', error);
    res.status(500).json({ error: 'Error updating file' });
  }
});

app.put('/update-metadata', async (req, res) => {
  try {
    const { uuid, imageName, description } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }

    const imageInfoRef = admin.database().ref('images');
    const snapshot = await imageInfoRef.orderByChild('uuid').equalTo(uuid).once('value');

    if (!snapshot.exists()) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const updates = {};
    snapshot.forEach(childSnapshot => {
      updates[childSnapshot.key] = {
        ...childSnapshot.val(),
        imageName: imageName || childSnapshot.val().imageName,
        description: description || childSnapshot.val().description,
      };
    });

    await imageInfoRef.update(updates);

    res.status(200).json({ message: 'Metadata updated successfully' });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ error: 'Error updating metadata' });
  }
});

app.delete('/delete', async (req, res) => {
  try {
    const { uuid } = req.body;
    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }
    const filePath = `images/${uuid}.png`; // Usar UUID como nombre de archivo
    const file = bucket.file(filePath);

    // Elimina el archivo del bucket
    await file.delete();

    // Elimina la información de la imagen en la Realtime Database
    const imageInfoRef = admin.database().ref('images');
    const snapshot = await imageInfoRef.orderByChild('uuid').equalTo(uuid).once('value');
    const updates = {};
    snapshot.forEach(childSnapshot => {
      updates[childSnapshot.key] = null;
    });
    await imageInfoRef.update(updates);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Error deleting file' });
  }
});

app.post('/submit-presupuesto', async (req, res) => {
  try {
    const { presupuesto } = req.body;
    const { presupuesto_email } = req.body;
    const { presupuesto_numero } = req.body;
    const { presupuesto_nombre } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'contacto.mariogaete@gmail.com',
      subject: 'Solicitud de Presupuesto',
      text: `Detalles del presupuesto: ${presupuesto}`,
      text: `Email: ${presupuesto_email}`,
      text: `Número: ${presupuesto_numero}`,
      text: `Nombre: ${presupuesto_nombre}`
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

// Manejar Login
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Credenciales del usuario
    const storedUsername = 'Administrador';
    const storedPasswordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    if (username !== storedUsername) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, storedPasswordHash);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generar token
    const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Error during login' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});