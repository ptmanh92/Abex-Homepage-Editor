import React from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import RightNav from './RightNav';

const Maingrid = (props) => {
    return (
        <Container fluid>
            <Row>
                <Col xs={2} className="right_nav_wrapper"><RightNav /></Col>
                <Col xs={10}>{ props.children }</Col>
            </Row>
        </Container>
    )
}

export default Maingrid;