import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Admin.css';
import { Modal, Button, Form } from 'react-bootstrap';

function Admin() {
  const [image, setImage] = useState(null);
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });

  const [showContactModal, setShowContactModal] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      document.getElementById('fileName').textContent = e.target.files[0].name;
    } else {
      document.getElementById('fileName').textContent = 'Sin archivo seleccionado';
    }
  };

  const handleUpload = async () => {
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        try {
          const response = await fetch('http://localhost:5000/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: image.name,
              fileData: base64Image,
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          await response.json(); // Opcional: manejar la respuesta si es necesario
          setImage(null); // Limpiar el estado de la imagen
          fetchData(); // Recargar las imágenes después de subir
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      };
    }
  };

  const handleDelete = async (fileName) => {
    try {
      const response = await fetch('http://localhost:5000/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchData(); // Recargar las imágenes después de eliminar
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleUpdate = async () => {
    if (selectedImage && imageToUpdate) {
      const readerSelectedImage = new FileReader();
      readerSelectedImage.readAsDataURL(selectedImage);

      readerSelectedImage.onloadend = async () => {
        const base64SelectedImage = readerSelectedImage.result.split(',')[1];

        try {
          const response = await fetch('http://localhost:5000/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: imageToUpdate,
              fileData: base64SelectedImage,
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          await response.json(); // Opcional: manejar la respuesta si es necesario
          setSelectedImage(null); // Limpiar el estado de la imagen seleccionada
          setImageToUpdate(null); // Limpiar el estado de la imagen a actualizar
          fetchData(); // Recargar las imágenes después de actualizar
        } catch (error) {
          console.error('Error updating file:', error);
        }
      };
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/images');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/contact-info');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setContactInfo(data);
    } catch (error) {
      console.error('Error fetching contact info:', error);
    }
  };

  const handleContactModalOpen = () => {
    fetchContactInfo();
    setShowContactModal(true);
  };

  const handleContactModalClose = () => setShowContactModal(false);

  const handleContactChange = (e) => {
    setContactInfo({ ...contactInfo, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      fetchContactInfo(); // Refresh contact info
      handleContactModalClose();
    } catch (error) {
      console.error('Error updating contact info:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container">
      <h1>Administrador</h1>

      <br />
      <br />
      <br />
      <Button variant="outline-light" onClick={handleContactModalOpen}>Editar Información de Contacto</Button>

      <Modal show={showContactModal} onHide={handleContactModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Información de Contacto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleContactSubmit}>
            <Form.Group controlId="formPhone">
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={contactInfo.phone}
                onChange={handleContactChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formEmail" className="mt-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={contactInfo.email}
                onChange={handleContactChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formAddress" className="mt-3">
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={contactInfo.address}
                onChange={handleContactChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-dark" type="submit">Confirmar</Button>
              <Button variant="outline-dark" onClick={handleContactModalClose}>Cerrar</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <br />
      <br />
      <div className="upload-section mt-4">
        <h2>Agregar una Imágen</h2>
        <input
          id="fileInput"
          type="file"
          className="form-control-file"
          onChange={handleImageChange}
          style={{ display: 'none' }} // Ocultar el input de archivo
        />
        <label htmlFor="fileInput" className="btn btn-outline-light">
          Seleccionar Imagen
        </label>
        <span className="ml-2" id="fileName" style={{ fontSize: '1rem', marginRight: '1rem', marginLeft: '1rem' }}>
          {image ? image.name : 'No se ha seleccionado una nueva Imágen'}
        </span>
        <button className="btn btn-outline-light mt-2" onClick={handleUpload}>Confirmar Imágen</button>
      </div>

      <br />
      <br />
      <div className="update-section">
        <h2>Modificar una Imagen</h2>
        <div className="d-flex justify-content-center align-items-center">
          <input
            id="fileInputUpdate"
            type="file"
            className="form-control-file"
            onChange={(e) => setSelectedImage(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <label htmlFor="fileInputUpdate" className="btn btn-outline-light me-2">
            Seleccionar Nueva Imágen
          </label>
          <select className="form-select form-select-sm me-2" onChange={(e) => setImageToUpdate(e.target.value)} style={{ width: '280px' }}>
            <option value="">Seleccione una Imágen a modificar</option>
            {data.map(({ fileName }) => (
              <option key={fileName} value={fileName}>{fileName}</option>
            ))}
          </select>
          <button className="btn btn-outline-light" onClick={handleUpdate}>Modificar Imágen</button>
        </div>
      </div>

      <br></br>

      <div className="images-grid mt-4">
        <h2>Imágenes</h2>
        <div className="row">
          {data.map(({ fileName, url }, index) => (
            <div key={index} className="col-md-4 mb-4">
              <div className="card">
                <div className="image-container">
                  <img src={url} alt={fileName} className="card-img-top" />
                </div>
              </div>
              <div className="card-body text-center">
                <button className="btn btn-outline-light" onClick={() => handleDelete(fileName)}>Eliminar Imagen</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;
