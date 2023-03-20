const Shopify = require('shopify-api-node');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 4000;
app.use(cors());

const shopify = new Shopify({
    shopName: 'is-not-art',
    accessToken: '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',
  });

  // Define an API endpoint to fetch all price rules for the store
app.get('/price-rules', async (req, res) => {
    try {
      // Fetch all price rules for the store using the Shopify API
      const priceRules = await shopify.priceRule.list();
      res.send(priceRules);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching price rules');
    }
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });