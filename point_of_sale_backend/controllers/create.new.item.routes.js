const router = require('express').Router();
const Item = require('../models/Items');
const { isValidObjectId, validateObjectIdParam } = require('../middleware/object-id-handler.js');
const { verifyToken,requireRoles } = require('../middleware/verify-token.js');
const ownerMiddleware = require('../middleware/ownership.js');

// Create a new item 
router.post('/create', verifyToken, requireRoles('admin', 'manager'), ownerMiddleware, async (req, res, next) => {
    try {
        const { name, price, pos, description, unitOfMeasurement, itemCategory } = req.body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: 'name is required' });
        }

        if (typeof price !== 'number' || Number.isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'price must be a number greater than or equal to 0' });
        }

        if (!pos || !isValidObjectId(pos)) {
            return res.status(400).json({ message: 'pos must be a valid POS id' });
        }

        if (itemCategory && !isValidObjectId(itemCategory)) {
            return res.status(400).json({ message: 'itemCategory must be a valid category id' });
        }

        const createdItem = await Item.create({
            name,
            price,
            pos,
            description,
            unitOfMeasurement,
            itemCategory,
        });
        res.status(201).json(createdItem);
    } catch (error) {
        console.error('Error creating item:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
})

// Get all items
router.get('/all', verifyToken, async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            const allItems = await Item.find();
            return res.status(200).json(allItems);
        }

        if (!req.user.assignedPos) {
            return res.status(403).json({ message: 'Forbidden: no assigned POS.' });
        }

        const scopedItems = await Item.find({ pos: req.user.assignedPos });
        return res.status(200).json(scopedItems);
    } catch (error) {
        console.error('Error fetching items:', error);
        next(error);
    }
})

// Get an item by id
router.get('/:id', verifyToken, validateObjectIdParam('id', 'item'), async (req, res, next) => {
    try {
        const foundItem = await Item.findById(req.params.id);
        if (!foundItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!ownerMiddleware.assertPosOwnership(req, res, foundItem.pos)) {
            return;
        }

        return res.status(200).json(foundItem);
    } catch (error) {
        console.error('Error fetching item:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
})

// Update an item by id
router.put('/:id', verifyToken, requireRoles('admin', 'manager'), validateObjectIdParam('id', 'item'), async (req, res, next) => {
    try {
        const existingItem = await Item.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!ownerMiddleware.assertPosOwnership(req, res, existingItem.pos)) {
            return;
        }

        const allowedFields = ['name', 'price', 'pos', 'description', 'unitOfMeasurement', 'itemCategory'];
        const updateData = {};

        for (const key of allowedFields) {
            if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                updateData[key] = req.body[key];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'At least one valid field is required for update' });
        }

        if (Object.prototype.hasOwnProperty.call(updateData, 'name')) {
            if (!updateData.name || typeof updateData.name !== 'string' || !updateData.name.trim()) {
                return res.status(400).json({ message: 'name must be a non-empty string' });
            }
        }

        if (Object.prototype.hasOwnProperty.call(updateData, 'price')) {
            if (typeof updateData.price !== 'number' || Number.isNaN(updateData.price) || updateData.price < 0) {
                return res.status(400).json({ message: 'price must be a number greater than or equal to 0' });
            }
        }

        if (Object.prototype.hasOwnProperty.call(updateData, 'pos')) {
            if (!isValidObjectId(updateData.pos)) {
                return res.status(400).json({ message: 'pos must be a valid POS id' });
            }

            if (!ownerMiddleware.assertPosOwnership(req, res, updateData.pos)) {
                return;
            }
        }

        if (Object.prototype.hasOwnProperty.call(updateData, 'itemCategory') && updateData.itemCategory && !isValidObjectId(updateData.itemCategory)) {
            return res.status(400).json({ message: 'itemCategory must be a valid category id' });
        }

        const updatedItem = await Item.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        return res.status(200).json(updatedItem);
    } catch (error) {
        console.error('Error updating item:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
})

// Delete an item by id
router.delete('/:id', verifyToken, requireRoles('admin', 'manager'), validateObjectIdParam('id', 'item'), async (req, res, next) => {
    try {
        const existingItem = await Item.findById(req.params.id);
        if (!existingItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        if (!ownerMiddleware.assertPosOwnership(req, res, existingItem.pos)) {
            return;
        }

        await Item.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error deleting item:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
});
    

module.exports = router;