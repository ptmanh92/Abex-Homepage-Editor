import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Badge from 'react-bootstrap/Badge'
import { ButtonToolbar, Nav } from 'react-bootstrap';
import { CKEditor } from 'ckeditor4-react';
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
const no_photo = '../assets/img/default/no_photo.jpg';

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
    ReactDOM.render(<ProductListBody>{data}</ProductListBody>, document.getElementById("main_body"))
}

const update_product = () => {
    console.log("Updating...");
}

const get_all_categories = async () => {
    display_all_categories();

    let url = "https://abex.phanthemanh.com/wp-json/wc/v3/products/categories?parent=0&per_page=100";

           await fetch(url, requestOptions_woo)
        .then(response => {
            let total_pages = parseInt(response.headers.get('X-WP-TotalPages'));
            let total_pages_array = [];
            for (let i = 1; i <= total_pages; i++) {
                total_pages_array.push(i);
            }
            get_categories_per_page(url, total_pages_array);
        })
        .then(result => {})
        .catch(error => {
            console.log('error', error);
        });
}

const get_categories_per_page = async (url, pages_array) => {
    const add_option_to_select = (id, value, title, class_name) => {
        console.log(`Adding ${title}`);
        let select_list = document.getElementById(id);
        let option_item = document.createElement("option");
        option_item.value = value;
        option_item.innerText = title;
        option_item.setAttribute("class", class_name);
        select_list.appendChild(option_item);
    }
    
    for (const page_number of pages_array) {
        // if (debug_mode) console.log(`Fetching page ${page_number}...`);

        await fetch(url + "&page=" + page_number, requestOptions_woo)
        .then(response => response.json())
        .then(result => {
            for (const item of result) {
                add_option_to_select("categories_list", item.id, item.name, 'category_item');
            }
        })
        .catch(error => console.log('error', error));
    }
}

const display_all_categories = (data) => {
    console.log("Display all categories...");
    let categories_list = document.getElementById("categories_list");
    if (categories_list) {
        let option_items = document.querySelectorAll('.category_item');
        for (const option_item of option_items) {
            option_item.remove();
        }
    }
    ReactDOM.render(<Form><CategoriesList /></Form>, document.getElementById("main_header"))
}

const CategoriesList = (props) => {
    return (
        <Form.Group className="mb-4" controlId="categories_list">
            <Form.Select onChange={(e) => { }} id="categories_list">
                <option value="">Kategorie auswählen</option>
                {/* { props.children ? props.children.map((category) => {
                    <option value={category.id}>{category.name}</option>
                }) : '' } */}
            </Form.Select>
        </Form.Group>
    )
}

