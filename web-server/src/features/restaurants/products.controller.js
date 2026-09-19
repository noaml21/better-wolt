const productsService = require('./products.service');
const restaurantsService = require('./restaurants.service');

async function getMenu(req, res) {
    try {
        const menu = await productsService.getMenu(req.params.id);

        if (!menu) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        return res.status(200).json(menu);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

async function addProduct(req, res) {
    if (!req.body || !req.body.name || req.body.price === undefined) {
        return res.status(400).json({
            error: 'Missing required fields: name, price'
        });
    }

    try {
        const restaurant = await restaurantsService.getRestaurantById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!req.user || restaurant.username !== req.user.username) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const product = await productsService.addProduct(req.params.id, req.body);

        if (!product) {
            return res.status(400).json({ error: 'Missing or invalid product data' });
        }

        return res
            .status(201)
            .location(`/api/restaurants/${req.params.id}/products/${product.id}`)
            .json(product);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

async function getProduct(req, res) {
    try {
        const product = await productsService.getProduct(req.params.id, req.params.pId);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

async function updateProduct(req, res) {
    if (!req.body) {
        return res.status(400).json({ error: 'Missing required field: body' });
    }

    try {
        const restaurant = await restaurantsService.getRestaurantById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!req.user || restaurant.username !== req.user.username) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const product = await productsService.updateProduct(req.params.id, req.params.pId, req.body);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(200).json(product);

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

async function deleteProduct(req, res) {
    try {
        const restaurant = await restaurantsService.getRestaurantById(req.params.id);

        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (!req.user || restaurant.username !== req.user.username) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const deleted = await productsService.deleteProduct(req.params.id, req.params.pId);

        if (!deleted) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.status(204).send();

    } catch (error) {
        return res.status(500).json({ error: 'Error processing request' });
    }
}

module.exports = {
    getMenu,
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct
};
