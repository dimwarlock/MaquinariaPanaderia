import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Admin.css';
import { Modal, Button, Form } from 'react-bootstrap';

function Admin() {
  const [image, setImage] = useState(null);
  const [data, setData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageToUpdate, setImageToUpdate] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const [imageInfo, setImageInfo] = useState({
    imageName: '',
    imageDescription: ''
  });

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: ''
  });

  const [showContactModal, setShowContactModal] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files[0]) 
    {
      setImage(e.target.files[0]);
      document.getElementById('fileName').textContent = e.target.files[0].name;
    }
    else
    {
      document.getElementById('fileName').textContent = 'Sin archivo seleccionado';
    }
  };

  const resetImageInfo = () => {
    setImageInfo({
      imageName: '',
      imageDescription: ''
    });
  };

  const handleUpload = async () => {
    resetImageInfo();
    setShowImageModal(true);
  };

  const handleImageModalClose = () => setShowImageModal(false);
  const handleUpdateModalClose = () => setShowUpdateModal(false);

  const handleImageInfoChange = (e) => {
    setImageInfo({ ...imageInfo, [e.target.name]: e.target.value });
  };

  const handleImageInfoSubmit = async (e) => {
    e.preventDefault();
    if (image) 
    {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];
        try 
        {
          const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageName: imageInfo.imageName,
              fileData: base64Image,
              description: imageInfo.imageDescription
            }),
          });

          if (!response.ok) 
          {
            throw new Error('Network response was not ok');
          }

          await response.json();
          setImage(null);
          setImageInfo({ imageName: '', imageDescription: '' });
          fetchData();
          setShowImageModal(false);
        }
        catch (error) 
        {
          console.error('Error uploading file:', error);
        }
      };
    }
  };

  const handleDelete = async (uuid) => {
    try 
    {
      const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uuid }),
      });

      if (!response.ok) 
      {
        throw new Error('Network response was not ok');
      }

      fetchData();
    }
    catch (error) 
    {
      console.error('Error deleting file:', error);
    }
  };

  const handleUpdate = async () => {
    if (imageToUpdate) 
    {
      const selectedData = data.find(item => item.uuid === imageToUpdate);
      if (selectedData) 
      {
        setImageInfo({
          imageName: selectedData.imageName,
          imageDescription: selectedData.description,
        });
        setShowUpdateModal(true);
      }
    }
  };

  const handleUpdateImageSubmit = async (e) => {
    e.preventDefault();
    let base64SelectedImage = null;

    if (selectedImage)
    {
      const readerSelectedImage = new FileReader();
      readerSelectedImage.readAsDataURL(selectedImage);
      readerSelectedImage.onloadend = async () => {
        base64SelectedImage = readerSelectedImage.result.split(',')[1];

        try
        {
          const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/update', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              uuid: imageToUpdate,
              fileData: base64SelectedImage,
              imageName: imageInfo.imageName,
              description: imageInfo.imageDescription
            }),
          });

          if (!response.ok)
          {
            throw new Error('Network response was not ok');
          }

          await response.json();
          setSelectedImage(null);
          setImageToUpdate(null);
          setImageInfo({ imageName: '', imageDescription: '' });
          fetchData();
          setShowUpdateModal(false);
        }
        catch (error)
        {
          console.error('Error updating file:', error);
        }
      };
    }
    else
    {
      try
      {
        const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/update-metadata', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uuid: imageToUpdate,
            imageName: imageInfo.imageName,
            description: imageInfo.imageDescription
          }),
        });

        if (!response.ok)
        {
          throw new Error('Network response was not ok');
        }

        await response.json();
        setImageToUpdate(null);
        setImageInfo({ imageName: '', imageDescription: '' });
        fetchData();
        setShowUpdateModal(false);
      }
      catch (error)
      {
        console.error('Error updating image metadata:', error);
      }
    }
  };

  const fetchData = async () => {
    try
    {
      const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/images');
      if (!response.ok)
      {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setData(data);
    }
    catch (error)
    {
      console.error('Error fetching images:', error);
    }
  };

  const fetchContactInfo = async () => {
    try
    {
      const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/contact-info');
      if (!response.ok)
      {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setContactInfo(data);
    }
    catch (error)
    {
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
    try
    {
      const response = await fetch('https://maquinaria-panaderia-backend.vercel.app/contact-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactInfo),
      });

      if (!response.ok)
      {
        throw new Error('Network response was not ok');
      }

      fetchContactInfo();
      handleContactModalClose();
    }
    catch (error)
    {
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
          style={{ display: 'none' }}
        />
        <label htmlFor="fileInput" className="btn btn-outline-light">
          Seleccionar Imagen
        </label>
        <span className="ml-2" id="fileName" style={{ fontSize: '1rem', marginRight: '1rem', marginLeft: '1rem' }}>
          {image ? image.name : 'No se ha seleccionado una nueva Imágen'}
        </span>
        <button className="btn btn-outline-light mt-2" onClick={handleUpload}>Confirmar Imágen</button>
      </div>

      <Modal show={showImageModal} onHide={handleImageModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Agregar Información de Imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleImageInfoSubmit}>
            <Form.Group controlId="formImageName">
              <Form.Label>Nombre imagen</Form.Label>
              <Form.Control
                type="text"
                name="imageName"
                value={imageInfo.imageName}
                onChange={handleImageInfoChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formImageDescription" className="mt-3">
              <Form.Label>Descripción imagen</Form.Label>
              <Form.Control
                type="text"
                name="imageDescription"
                value={imageInfo.imageDescription}
                onChange={handleImageInfoChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-dark" type="submit">Confirmar</Button>
              <Button variant="outline-dark" onClick={handleImageModalClose}>Cerrar</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

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
            {data.map(({ uuid, imageName }) => (
              <option key={uuid} value={uuid}>{imageName}</option>
            ))}
          </select>
          <button className="btn btn-outline-light" onClick={handleUpdate}>Modificar Imágen</button>
        </div>
      </div>

      <Modal show={showUpdateModal} onHide={handleUpdateModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Modificar Información de Imagen</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateImageSubmit}>
            <Form.Group controlId="formUpdateImageName">
              <Form.Label>Nombre imagen</Form.Label>
              <Form.Control
                type="text"
                name="imageName"
                value={imageInfo.imageName}
                onChange={handleImageInfoChange}
                required
              />
            </Form.Group>
            <Form.Group controlId="formUpdateImageDescription" className="mt-3">
              <Form.Label>Descripción imagen</Form.Label>
              <Form.Control
                type="text"
                name="imageDescription"
                value={imageInfo.imageDescription}
                onChange={handleImageInfoChange}
                required
              />
            </Form.Group>
            <div className="d-flex justify-content-between mt-4">
              <Button variant="outline-dark" type="submit">Confirmar</Button>
              <Button variant="outline-dark" onClick={handleUpdateModalClose}>Cerrar</Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <br />

      <div className="images-grid mt-4">
        <h2>Imágenes</h2>
        <div className="row">
          {data.map(({ uuid, imageName, url }, index) => (
            <div key={uuid} className="col-md-4 mb-4">
              <div className="card">
                <div className="image-container">
                  <img src={url} alt={imageName} className="card-img-top" />
                </div>
              </div>
              <div className="card-body text-center">
                <button className="btn btn-outline-light" onClick={() => handleDelete(uuid)}>Eliminar Imagen</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Admin;