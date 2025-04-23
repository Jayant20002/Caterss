const express = require('express');
const Menu = require('../models/Menu');
const router = express.Router();

const menuController = require('../controllers/menuControllers')
const { recommendMenuItems, smartSearch } = require('../services/aiService');

const verifyToken = require('../middlewares/verifyToken');
const verifyAdmin = require('../middlewares/verifyAdmin');


// get all menu items
router.get('/', menuController.getAllMenuItems);

// get menu recommendations
router.get('/recommendations', verifyToken, async (req, res) => {
    try {
        // For now, we'll use empty arrays for preferences and history
        // In a real implementation, you would fetch these from the user's data
        const recommendations = await recommendMenuItems([], []);
        res.json({ recommendations });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ message: 'Error getting recommendations' });
    }
});

// smart search endpoint
router.get('/smart-search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const results = await smartSearch(q);
        res.json({ results });
    } catch (error) {
        console.error('Error in smart search:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
});

// post a menu item
router.post('/', verifyToken, verifyAdmin, menuController.postMenuItem);

// delete a menu item
router.delete('/:id',verifyToken, verifyAdmin, menuController.deleteMenu);

// get a single menu item
router.get('/:id', menuController.singleMenuItem);

// update a menu item
router.patch('/:id',verifyToken, verifyAdmin, menuController.updateMenuItem);


// get all menu items

// router.get('/', async (req, res) => {
//     try {
//         const menus = await Menu.find({});
//         res.status(200).json(menus);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// });

module.exports = router;