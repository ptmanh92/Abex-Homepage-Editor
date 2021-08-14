import React, { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import { get_all_categories, get_all_products } from '../js/product';

const RightNav = () => {
    // Set states
    // const [all_products, set_all_products] = useState([]);

    const test = () => {
        console.log("Testing...")
    }

    // Update states
    // useEffect(() => {

    // }, []);

    return (
        <Accordion defaultActiveKey="0" flush>
            <Accordion.Item eventKey="0" className="no_arrow">
                <Accordion.Header onClick={test}>
                    <i className="fa fa-home" aria-hidden="true"></i>
                    <span>Dashboard</span>
                </Accordion.Header>
            </Accordion.Item>

            <Accordion.Item eventKey="1" className="no_arrow">
                <Accordion.Header onClick={test}>
                    <i className="fa fa-th-large" aria-hidden="true"></i>
                    <span>Allgemein</span>
                </Accordion.Header>
            </Accordion.Item>

            <Accordion.Item eventKey="2">
                <Accordion.Header>
                    <i className="fa fa-shopping-cart" aria-hidden="true"></i>
                    <span>Produkte</span>
                </Accordion.Header>
                <Accordion.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item action onClick={(e) => { get_all_categories(); get_all_products(e)}}>Alle Produkte</ListGroup.Item>
                        <ListGroup.Item action onClick={test}>Kategorien</ListGroup.Item>
                        <ListGroup.Item action onClick={test}>Eigenschaften</ListGroup.Item>
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="3">
                <Accordion.Header>
                    <i className="fa fa-users" aria-hidden="true"></i>
                    <span>Stellenanzeigen</span>
                </Accordion.Header>
                <Accordion.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item action onClick={test}>Alle Anzeigen</ListGroup.Item>
                        <ListGroup.Item action onClick={test}>Kategorien</ListGroup.Item>
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="4">
                <Accordion.Header>
                    <i className="fa fa-diamond" aria-hidden="true"></i>
                    <span>Dienstleistungen</span>
                </Accordion.Header>
                <Accordion.Body>
                    <ListGroup variant="flush">
                        <ListGroup.Item action onClick={test}>Alle Diensleistungen</ListGroup.Item>
                        <ListGroup.Item action onClick={test}>Kategorien</ListGroup.Item>
                    </ListGroup>
                </Accordion.Body>
            </Accordion.Item>

            <Accordion.Item eventKey="5" className="no_arrow">
                <Accordion.Header onClick={test}>
                    <i className="fa fa-cog" aria-hidden="true"></i>
                    <span>Settings</span>
                </Accordion.Header>
            </Accordion.Item>
        </Accordion>
    )
}

export default RightNav;