const ProductListBody = (props) => {
    const [product_data, setProductData] = useState({});
    const [show_product_modal, setShowProductModal] = useState(false);

    const display_product_modal = (new_data) => {
        setProductData(new_data);
        setShowProductModal(true);
    }

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

    const show_image_option = (show, id) => {
        let image_option = document.getElementById(id);
        if (image_option) {
            if (show) {
                image_option.classList.remove('invisible');
                image_option.classList.add('visible');
            } else {
                image_option.classList.remove('visible');
                image_option.classList.add('invisible');
            }
        }
    }

    const set_featured_image = (id) => {
        let new_featured_image = document.getElementById(`product_image_${id}`);
        if (new_featured_image) {
            let other_images = document.getElementsByClassName("product_image_item");
            for (let other_image of other_images) {
                if (other_image.getAttribute("data-featured") == 1) {
                    let other_id = other_image.getAttribute("data-id");

                    let other_featured_btn = document.getElementById(`btn_set_featured_${other_id}`);
                    other_featured_btn.disabled = false;

                    other_image.classList.remove("is_featured");
                    other_image.setAttribute("data-featured", 0);

                    let other_badge = document.getElementById(`badge_${other_id}`);
                    other_badge.classList.remove('visible');
                    other_badge.classList.add('invisible');

                    break;
                }
            }

            let new_featured_btn = document.getElementById(`btn_set_featured_${id}`);
            new_featured_btn.disabled = true;

            new_featured_image.setAttribute("data-featured", 1);
            new_featured_image.classList.add("is_featured");

            let new_featured_badge = document.getElementById(`badge_${id}`);
            new_featured_badge.classList.add('visible');
            new_featured_badge.classList.remove('invisible');
        }
    }

    const delete_single_image = (id) => {
        let selected_image = document.getElementById(`product_image_${id}`);
        selected_image.remove();
    }

    const ProductModal = () => {
        const [textfield_name, setTextfieldName] = useState(product_data.name);
        const [textfield_sku, setTextfieldSKU] = useState(product_data.sku);
        const [textfield_active_price, setTextfieldActivePrice] = useState(product_data.price);
        const [select_type, setSelectType] = useState(product_data.type);
        const [checkbox_visble, setCheckboxVisble] = useState(product_data.status == 'publish' ? true : false)
        const [images, setImages] = useState(product_data.images);
        
        return (
            <Modal show={show_product_modal} fullscreen={true} onHide={() => setShowProductModal(false)} id="product_details_modal">
                <Modal.Header closeButton>
                    <Modal.Title>{product_data.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Tab.Container id="product_details_body" defaultActiveKey="general">
                        <Row>
                            <Col sm={2} className="tab_cols">
                                <Nav className="flex-column">
                                    <Nav.Item>
                                        <Nav.Link eventKey="general">Allgemein</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="gallery">Bilder</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="descriptions">Beschreibungen</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="attributes">Eigenschaften</Nav.Link>
                                    </Nav.Item>
                                    <Nav.Item>
                                        <Nav.Link eventKey="variations">Variante</Nav.Link>
                                    </Nav.Item>
                                </Nav>
                            </Col>
                            <Col sm={10} className="tab_contents">
                                <Tab.Content>
                                    <Tab.Pane eventKey="general" className="product_info_basic">
                                        <Form>
                                            <Form.Group className="mb-3" controlId="product_type">
                                                <Form.Label>Typ</Form.Label>
                                                <Form.Select value={select_type} onChange={(e) => { setSelectType(e.target.selectedOptions[0].value) }}>
                                                    <option value="simple">Einfaches Produkt</option>
                                                    <option value="variable">Variables Produkt</option>
                                                </Form.Select>
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="product_title">
                                                <Form.Label>Titel</Form.Label>
                                                <Form.Control type="text" value={textfield_name} onChange={(e) => { setTextfieldName(e.target.value) }} />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="product_sku">
                                                <Form.Label>Artikelnummer / SKU</Form.Label>
                                                <Form.Control type="text" value={textfield_sku} onChange={(e) => { setTextfieldSKU(e.target.value) }} />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="product_active_price">
                                                <Form.Label>Preis</Form.Label>
                                                <Form.Control type="number" min="0" step="0.01" value={textfield_active_price} onChange={(e) => { setTextfieldActivePrice(e.target.value) }} />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="product_status">
                                                <Form.Check type="checkbox" label="Sichtbar?" checked={checkbox_visble} onChange={(e) => { setCheckboxVisble(e.target.checked) }} />
                                            </Form.Group>
                                        </Form>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="gallery" className="product_info_gallery">
                                        <Row>
                                            <div className="product_gallery_wrapper">
                                                <div><Button variant="success" id="btn_add_product_image" onClick={() => {}}><i className="fa fa-plus"></i></Button></div>
                                                { images ? images.map((image, index) => {
                                                    let featured = false;
                                                    if (index == 0) featured = true;
                                                    return (
                                                        <div 
                                                            key={image.id} 
                                                            id={`product_image_${image.id}`} 
                                                            className={`product_image_item ${ featured ? 'is_featured' : ''}`}
                                                            onMouseEnter={() => show_image_option(true, `image_option_${image.id}`)}
                                                            onMouseLeave={() => show_image_option(false, `image_option_${image.id}`)}
                                                            data-id={image.id}
                                                            data-featured={ featured ? 1 : 0 }
                                                        >
                                                            <Badge bg="success" className={ featured ? 'visible' : 'invisible' } id={`badge_${image.id}`}>Hauptbild</Badge>
                                                            <img src={image.src} />
                                                            <div className="image_option invisible" id={`image_option_${image.id}`}>
                                                                <Button 
                                                                    id={`btn_set_featured_${image.id}`}
                                                                    variant="outline-success"
                                                                    onClick={() => set_featured_image(image.id)}
                                                                >
                                                                    Als Hauptbild
                                                                </Button>
                                                                <Button variant="outline-danger" onClick={() => delete_single_image(image.id)}>Entfernen</Button>
                                                            </div>
                                                        </div>
                                                    )
                                                }) : ''}
                                            </div>
                                        </Row>
                                    </Tab.Pane>
                                    
                                    <Tab.Pane eventKey="descriptions" className="product_info_descriptions">
                                        <Form>
                                            <Form.Group className="mb-3" controlId="product_short_desc">
                                                <Form.Label>Kurzbeschreibung</Form.Label>
                                                <CKEditor
                                                    initData={product_data.short_description}
                                                    config={{
                                                        allowedContent: true,
                                                        height: '15rem'
                                                    }}
                                                    name="short_description_editor"
                                                />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="product_desc">
                                                <Form.Label>Beschreibung</Form.Label>
                                                <CKEditor
                                                    initData={product_data.description}
                                                    config={{
                                                        allowedContent: true,
                                                        height: '30rem'
                                                    }}
                                                    name="description_editor"
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="attributes" className="product_info_attributes">
                                        Tab third
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="variations" className="product_info_variations">
                                        Tab third
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Modal.Body>

                <Modal.Footer>
                    {/* <Button variant="secondary" onClick={() => { setShowProductModal(false) }}>Schließen</Button> */}
                    <Button variant="primary" onClick={() => { update_product(); setShowProductModal(false) }}>Aktualisieren</Button>
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
                                        <Button variant="secondary" size="sm" className="shadow-none" onClick={(e) => { display_product_modal(product) }}><i className="fa fa-pencil"></i></Button>
                                        <Button variant="secondary" size="sm" className="shadow-none"><i className="fa fa-trash"></i></Button>
                                    </ButtonGroup>
                                </td>
                            </tr>
                        )
                    }) }
                </tbody>
            </Table>
            <ProductModal />
        </div>
    )
}

const ProductPagination = () => {
    return (
        <h1>ObjB</h1>
    )
}

export {
    get_all_categories,
    get_all_products
}
