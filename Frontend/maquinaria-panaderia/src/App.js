import React, { useState, useEffect, useRef } from 'react';
import { Route, Routes, Link, useNavigate } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Admin from './Admin';
import Login from './Login';
import Contacto from './Contacto';
import Productos from './Productos';
import { Carousel, Modal, Button, Form, Dropdown } from 'react-bootstrap';
import PrivateRoute from './PrivateRoute';

function App() 
{
  // Constantes
  const [images, setImages] = useState([]);
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({});
  const calidadRef = useRef(null);
  const inicioRef = useRef(null);
  const presupuestoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try 
      {
        const response = await fetch('https://maquinaria-panaderia.vercel.app/images');
        if (!response.ok) 
        {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setImages(data);
      } 
      catch (error) 
      {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const resetForm = () => {
    setFormData({});
  };

  const handleShow = () => {resetForm(); setShow(true);}
  const handleClose = () => setShow(false);
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try 
    {
      const response = await fetch('https://maquinaria-panaderia.vercel.app/submit-presupuesto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) 
      {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Success:', result);

      handleClose();
    } 
    catch (error) 
    {
      console.error('Error submitting form:', error);
    }
  };

  const handleNavigateAndScroll = (path, ref) => {
    navigate(path);
    
    if (ref.current) 
    {
      setTimeout(() => ref.current.scrollIntoView({ behavior: 'smooth' }), 0);
    }
  };

  return (
    <div className="App bg-dark text-white" ref={inicioRef}>
      <header className="App-header">
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top">
          <div className="container">
            <img src='images/Logo.jpg' style={{ height: '60px', width: '60px', marginRight: '20px' }} alt="Logo" />
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse row justify-content-between" id="navbarNav">
              <div className="navbar-nav col">
                <button className="nav-link btn btn-link text-white" onClick={() => handleNavigateAndScroll('/', inicioRef)}>Inicio</button>
                <Link className="nav-link text-white" to="/Productos">Productos</Link>
                <Link className="nav-link text-white" to="/Contacto">Contacto</Link>
                <Dropdown className="nav-item dropdown">
                  <Dropdown.Toggle className="nav-link text-white" variant="link" id="navbarDropdown">
                    Más
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="bg-dark" aria-labelledby="navbarDropdown">
                    <Dropdown.Item className="text-white" onClick={() => handleNavigateAndScroll('/', presupuestoRef)}>Presupuesto</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <div className="col-auto">
                {/*<Link className="btn btn-outline-light" to="/login">Acceso Administrador</Link>*/}
              </div>
            </div>
          </div>
        </nav>

        <div className="container mt-5 pt-5">
          <Routes>
            <Route path="/" element={
              <div>
                <h1 style={{ fontSize: '60px' }}>Mantención y fabricación</h1>
                <div className="row">
                  <div className="col-md-8">
                    <Carousel style={{ marginTop: '30px' }}>
                      {images.length > 0 ? images.map((image) => (
                        <Carousel.Item key={image.fileName}>
                          <img className="d-block mx-auto w-100" src={image.url} alt={image.fileName} style={{ height: '500px', objectFit: 'cover' }} />
                          <Carousel.Caption style={{ textShadow: '2px 2px 2px black' }}>
                            <h3>{image.fileName}</h3>
                          </Carousel.Caption>
                        </Carousel.Item>
                      )) : (
                        <Carousel.Item>
                          <img className="d-block mx-auto w-100" src="/images/placeholder.png" alt="Placeholder" style={{ height: '500px', objectFit: 'cover' }} />
                          <Carousel.Caption style={{ textShadow: '2px 2px 2px black' }}>
                            <h3>No hay imágenes</h3>
                          </Carousel.Caption>
                        </Carousel.Item>
                      )}
                    </Carousel>
                  </div>
                  <div className="col-md-4">
                    <br />
                    <p className="text-right">Técnico en máquinas de la marca Rapallo con más de 40 años de experiencia en el rubro.</p>
                    <br /><br /><br /><br /><br /><br />
                    <img src='images/LogoTransparencia.png' style={{ height: '200px', width: '200px', marginRight: '20px' }} alt="Logo" />
                  </div>
                </div>
                <div ref={calidadRef}></div>
                <br />
                <br />
                <div>
                  <h2 className="text-center" style={{ marginTop: '0px' }}>Servicios de calidad para panaderías</h2>
                  <p className="text-center mt-4">Nuestros servicios ofrecen cuchillas y rebanadoras duraderas y precisas 
                  para la industria de la panadería, trabajamos con metal de alta calidad para garantizar excelencia de nuestros productos.</p>

                  <br />

                  <div className="row justify-content-center mt-4">
                    <div className="col-4">
                      <i className="bi bi-check-circle display-1"></i>
                      <h3 className="text-center">Rebanadoras de alta precisión</h3>
                      <p style={{ fontSize: '17px' }}>Nuestras cuchillas y rebanadoras están diseñadas con la más alta 
                        presición para garantizar resultados perfectos.</p>
                    </div>
                    <div className="col-4">
                      <i className="bi bi-shield-check display-1"></i>
                      <h3 className="text-center">Durabilidad excepcional</h3>
                      <p style={{ fontSize: '17px' }}>Nuestros productos son reconocidos por su alta durabilidad excepcional.</p>
                    </div>
                    <div className="col-4">
                      <i className="bi bi-person-check display-1"></i>
                      <h3 className="text-center">Servicio de primera al cliente</h3>
                      <p style={{ fontSize: '17px' }}>Nuestra atención al Cliente siempre ha destacado por ser un de primera, brindando 
                        asistencia y soporte en todo momento.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 row justify-content-center">
                  <div className="col-auto">
                    <Link to="/contacto" className="btn btn-outline-light">Contacto</Link>
                  </div>
                </div>

                <div className="row justify-content-between mt-5" ref={presupuestoRef}>
                  <div className="col-md-6">
                    <h1 style={{ fontSize: '50px' }}>Solicita tu presupuesto</h1>
                    <p style={{ fontSize: '25px' }}>Contáctanos para obtener tu presupuesto detallado y personalizado según tus necesidades 
                      específicas.</p>

                    <br />
                    <Button variant="outline-light btn-lg" onClick={handleShow}>Solicitar</Button>
                  </div>
                  <div className="col-md-6 text-right">
                  <img src="/images/Presupuesto.jpeg" alt="Presupuesto" style={{ width: '90%', maxWidth: '500px', height: '300px', objectFit: 'cover' }} />
                  </div>
                </div>

                <br></br>

                <Modal show={show} onHide={handleClose} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Solicita tu presupuesto</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                      <Form.Group controlId="formPresupuesto">
                        <Form.Label>Detalles del presupuesto</Form.Label>
                        <Form.Control 
                          as="textarea"
                          rows={4}
                          placeholder="Escriba los detalles de su presupuesto" 
                          name="presupuesto"
                          value={formData.presupuesto || ''}
                          onChange={handleChange} 
                          required 
                        />
                        <Form.Label>Correo Electrónico</Form.Label>
                        <Form.Control 
                          type="email"
                          placeholder="Correo@Correo.com" 
                          name="presupuesto_email"
                          value={formData.presupuesto_email || ''}
                          onChange={handleChange} 
                          required 
                        />
                        <Form.Label>Número Telefonico</Form.Label>
                        <Form.Control 
                          type="tel"
                          placeholder="+56900000000" 
                          name="presupuesto_numero"
                          value={formData.presupuesto_numero || ''}
                          onChange={handleChange}
                          required
                        />
                        <Form.Label>Nombre y Apellido</Form.Label>
                        <Form.Control 
                          type="text"
                          placeholder="Nombre y Apellido" 
                          name="presupuesto_nombre"
                          value={formData.presupuesto_nombre || ''}
                          onChange={handleChange} 
                          required 
                        />
                      </Form.Group>
                      <div className="d-flex justify-content-between mt-3">
                        <Button variant="dark" onClick={handleClose}>Cerrar</Button>
                        <Button variant="dark" type="submit">Enviar</Button>
                      </div>
                    </Form>
                  </Modal.Body>
                </Modal>
            </div>
            } />

            <Route path="/Productos" element={<Productos />} />
            <Route path="/Contacto" element={<Contacto />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Admin" element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </header>
    </div>
  );
}

export default App;