import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import { get_all_products } from '../../js/product';

const ProductPagination = (props) => {
    // console.log(props.children);
    const [total_pages, setTotalPages] = useState(props.children ? props.children.total_pages : []);
    const [current_page, setCurrentPage] = useState(props.children ? props.children.current_page : 0);
    const [items_found, SetItemsFound] = useState(props.children ? props.children.items_found : 0);

    const get_current_page = () => {
        return parseInt(document.getElementById("product_pagination").value);
    }

    const go_to_page = (event, step) => {
        let current_page_num = step ? get_current_page() + step : get_current_page();
        current_page_num = current_page_num > total_pages ? total_pages : current_page_num;
        current_page_num = current_page_num < 1 ? 1 : current_page_num;
        if (current_page_num != current_page) {
            setCurrentPage(current_page_num);
            get_all_products(event, current_page_num);
        }
    }

    useEffect(() => {
        if (props.children) {
            setTotalPages(props.children.total_pages);
            setCurrentPage(props.children.current_page);
            SetItemsFound(props.children.items_found);
            document.getElementById("product_pagination").value = props.children.current_page;
        }
    })

    return (
        <div className="product_pagination_wrapper">
            <div id="product_pagination_info" className="text-dark text-end">{`${items_found} Artikel gefunden.`}</div>
            <InputGroup className="product_pagination_selector">
                <Button variant="outline-secondary" className="shadow-none" onClick={(e) => { go_to_page(e, -1) }}>Vorherige</Button>
                <Form.Select
                    id="product_pagination" 
                    className="shadow-none rounded-0" 
                    onChange={(e) => { go_to_page(e) }}
                >
                    {
                        total_pages ? total_pages.map((page_number, index) => {
                            // console.log(page_number)
                            return (
                                <option key={index} value={page_number}>Seite {page_number}</option>
                            )
                        }) : ''
                    }
                </Form.Select>
                <Button variant="outline-secondary" className=" shadow-none" onClick={(e) => { go_to_page(e, 1) }}>Nächste</Button>
            </InputGroup>
        </div>
    )
}

export default ProductPagination;