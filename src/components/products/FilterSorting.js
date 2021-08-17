import React from 'react';
import Form from 'react-bootstrap/Form';
import { get_all_products } from '../../js/product';

const FilterSorting = (props) => {
    return (
        <Form.Group controlId="filter_products_sorting">
            <Form.Select id="filter_products_sorting" className="shadow-none rounded-0" onChange={(e) => { get_all_products() }}>
                <option value="">Sortieren</option>
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="60">60</option>
                <option value="70">70</option>
                <option value="80">80</option>
                <option value="90">90</option>
                <option value="100">100</option>
            </Form.Select>
        </Form.Group>
    )
}

export default FilterSorting;