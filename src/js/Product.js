import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import FilterCategoriesList from '../components/products/FilterCategoriesList';
import FilterProductsPerPage from '../components/products/FilterProductsPerPage';
import FilterProductSorting from '../components/products/FilterProductSorting';
import FilterProductSearch from '../components/products/FilterProductSearch';
import ProductListBody from '../components/products/ProductListBody';

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

const get_all_categories = async () => {
    // Reset localStorage
    localStorage.removeItem('product_categories');

    // Create GUI first
    display_product_main_header();

    let url = "https://abex.phanthemanh.com/wp-json/wc/v3/products/categories?per_page=100";
    const fetched_categories = 
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
    for (const page_number of pages_array) {
        console.log(`Fetching product categories page ${page_number}...`);

        const cat_per_page = await fetch(url + "&page=" + page_number, requestOptions_woo)
        .then(response => response.json())
        .then(result => {
            let local_categories = JSON.parse(window.localStorage.getItem('product_categories'));
            if (local_categories) {
                for (const item of result) local_categories.push(item);
                window.localStorage.setItem('product_categories', JSON.stringify(local_categories));
            } else {
                window.localStorage.setItem('product_categories', JSON.stringify(result));
            }

            // Reorganize categories and then create GUI
            if (page_number == pages_array.length) {
                reorganize_categories();
                console.log(JSON.parse(window.localStorage.getItem('product_categories')));

                let final_cat = JSON.parse(window.localStorage.getItem('product_categories'));
                if (final_cat) {
                    for (const cat of final_cat) {
                        if (cat.parent == 0) {
                            add_option_to_select("categories_list", cat.id, cat.name, 'category_item');
                            if (cat.children.length > 0) {
                                let space = '---';
                                for (const child_id of cat.children) {
                                    display_child_category(final_cat, child_id, space);
                                }
                            }
                        }
                    }
                }
            }
        })
        .catch(error => console.log('error', error));
    }
}

const reorganize_categories = () => {
    let raw_data = JSON.parse(window.localStorage.getItem('product_categories'));

    for (const item of raw_data) {
        let root_id = item.id;
        item.children = [];
        for (const child_item of raw_data) {
            if (child_item.parent == root_id) {
                item.children.push(child_item.id);
            }
        }
    }

    window.localStorage.setItem('product_categories', JSON.stringify(raw_data));
}

const add_option_to_select = (id, value, title, class_name) => {
    // console.log(`Adding ${title}`);
    let select_list = document.getElementById(id);
    let option_item = document.createElement("option");
    option_item.value = value;
    let new_title = title.replaceAll(/&amp;/ig, "&");
    option_item.innerText = new_title;
    option_item.setAttribute("class", class_name);
    select_list.appendChild(option_item);
}

const display_child_category = (data_raw, cat_id, space) => {
    let new_space = space;
    for (const item of data_raw) {
        if (item.id == cat_id) {
            add_option_to_select("categories_list", item.id, `${space} ${item.name}`, 'category_item');
            if (item.children.length > 0) {
                new_space += '---';
                for (const child_id of item.children) {
                    display_child_category(data_raw, child_id, new_space);
                }
            }
            break;
        }
    }
}

const display_product_main_header = (data) => {
    console.log("Display all categories...");
    let categories_list = document.getElementById("categories_list");
    if (categories_list) {
        let option_items = document.querySelectorAll('.category_item');
        for (const option_item of option_items) {
            option_item.remove();
        }
    }
    ReactDOM.render(
        <div className="d-flex">
            <FilterCategoriesList />
            <FilterProductsPerPage />
            <FilterProductSorting />
            <FilterProductSearch />
            {/* <Button variant="success" className="shadow-none rounded-0" onClick={() => {  }}>Produkt erstellen</Button> */}
        </div>,
    document.getElementById("main_header"))
}

const get_all_products = async (event, page_number) => {
    console.log("Get all products...");

    // Get category id
    let categories_list = document.getElementById("categories_list");
    let category_id = -1;
    if (categories_list) category_id = categories_list.value;

    // Get products per page
    let filter_products_per_page = document.getElementById("filter_products_per_page");
    let per_page = 10;
    if (filter_products_per_page) per_page = filter_products_per_page.value;

    // Get sorting
    let filter_products_sorting = document.getElementById("filter_products_sorting");
    let sorting = '';
    if (filter_products_sorting) sorting = filter_products_sorting.value != -1 ? filter_products_sorting.value : '';
    
    // Get page number
    let page_num = page_number ? page_number : 1;
    
    let url = 'https://abex.phanthemanh.com/wp-json/wc/v3/products/';
    let url_cat = category_id >= 0 ? `&category=${category_id}` : '';
    let url_per_page = per_page > 0 ? `&per_page=${per_page}` : '';
    let final_url = url + "?page=" + page_num + url_cat + url_per_page + sorting;
    console.log(final_url);
    
    const fetched_products = await fetch(final_url, requestOptions_woo)
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

const ProductPagination = () => {
    return (
        <h1>ObjB</h1>
    )
}

export {
    get_all_categories,
    get_all_products
}
