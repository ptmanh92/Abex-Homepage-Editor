import React, { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Badge from 'react-bootstrap/Badge';
import { CKEditor } from 'ckeditor4-react';
import { shell } from 'electron';
import { generate_unique_key } from '../../js/product';
import { uuid } from 'uuidv4';

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
    
    const ChildCategory = (props) => {
        // const [new_space, SetNewSpace] = useState(space);
        return(
            <React.Fragment>
                {
                    props.children ? props.children.data.map((item, index) => {
                        if (item.id == props.children.cat_id)
                            return(
                                <option key={uuid()} className="category_item" value={item.id}>{`${props.children.space} ${item.name}`}</option>
                            )
                    }) : ''
                }
            </React.Fragment>
        )
    }

    const ProductModal = () => {
        const get_cat_ids_only = (data) => {
            if (data) {
                let new_category_ids = [];
                for (const cat of data) {
                    new_category_ids.push(cat.id);
                }
                return new_category_ids;
            }
            return [];
        }

        const [textfield_name, setTextfieldName] = useState(product_data.name);
        const [textfield_sku, setTextfieldSKU] = useState(product_data.sku);
        const [textfield_active_price, setTextfieldActivePrice] = useState(product_data.price);
        const [select_type, setSelectType] = useState(product_data.type);
        const [select_categories, setSelectCategories] = useState(get_cat_ids_only(product_data.categories));
        const [checkbox_visble, setCheckboxVisble] = useState(product_data.status == 'publish' ? true : false)
        const [images, setImages] = useState(product_data.images);
        const all_categories = JSON.parse(window.localStorage.getItem('product_categories')) || [];

        const select_multiple_values = (e) => {
            var new_cat_ids = [];
            for (const selected_cat of e.target.selectedOptions) {
                // console.log(selected_cat.value)
                new_cat_ids.push(selected_cat.value);
            }
            setSelectCategories(new_cat_ids);

            // setSelectCategories([].slice.call(e.target.selectedOptions).map(item => item.value))
        }
        
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
                                        <Row>
                                            <Col sm={8}>
                                                <Form.Group className="mb-3" controlId="product_type">
                                                    <Form.Label>Typ</Form.Label>
                                                    <Form.Select key="product_type_select" value={select_type} onChange={(e) => { setSelectType(e.target.selectedOptions[0].value) }}>
                                                        <option value="simple">Einfaches Produkt</option>
                                                        <option value="variable">Variables Produkt</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_title">
                                                    <Form.Label>Titel</Form.Label>
                                                    <Form.Control key="product_title" type="text" value={textfield_name} onChange={(e) => { setTextfieldName(e.target.value) }} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_sku">
                                                    <Form.Label>Artikelnummer / SKU</Form.Label>
                                                    <Form.Control key="product_sku" type="text" value={textfield_sku} onChange={(e) => { setTextfieldSKU(e.target.value) }} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_active_price">
                                                    <Form.Label>Preis</Form.Label>
                                                    <Form.Control type="number" min="0" step="0.01" value={textfield_active_price} onChange={(e) => { setTextfieldActivePrice(e.target.value) }} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_status">
                                                    <Form.Check type="checkbox" label="Sichtbar?" checked={checkbox_visble} onChange={(e) => { setCheckboxVisble(e.target.checked) }} />
                                                </Form.Group>
                                            </Col>

                                            <Col sm={4}>
                                                <Form.Group className="mb-3 h-100" controlId="product_categories">
                                                    <Form.Label>Kategorien</Form.Label>
                                                    <Form.Control 
                                                        multiple 
                                                        as="select"
                                                        key="product_categories_select" 
                                                        controlid="product_categories"
                                                        // id="product_categories" 
                                                        className="h-100"
                                                        value={select_categories} 
                                                        onChange={(e) => { select_multiple_values(e) }}
                                                    >
                                                        {
                                                            all_categories.map((category, index) => {
                                                                if (category.parent == 0) {
                                                                    return (
                                                                        <React.Fragment key={index}>
                                                                            <option key={category.id} className="category_item" value={category.id}>{category.name}</option>
                                                                            {
                                                                                category.children.length > 0 ? category.children.map((child_id) => {
                                                                                    let new_props = {
                                                                                        data: all_categories,
                                                                                        cat_id: child_id,
                                                                                        space: '---'
                                                                                    }
                                                                                    return (
                                                                                        <ChildCategory key={uuid()}>{new_props}</ChildCategory>
                                                                                    )
                                                                                }) : ''
                                                                            }
                                                                        </React.Fragment>
                                                                    )
                                                                }
                                                            })
                                                        }
                                                    </Form.Control>
                                                </Form.Group>
                                            </Col>
                                        </Row>
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
                        <th>Hauptbild</th>
                        <th>Titel</th>
                        <th>Artikelnummer</th>
                        <th>Varianten</th>
                        <th>Sichbarkeit</th>
                        <th></th>
                        <th><Form.Check inline type="checkbox" id="checkbox_all" onChange={(e) => {select_all_checkboxes(e)}} /></th>
                    </tr>
                </thead>
                <tbody>
                    { props.children.map((product) => {
                        let img_url = product.images[0] ? product.images[0].src : '../assets/img/default/no_photo.jpg';
                        let type = product.type == 'variable' ? 'check' : 'times';
                        let visible = product.status == 'publish' ? 'check' : 'times';
                        return (
                            <tr key={product.id} id={`product_${product.id}`} className="product_row">
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
                                <td><Form.Check inline type="checkbox" name="product_item_checkbox" id={`checkbox_${product.id}`} onChange={(e) => {set_checkbox_state(e)}} /></td>
                            </tr>
                        )
                    }) }
                </tbody>
            </Table>
            <ProductModal />
        </div>
    )
}

export default ProductListBody;