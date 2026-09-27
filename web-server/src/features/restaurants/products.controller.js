const productsService = require('./products.service');

async function getMenu(req, res) {
    return res.status(200).json(await productsService.getMenu(req.params.id));
}

async function addProduct(req, res) {
    const product = await productsService.addProduct(req.params.id, req.body);

    return res
        .status(201)
        .location(`/api/restaurants/${req.params.id}/products/${product.id}`)
        .json(product);
}

async function getProduct(req, res) {
    return res.status(200).json(await productsService.getProduct(req.params.id, req.params.pId));
}

async function updateProduct(req, res) {
    return res.status(200).json(await productsService.updateProduct(req.params.id, req.params.pId, req.body));
}

async function deleteProduct(req, res) {
    await productsService.deleteProduct(req.params.id, req.params.pId);
    return res.status(204).send();
}

module.exports = {
    getMenu,
    addProduct,
    getProduct,
    updateProduct,
    deleteProduct,
};
