import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Productos() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/images');
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
            <div key={image.fileName} className="row mb-4">
              <div className="col-md-4">
                <img 
                  src={image.url} 
                  alt={image.fileName} 
                  style={{ width: '100%', height: 'auto', objectFit: 'cover' }} 
                />
              </div>
              <div className="col-md-8">
                <h2>{image.imageName}</h2>
                <p>{image.description}</p>
              </div>
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