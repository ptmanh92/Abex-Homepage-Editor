import React from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import App from './App';

const Maingrid = (props) => {
    return (
        <Container fluid>
            <Row>
                <Col xs={2} className="right_nav_wrapper"><App /></Col>
                <Col xs={10} className="main_content">
                    <div id="main">
                        <div id="main_header"></div>
                        <div id="main_body"></div>
                        <div id="main_footer"></div>
                    </div>
                </Col>
            </Row>
            <div id="product_modal"></div>
        </Container>
    )
}

export default Maingrid;