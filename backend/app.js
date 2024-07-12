const expressLib = require('express');
const axiosLib = require('axios');
const { v4: generateUUID } = require('uuid'); // To generate unique IDs for items
const serverApp = expressLib();
const serverPort = 3000;
const corsLib = require('cors');
serverApp.use(corsLib());

const companyList = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const categoryList = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

const API_BASE_URL = 'http://20.244.56.144/test/companies';

// Function to get top n items for a given company, category, minPrice, and maxPrice
const fetchTopItems = async (company, category, top, minPrice, maxPrice) => {
    try {
        const requestUrl = `${API_BASE_URL}/${company}/categories/${category}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}`;
        console.log(`Requesting URL: ${requestUrl}`); // Logging the URL

        const requestHeaders = {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwNzgyOTA4LCJpYXQiOjE3MjA3ODI2MDgsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImQxYzJmOGE0LWMxNDctNDEyYi04NTEyLTYyNjg1YTMyMDg2ZSIsInN1YiI6InN1cmFqLm9tYXJfY3MyMUBnbGEuYWMuaW4ifSwiY29tcGFueU5hbWUiOiJHTEEgVW5pdmVyc2l0eSIsImNsaWVudElEIjoiZDFjMmY4YTQtYzE0Ny00MTJiLTg1MTItNjI2ODVhMzIwODZlIiwiY2xpZW50U2VjcmV0IjoiY1pUUXVSamJKZEZNRmRidCIsIm93bmVyTmFtZSI6IlN1cmFqIE9tYXIiLCJvd25lckVtYWlsIjoic3VyYWoub21hcl9jczIxQGdsYS5hYy5pbiIsInJvbGxObyI6IjIxMTUwMDEwMTkifQ.wbqvSpAioX8w_vNJRBx2c3yrxCe5w6ep_UJ4_GHu4xo', // Replace with actual token
        };

        const response = await axiosLib.get(requestUrl, { headers: requestHeaders });
        console.log(`Received response for ${company}, ${category}:`, response.data);
        return response.data.map(item => ({
            ...item,
            id: generateUUID(),
        }));
    } catch (err) {
        console.error(`Error fetching items for ${company}, ${category}:`, err.message);
        throw err;
    }
};

// Endpoint to get top n items for a category
serverApp.get('/categories/:categoryName/items', async (req, res) => {
    try {
        const { categoryName } = req.params;
        const { top = 10, minPrice = 0, maxPrice = 10000, sortBy, order = 'asc', page = 1, company } = req.query;

        console.log(`Received request: category=${categoryName}, top=${top}, minPrice=${minPrice}, maxPrice=${maxPrice}, sortBy=${sortBy}, order=${order}, page=${page}, company=${company}`);

        if (!categoryList.includes(categoryName)) {
            console.log(`Invalid category: ${categoryName}`);
            return res.status(400).json({ error: 'Invalid category' });
        }

        let selectedCompanies = companyList;
        if (company) {
            selectedCompanies = company.split(',');
            const invalidCompanies = selectedCompanies.filter(comp => !companyList.includes(comp));
            if (invalidCompanies.length > 0) {
                console.log(`Invalid companies: ${invalidCompanies}`);
                return res.status(400).json({ error: `Invalid companies: ${invalidCompanies.join(', ')}` });
            }
        }

        let allItems = [];
        for (const comp of selectedCompanies) {
            console.log(`Fetching items for company: ${comp}, category: ${categoryName}`);
            const items = await fetchTopItems(comp, categoryName, top, minPrice, maxPrice);
            allItems = allItems.concat(items);
        }

        // Sorting
        if (sortBy) {
            allItems.sort((a, b) => {
                if (order === 'asc') {
                    return a[sortBy] > b[sortBy] ? 1 : -1;
                } else {
                    return a[sortBy] < b[sortBy] ? 1 : -1;
                }
            });
        }

        // Pagination
        const pageSize = parseInt(top, 10);
        const totalItems = allItems.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const currentPage = Math.min(Math.max(parseInt(page, 10), 1), totalPages);
        const paginatedItems = allItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

        res.json({
            items: paginatedItems,
            page: currentPage,
            totalPages,
            totalItems,
        });
    } catch (err) {
        console.error('Error fetching items:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint to get details of a specific item
serverApp.get('/categories/:categoryName/items/:itemId', async (req, res) => {
    try {
        const { categoryName, itemId } = req.params;

        console.log(`Received request for item details: category=${categoryName}, itemId=${itemId}`);

        // Fetch all items for the category
        let allItems = [];
        for (const company of companyList) {
            const items = await fetchTopItems(company, categoryName, 100, 0, 10000); // You can adjust the parameters as needed
            allItems = allItems.concat(items);
        }

        const itemDetails = allItems.find(item => item.id === itemId);

        if (!itemDetails) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(itemDetails);
    } catch (err) {
        console.error('Error fetching item details:', err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

serverApp.listen(serverPort, () => {
    console.log(`Server running at http://localhost:${serverPort}`);
});
