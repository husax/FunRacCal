import React from 'react';
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import NavDropdown from "react-bootstrap/Navdropdown";

import "bootstrap/dist/css/bootstrap.min.css";

const BarraNav = ()  => (
    <Navbar bg="dark" variant="dark" expand="lg">
        <Navbar.Brand href="#home">Funciones Algebraicas:</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto text-light">
                <Nav.Link href="#home">Inicio</Nav.Link>
                <NavDropdown title="Funciones" id="collasible-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">
                    Polinomiales
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                    Racionales
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">
                    Radicales
                </NavDropdown.Item>
                <NavDropdown.Divider />
                </NavDropdown>
            </Nav>
        </Navbar.Collapse>
    </Navbar>
);

export default BarraNav;