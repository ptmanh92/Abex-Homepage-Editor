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
import { CKEditor } from 'ckeditor4-react';
import { uuid } from 'uuidv4';
import { pretty_name } from '../../js/product';

const CategoryListBody = (props) => {
    const [category_data, setCategoryData] = useState({});
    const [show_category_modal, setShowCategoryModal] = useState(false);
    const no_photo = '../assets/img/default/no_photo.jpg';

    const display_category_modal = (new_data) => {
        setCategoryData(new_data);
        setShowCategoryModal(true);
    }

    const select_all_checkboxes = (e) => {
        let checked_state = e.target.checked;
        let checkboxes = document.getElementsByName("category_item_checkbox");
        for (const checkbox of checkboxes) {
            checkbox.checked = checked_state;
        }
    }

    const set_checkbox_state = (e) => {
        let checked_state = e.target.checked;
        let checkbox_all = document.getElementById("checkbox_all");
        let checkboxes = document.getElementsByName("category_item_checkbox");
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

    const CategoryModal = () => {
        const [textfield_name, setTextfieldName] = useState(category_data.name);
        const [textfield_slug, setTextfieldSlug] = useState(category_data.slug);
        const [select_parent, setSelectParent] = useState(category_data.parent);
        const [textarea_desc, setTextareaDesc] = useState(category_data.description);
        const [image, setImage] = useState(category_data.image);
        const all_categories = JSON.parse(window.localStorage.getItem('product_categories')) || [];

        const update_desc = () => {
            // setTextareaDesc()
        }
        
        return (
            <Modal show={show_category_modal} fullscreen={true} onHide={() => setShowCategoryModal(false)} id="category_details_modal">
                <Modal.Header closeButton>
                    <Modal.Title>{category_data.name}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Tab.Container id="category_details_body" defaultActiveKey="general">
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
                                </Nav>
                            </Col>
                            <Col sm={10} className="tab_contents">
                                <Tab.Content>
                                    <Tab.Pane eventKey="general" className="category_info_basic">
                                        <Form>
                                            <Form.Group className="mb-3" controlId="category_title">
                                                <Form.Label>Titel</Form.Label>
                                                <Form.Control key="category_title" type="text" className="shadow-none" value={textfield_name} onChange={(e) => { setTextfieldName(e.target.value) }} />
                                            </Form.Group>

                                            <Form.Group className="mb-3" controlId="category_slug">
                                                <Form.Label>Titelform</Form.Label>
                                                <Form.Control key="category_slug" type="text" className="shadow-none" value={textfield_slug} onChange={(e) => { setTextfieldSlug(e.target.value) }} />
                                            </Form.Group>

                                            <Form.Group className="mb-3 h-100" controlId="category_parent">
                                                <Form.Label>Übergeordnete Kategorie</Form.Label>
                                                <Form.Control 
                                                    as="select"
                                                    key="category_parent_select" 
                                                    controlid="category_parent" 
                                                    className="h-100 shadow-none"
                                                    value={select_parent} 
                                                    onChange={(e) => { setSelectParent(e.target.selectedOptions[0].value) }}
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
                                            </Form.Group>
                                        </Form>
                                    </Tab.Pane>

                                    <Tab.Pane eventKey="gallery" className="category_info_gallery">
                                        <Row>
                                            <div className="category_gallery_wrapper">
                                                <div 
                                                    id={image ? `category_image_${image.id}` : 'category_image_default'}
                                                    onMouseEnter={() => show_image_option(true, image ? `image_option_${image.id}` : 'image_option_default')}
                                                    onMouseLeave={() => show_image_option(false, image ? `image_option_${image.id}` : 'image_option_default')}
                                                    data-id={image ? image.id : 'default'}
                                                >
                                                    <img src={image ? image.src : no_photo} />
                                                    <div className="image_option invisible" id={ image ? `image_option_${image.id}` : 'image_option_default'}>
                                                        <Button variant="outline-success" onClick={() => {}}>Ändern</Button>
                                                        <Button variant="outline-danger" onClick={() => delete_single_image(image ? image.id : 'default')}>Entfernen</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </Row>
                                    </Tab.Pane>
                                    
                                    <Tab.Pane eventKey="descriptions" className="category_info_descriptions">
                                        <Form>
                                            <Form.Group className="mb-3" controlId="category_desc">
                                                <Form.Label>Beschreibung</Form.Label>
                                                <CKEditor
                                                    initData={textarea_desc}
                                                    config={{
                                                        allowedContent: true,
                                                        height: '30rem'
                                                    }}
                                                    name="category_description_editor"
                                                    onChange={update_desc}
                                                />
                                            </Form.Group>
                                        </Form>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Col>
                        </Row>
                    </Tab.Container>
                </Modal.Body>

                <Modal.Footer>
                    {/* <Button variant="secondary" onClick={() => { setShowProductModal(false) }}>Schließen</Button> */}
                    <Button variant="primary" onClick={() => { setShowCategoryModal(false) }}>Aktualisieren</Button>
                </Modal.Footer>
            </Modal>
        )
    }

    return (
        <div className="category_list_wrapper">
            <Table striped bordered hover className="category_list">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Eltern-ID</th>
                        <th>Titel</th>
                        <th>Anzahl</th>
                        <th></th>
                        <th><Form.Check inline type="checkbox" id="checkbox_all" onChange={(e) => {select_all_checkboxes(e)}} /></th>
                    </tr>
                </thead>
                <tbody>
                    { props.children.map((category) => {
                        return (
                            <tr key={category.id} id={`category_${category.id}`} className="category_row">
                                <td>{category.id}</td>
                                <td>{category.parent}</td>
                                <td className="row_category_name">{pretty_name(category.name)}</td>
                                <td>{category.count}</td>
                                <td>
                                    <ButtonGroup>
                                        <Button variant="secondary" size="sm" className="shadow-none" onClick={(e) => { display_category_modal(category) }}><i className="fa fa-pencil"></i></Button>
                                        <Button variant="secondary" size="sm" className="shadow-none"><i className="fa fa-trash"></i></Button>
                                    </ButtonGroup>
                                </td>
                                <td><Form.Check inline type="checkbox" name="category_item_checkbox" id={`checkbox_${category.id}`} onChange={(e) => {set_checkbox_state(e)}} /></td>
                            </tr>
                        )
                    }) }
                </tbody>
            </Table>
            <CategoryModal />
        </div>
    )
}

export default CategoryListBody;