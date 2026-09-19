const restaurantsService = require('../restaurants/restaurants.service');

async function search(req, res) {
  const query = String(req.params.query || '').trim();

  if (!query) {
    return res.status(400).json({ error: 'Missing search query' });
  }

  try {
    const results = await restaurantsService.searchRestaurants(query);
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: 'Error processing request' });
  }
}

module.exports = {
  search
};
