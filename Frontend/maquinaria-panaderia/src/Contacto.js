import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Contacto() {
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/contact-info');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setContactInfo(data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  return (
    <div  style={{ marginTop: '-300px' }}>
      <h1 className="text-center mb-4">Información de Contacto</h1>
      <table className="table table-dark table-striped">
        <thead>
          <tr>
            <th>Información</th>
            <th>Detalles</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Teléfono</td>
            <td>{contactInfo.phone}</td>
          </tr>
          <tr>
            <td>Correo</td>
            <td>{contactInfo.email}</td>
          </tr>
          <tr>
            <td>Dirección</td>
            <td>{contactInfo.address}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Contacto;
