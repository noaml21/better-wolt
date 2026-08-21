const restaurantsService = require('../services/restaurants');

async function getAllRestaurants(req, res) {
  try {
    const restaurants = await restaurantsService.getAllRestaurants();
    return res.status(200).json(restaurants);
  } catch (error) {
    return res.status(500).json({ error: 'Error processing request' });
  }
}

async function createRestaurant(req, res) {
  if (!req.body || !req.body.name) {
    return res.status(400).json({
      error: 'Name is required'
    });
  }

  if (!req.user || !req.user.username) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  if (req.user.role !== 'restaurant') {
    return res.status(403).json({
      error: 'Only restaurant owners can create restaurants'
    });
  }

  try {
    const restaurant = await restaurantsService.createRestaurant({
      username: req.user.username,
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
      image: req.body.image
    });

    return res
      .status(201)
      .location(`/api/restaurants/${restaurant.id}`)
      .json(restaurant);

  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

async function getRestaurant(req, res) {
  try {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        error: 'Restaurant not found'
      });
    }

    return res.status(200).json(restaurant);

  } catch (error) {
    return res.status(404).json({
      error: 'Restaurant not found'
    });
  }
}

async function updateRestaurant(req, res) {
  try {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!req.user || restaurant.username !== req.user.username) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedRestaurant = await restaurantsService.updateRestaurant(req.params.id, req.body);

    if (!updatedRestaurant) {
      return res.status(404).json({
        error: 'Restaurant not found'
      });
    }

    return res.status(204).send();

  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
}

async function deleteRestaurant(req, res) {
  try {
    const restaurant = await restaurantsService.getRestaurantById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    if (!req.user || restaurant.username !== req.user.username) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const deleted = await restaurantsService.deleteRestaurant(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        error: 'Restaurant not found'
      });
    }

    return res.status(204).send();

  } catch (error) {
    return res.status(500).json({
      error: 'Error processing request'
    });
  }
}

module.exports = {
  getAllRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant
};
