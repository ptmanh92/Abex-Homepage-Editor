import React from 'react';
import Form from 'react-bootstrap/Form';
import { get_all_products } from '../../js/product';

const FilterProductSearch = (props) => {
    const handle_keydown = (e) => {
        if (e.keyCode === 13) get_all_products();
    }

    return (
        // <Form.Group controlId="filter_products_search">
            <Form.Control
                type="text"
                id="filter_products_search"
                className="shadow-none rounded-0"
                placeholder="Produkte suchen..."
                onKeyDown={(e) => { handle_keydown(e) }}
            />
        // </Form.Group>
    )
}

export default FilterProductSearch;