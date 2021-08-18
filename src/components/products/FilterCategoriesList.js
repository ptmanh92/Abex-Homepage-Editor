import React from 'react';
import Form from 'react-bootstrap/Form';
import { get_all_products } from '../../js/product';

const FilterCategoriesList = (props) => {
    return (
        // <Form.Group controlId="categories_list">
            <Form.Select id="categories_list" className="shadow-none rounded-0" onChange={(e) => { get_all_products() }}>
                <option value="-1">Kategorie auswählen</option>
            </Form.Select>
        // </Form.Group>
    )
}

export default FilterCategoriesList;