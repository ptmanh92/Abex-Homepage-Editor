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
import InputGroup from 'react-bootstrap/InputGroup';
import { CKEditor } from 'ckeditor4-react';
import { shell } from 'electron';
import { uuid } from 'uuidv4';
import { pretty_name, get_all_attributes } from '../../js/product';
import { FancySwitch } from '../../js/global';

const ProductListBody = (props) => {
    const [product_data, setProductData] = useState({});
    const [product_variations, setProductVariations] = useState([]);
    const [show_product_modal, setShowProductModal] = useState(false);

    //Request options
    var woo_headers = new Headers();
    woo_headers.append("Authorization", "Basic Y2tfMTA0MzMwZTU3OGY2MDgxZGFkOWU4NGU0OGFmYTZiZDhjODk5MjgyOTpjc182MTExYjM4ZGNjOTMxNzJlZWQxNWY3ZGZlODAwODU1NDVjYTczNzRi");
    woo_headers.append("Content-Type", "application/json");
    var requestOptions_woo = {
        method: 'GET',
        headers: woo_headers,
        redirect: 'follow'
    };
    var requestOptions_POST_woo = {
        method: 'POST',
        headers: woo_headers,
        redirect: 'follow'
    };
    var requestOptions_DELETE_woo = {
        method: 'DELETE',
        headers: woo_headers,
        redirect: 'follow'
    };
    const base_url = "https://abex.phanthemanh.com/wp-json/wc/v3/products/";

    const display_product_modal = async (product_data) => {
        if (product_data) {
            setProductData(product_data);

            localStorage.removeItem('product_variations');
            if (product_data.type == 'variable') {
                let new_url = base_url + product_data.id + "/variations?per_page=100";
                const fetched_variations =
                    await fetch(new_url, requestOptions_woo)
                    .then(response => {
                        let total_pages = parseInt(response.headers.get('X-WP-TotalPages'));
                        let total_pages_array = [];
                        for (let i = 1; i <= total_pages; i++) {
                            total_pages_array.push(i);
                        }
                        get_variations_per_page(new_url, total_pages_array);
                    })
                    .catch(error => console.log('error', error));
            }
        }
    }

    const get_variations_per_page = async (new_url, total_pages_array) => {
        for (const page_number of total_pages_array) {
            console.log(`Fetching product variations page ${page_number}...`);
    
            const var_per_page = await fetch(new_url + "&page=" + page_number, requestOptions_woo)
            .then(response => response.json())
            .then(result => {
                let local_variations = JSON.parse(window.localStorage.getItem('product_variations'));
                if (local_variations) {
                    for (const item of result) local_variations.push(item);
                    localStorage.setItem('product_variations', JSON.stringify(local_variations));
                } else {
                    localStorage.setItem('product_variations', JSON.stringify(result));
                }
    
                // Reorganize categories and then create GUI
                if (page_number == total_pages_array.length) {
                    let final_variations = JSON.parse(window.localStorage.getItem('product_variations'));
                    setProductVariations(final_variations);
                    setShowProductModal(true);
                }
            })
            .catch(error => console.log('error', error));
        }
    }

    const select_all_checkboxes = (e, checkbox_items_name) => {
        let checked_state = e.target.checked;
        let checkboxes = document.getElementsByName(checkbox_items_name);
        for (const checkbox of checkboxes) {
            checkbox.checked = checked_state;
        }
    }

    const set_checkbox_state = (e, checkbox_all_id, checkbox_item_name) => {
        let checked_state = e.target.checked;
        let checkbox_all = document.getElementById(checkbox_all_id);
        let checkboxes = document.getElementsByName(checkbox_item_name);
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
                                <React.Fragment key={uuid()}>
                                    <option key={uuid()} className="category_item" value={item.id}>{`${props.children.space} ${pretty_name(item.name)}`}</option>
                                    {
                                        item.children.length > 0 ? item.children.map((grand_child_id) => {
                                            let new_space = props.children.space + '---';
                                            let new_props = {
                                                data: props.children.data,
                                                cat_id: grand_child_id,
                                                space: new_space
                                            }
                                            return(
                                                <ChildCategory key={uuid()}>{new_props}</ChildCategory>
                                            )
                                        }) : ''
                                    }
                                </React.Fragment>
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
        const [product_attributes, setProductAttributes] = useState(product_data.attributes || []);
        const all_categories = JSON.parse(window.localStorage.getItem('product_categories')) || [];

        const select_multiple_values = (e) => {
            var new_cat_ids = [];
            for (const selected_cat of e.target.selectedOptions) {
                // console.log(selected_cat.value)
                new_cat_ids.push(selected_cat.value);
            }
            setSelectCategories(new_cat_ids);
        }

        const SelectExistingAttribute = (props) => {
            const [existing_attribute, setExistingAttribute] = useState(-1);
            const [attribute_list, setAttributeList] = useState([])

            const get_existing_attributes = async () => {
                let url = 'https://abex.phanthemanh.com/wp-json/wc/v3/products/attributes';
                const fetched_attributes = 
                    await fetch(url, requestOptions_woo)
                    .then(response => response.json())
                    .then(result => {
                        setAttributeList(result);
                    })
                    .catch(error => console.log('error', error));
            }

            const insert_existing_attribute = (e) => {
                let selected_attrib = e.target.selectedOptions[0];
                setExistingAttribute(selected_attrib.value);

                if (selected_attrib.value != -1) {
                    let new_attribute = {
                        id: parseInt(selected_attrib.value),
                        name: selected_attrib.innerText,
                        visible: true,
                        variation: true,
                        options: []
                    }
                    // let new_product_attribs = product_attributes;
                    // new_product_attribs.push(new_attribute);
                    // console.log(new_product_attribs);
    
                    setProductAttributes(old_attribs => [...old_attribs, new_attribute]);
                }
            }

            return (
                <div className="select_existing_attribute_wrapper">
                    <Button variant="outline-secondary" className="shadow-none" onClick={() => { get_existing_attributes() }}>Eigenschaften laden</Button>
                    <Form.Select key="select_existing_attribute" className="shadow-none rounded-0" value={existing_attribute} onChange={(e) => { insert_existing_attribute(e) }}>
                        <option key={-1} value="-1">Attribut auswählen</option>
                        {
                            attribute_list.length > 0 ? attribute_list.map((attribute_item) => {
                                return (
                                    <option key={attribute_item.id} value={attribute_item.id}>{attribute_item.name}</option>
                                )
                            }) : ''
                        }
                    </Form.Select>
                    <Form.Control type="text" className="shadow-none rounded-0" placeholder="Attribute erstellen..." />
                </div>
            )
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
                                                    <Form.Select key="product_type_select" className="shadow-none" value={select_type} onChange={(e) => { setSelectType(e.target.selectedOptions[0].value) }}>
                                                        <option value="simple">Einfaches Produkt</option>
                                                        <option value="variable">Variables Produkt</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_title">
                                                    <Form.Label>Titel</Form.Label>
                                                    <Form.Control key="product_title" type="text" className="shadow-none" value={textfield_name} onChange={(e) => { setTextfieldName(e.target.value) }} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_sku">
                                                    <Form.Label>Artikelnummer / SKU</Form.Label>
                                                    <Form.Control key="product_sku" type="text" className="shadow-none" value={textfield_sku} onChange={(e) => { setTextfieldSKU(e.target.value) }} />
                                                </Form.Group>

                                                <Form.Group className="mb-3" controlId="product_active_price">
                                                    <Form.Label>Preis</Form.Label>
                                                    <Form.Control type="number" min="0" step="0.01" className="shadow-none" value={textfield_active_price} onChange={(e) => { setTextfieldActivePrice(e.target.value) }} />
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
                                                        className="h-100 shadow-none"
                                                        value={select_categories} 
                                                        onChange={(e) => { select_multiple_values(e) }}
                                                    >
                                                        {
                                                            all_categories.map((category, index) => {
                                                                if (category.parent == 0) {
                                                                    return (
                                                                        <React.Fragment key={index}>
                                                                            <option key={category.id} className="category_item" value={category.id}>{pretty_name(category.name)}</option>
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
                                                    <Form.Text className="text-muted">
                                                        Halten Sie die Strg-(Windows) oder Befehlstaste(Mac) gedrückt, um mehrere Kategorien auszuwählen.
                                                    </Form.Text>
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
                                        <div className="product_attributes_wrapper">
                                            <SelectExistingAttribute />
                                            <Table striped bordered hover className="product_attributes_list">
                                                <thead>
                                                    <tr>
                                                        <th>ID</th>
                                                        <th>Titel</th>
                                                        <th>Werte</th>
                                                        {/* <th>Sichtbar?</th> */}
                                                        {/* <th>Für Varianten?</th> */}
                                                        <th></th>
                                                        {/* <th><Form.Check inline type="checkbox" id="attribute_checkbox_all" onChange={(e) => {select_all_checkboxes(e, "attribute_item_checkbox")}} /></th> */}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        product_attributes.length > 0 ? product_attributes.map((attribute) => {
                                                            let is_visible = {
                                                                id: attribute.id,
                                                                state: attribute.visible
                                                            };
                                                            let is_for_variation = {
                                                                id: attribute.id,
                                                                state: attribute.variation
                                                            };
                                                            return(
                                                                <tr key={attribute.id} id={`attribute_${attribute.id}`} className="attribute_row">
                                                                    <td>{attribute.id}</td>
                                                                    <td>{attribute.name}</td>
                                                                    <td>
                                                                        {
                                                                            attribute.options.map((option_name, index) => {
                                                                                return (
                                                                                    <InputGroup key={`${attribute.id}_${index}`} className="mb-1">
                                                                                        <Form.Control 
                                                                                            id={`attribute_${attribute.id}_${index}`}
                                                                                            type="text" 
                                                                                            className="shadow-none" 
                                                                                            value={option_name}
                                                                                            onChange={(e) => {}}
                                                                                        />
                                                                                        <Button variant="outline-secondary" className="shadow-none"><i className="fa fa-times"></i></Button>
                                                                                    </InputGroup>
                                                                                )
                                                                            })
                                                                        }
                                                                    </td>
                                                                    {/* <td><FancySwitch>{is_visible}</FancySwitch></td> */}
                                                                    {/* <td><FancySwitch>{is_for_variation}</FancySwitch></td> */}
                                                                    <td>
                                                                        <ButtonGroup>
                                                                            <Button variant="danger" size="sm" className="shadow-none"><i className="fa fa-trash"></i></Button>
                                                                        </ButtonGroup>
                                                                    </td>
                                                                    {/* <td><Form.Check inline type="checkbox" name="attribute_item_checkbox" id={`attribute_checkbox_${attribute.id}`} onChange={(e) => {set_checkbox_state(e, "attribute_checkbox_all", "attribute_item_checkbox")}} /></td> */}
                                                                </tr>
                                                            )
                                                        }) : ''
                                                    }
                                                </tbody>
                                            </Table>
                                        </div>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="variations" className="product_info_variations">
                                        <div className="product_variations_wrapper">
                                            <Table striped bordered hover className="product_variations_list">
                                                <thead>
                                                    <tr>
                                                        <th>Artikelnummer</th>
                                                        <th>Preis</th>
                                                        {
                                                            product_attributes.length > 0 ? product_attributes.map((attribute) => {
                                                                return (
                                                                    <th key={`attrib_${attribute.id}`}>{attribute.name}</th>
                                                                )
                                                            }) : ''
                                                        }
                                                        <th></th>
                                                        <th><Form.Check inline type="checkbox" id="variation_checkbox_all" onChange={(e) => {select_all_checkboxes(e, "variation_item_checkbox")}} /></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        product_variations.length > 0 ? product_variations.map((variation) => {
                                                            return (
                                                                <tr key={`variation_${variation.id}`}>
                                                                    <td>
                                                                        <Form.Control 
                                                                            id={`variation_${variation.id}_sku`}
                                                                            type="text" 
                                                                            className="shadow-none" 
                                                                            value={variation.sku}
                                                                            onChange={(e) => {}}
                                                                        />
                                                                    </td>
                                                                    <td>
                                                                        <Form.Control 
                                                                            id={`variation_${variation.id}_price`}
                                                                            type="number" 
                                                                            step="0.01"
                                                                            min="0.0"
                                                                            className="shadow-none" 
                                                                            value={variation.regular_price}
                                                                            onChange={(e) => {}}
                                                                        />
                                                                    </td>
                                                                    {
                                                                        variation.attributes.length > 0 ? variation.attributes.map((var_attrib) => {
                                                                            return (
                                                                                <td key={`attrib_value_${var_attrib.id}`}>
                                                                                    {
                                                                                        product_attributes.length > 0 ? product_attributes.map((attribute) => {
                                                                                            if (attribute.id == var_attrib.id)
                                                                                                return (
                                                                                                    <Form.Select key={`attrib_${var_attrib.id}`} className="shadow-none" value={var_attrib.option} onChange={(e) => {  }}>
                                                                                                        {
                                                                                                            attribute.options.length > 0 ? attribute.options.map((new_option, index) => {
                                                                                                                return (
                                                                                                                    <option key={`option_${variation.id}_${index}`} value={new_option}>{new_option}</option>
                                                                                                                )
                                                                                                            }) : ''
                                                                                                        }
                                                                                                    </Form.Select>
                                                                                                )
                                                                                        }) : ''
                                                                                    }
                                                                                </td>
                                                                            )
                                                                        }) : ''
                                                                    }
                                                                    <td>
                                                                        <ButtonGroup>
                                                                            <Button variant="danger" size="sm" className="shadow-none"><i className="fa fa-trash"></i></Button>
                                                                        </ButtonGroup>
                                                                    </td>
                                                                    <td><Form.Check inline type="checkbox" name="variation_item_checkbox" id={`variation_checkbox_${variation.id}`} onChange={(e) => {set_checkbox_state(e, "variation_checkbox_all", "variation_item_checkbox")}} /></td>
                                                                </tr>
                                                            );
                                                        }) : ''
                                                    }
                                                </tbody>
                                            </Table>
                                        </div>
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
                        <th><Form.Check inline type="checkbox" id="checkbox_all" onChange={(e) => {select_all_checkboxes(e, "product_item_checkbox")}} /></th>
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
                                <td><Form.Check inline type="checkbox" name="product_item_checkbox" id={`checkbox_${product.id}`} onChange={(e) => {set_checkbox_state(e, "checkbox_all", "product_item_checkbox")}} /></td>
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