import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Productos() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('http://localhost:5000/images');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Galería de Productos</h1>
      <div className="d-flex flex-column align-items-center">
        {images.length > 0 ? (
          images.map((image) => (
            <div key={image.fileName} className="mb-4">
              <img 
                src={image.url} 
                alt={image.fileName} 
                style={{ width: '100%', maxWidth: '600px', height: 'auto', objectFit: 'cover' }} 
              />
            </div>
          ))
        ) : (
          <p>No hay imágenes disponibles</p>
        )}
      </div>
    </div>
  );
}

export default Productos;
