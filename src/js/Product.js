import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { shell } from 'electron';

//Request options
var woo_headers = new Headers();
woo_headers.append("Authorization", "Basic Y2tfMTA0MzMwZTU3OGY2MDgxZGFkOWU4NGU0OGFmYTZiZDhjODk5MjgyOTpjc182MTExYjM4ZGNjOTMxNzJlZWQxNWY3ZGZlODAwODU1NDVjYTczNzRi");
woo_headers.append("Content-Type", "application/json");
var requestOptions_woo = {
    method: 'GET',
    headers: woo_headers,
    redirect: 'follow'
};

const get_all_products = async (event, page_number) => {
    console.log("Get all products...");
    
    let page_num = page_number ? page_number : 1;
    
    let url = 'https://abex.phanthemanh.com/wp-json/wc/v3/products/';
    const fetched_products = await fetch(url + "?page=" + page_num, requestOptions_woo)
        .then(response => {
            let total_pages = parseInt(response.headers.get('X-WP-TotalPages'));
            return response.json()
        })
        .then(result => {
            display_all_products(result);
        })
        .catch(error => console.log('error', error));
}

const display_all_products = (data) => {
    console.log("Display all products...");
    console.log(data);
    ReactDOM.render(<ProductListBody>{data}</ProductListBody>, document.getElementById("main_body"))
}

const ProductListBody = (props) => {
    const [show_product_modal, setShowProductModal] = useState(false);
    const [product_data, setProductData] = useState({});

    const select_all_checkboxes = (e) => {
        let checked_state = e.target.checked;
        let checkboxes = document.getElementsByName("product_item_checkbox");
        for (const checkbox of checkboxes) {
            checkbox.checked = checked_state;
        }
    }

    const set_checkbox_state = (e) => {
        let checked_state = e.target.checked;
        let checkbox_all = document.getElementById("checkbox_all");
        let checkboxes = document.getElementsByName("product_item_checkbox");
        if (!checked_state) {
            checkbox_all.checked = false;
        } else {
            let new_state = true;
            for (const checkbox of checkboxes) {
                if (!checkbox.checked) {
                    new_state = false;
                    break;
                }
            }
            checkbox_all.checked = new_state;
        }
    }

    const ProductModal = () => {
        const [textfield_name, setTextfieldName] = useState(product_data.name);
        const [textfield_sku, setTextfieldSKU] = useState(product_data.sku);

        const [checkbox_visble, setCheckboxVisble] = useState(product_data.status == 'publish' ? true : false)
        
        return (
            <Modal show={show_product_modal} fullscreen={true} onHide={() => setShowProductModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{product_data.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Row>
                        <Col xs={8} className="product_info">
                            <Form>
                                <Form.Group className="mb-3" controlId="product_title">
                                    <Form.Label>Titel</Form.Label>
                                    <Form.Control type="text" value={textfield_name} onChange={(e) => { setTextfieldName(e.target.value) }} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="product_sku">
                                    <Form.Label>Artikelnummer / SKU</Form.Label>
                                    <Form.Control type="text" value={textfield_sku} onChange={(e) => { setTextfieldSKU(e.target.value) }} />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="product_status">
                                    <Form.Check type="checkbox" label="Sichtbar?" checked={checkbox_visble} onChange={(e) => { setCheckboxVisble(e.target.checked) }} />
                                </Form.Group>
                            </Form>
                        </Col>
                        <Col xs={4} className="product_gallery">

                        </Col>
                    </Row>
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={() => { setShowProductModal(false) }}>Schließen</Button>
                    <Button variant="primary" onClick={() => { setShowProductModal(false) }}>Aktualisieren</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <div className="product_list_wrapper">
            <Table striped bordered hover className="product_list">
                <thead>
                    <tr>
                        <th><Form.Check inline type="checkbox" id="checkbox_all" onChange={(e) => {select_all_checkboxes(e)}} /></th>
                        <th>Hauptbild</th>
                        <th>Titel</th>
                        <th>Artikelnummer</th>
                        <th>Varianten</th>
                        <th>Sichbarkeit</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    { props.children.map((product) => {
                        let img_url = product.images[0].src || '../assets/img/default/no_photo.jpg';
                        let type = product.type == 'variable' ? 'check' : 'times';
                        let visible = product.status == 'publish' ? 'check' : 'times';
                        return (
                        <tr key={product.id} id={`product_${product.id}`} className="product_row">
                            <td><Form.Check inline type="checkbox" name="product_item_checkbox" id={`checkbox_${product.id}`} onChange={(e) => {set_checkbox_state(e)}} /></td>
                            <td><img src={img_url}></img></td>
                            <td className="row_product_name">{product.name}</td>
                            <td>{product.sku}</td>
                            <td><i className={`fa fa-${type}`}></i></td>
                            <td><i className={`fa fa-${visible}`}></i></td>
                            <td>
                                <ButtonGroup>
                                    <Button variant="secondary" size="sm" className="shadow-none" onClick={(e) => { shell.openExternal(product.permalink) }}><i className="fa fa-eye"></i></Button>
                                    <Button variant="secondary" size="sm" className="shadow-none" onClick={(e) => { setProductData(product); setShowProductModal(true) }}><i className="fa fa-pencil"></i></Button>
                                    <Button variant="secondary" size="sm" className="shadow-none"><i className="fa fa-trash"></i></Button>
                                </ButtonGroup>
                            </td>
                        </tr>
                    )}) }
                </tbody>
            </Table>
            <ProductModal/>
        </div>
    )
}

const ProductPagination = () => {
    return (
        <h1>ObjB</h1>
    )
}

export {
    get_all_products
}
