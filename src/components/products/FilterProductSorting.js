import React from 'react';
import Form from 'react-bootstrap/Form';
import { get_all_products } from '../../js/product';

const FilterProductSorting = (props) => {
    return (
        <Form.Group controlId="filter_products_sorting">
            <Form.Select id="filter_products_sorting" className="shadow-none rounded-0" onChange={(e) => { get_all_products() }}>
                <option value="-1">Sortieren</option>
                <option value="&orderby=date&order=asc">Nach Datum aufsteigend</option>
                <option value="&orderby=date&order=desc">Nach Datum absteigend</option>
                <option value="&orderby=title&order=asc">Nach Titel aufsteigend</option>
                <option value="&orderby=title&order=desc">Nach Titel absteigend</option>
                <option value="&orderby=price&order=asc">Nach Preis aufsteigend</option>
                <option value="&orderby=price&order=desc">Nach Preis absteigend</option>
            </Form.Select>
        </Form.Group>
    )
}

export default FilterProductSorting;