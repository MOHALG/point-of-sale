const router = require('express').Router();
const { isValidObjectId, validateObjectIdParam } = require('../middleware/object-id-handler.js');
const Category = require('../models/ItemCategory.js');
const POS = require('../models/Pos.js');
const { verifyToken,requireRoles } = require('../middleware/verify-token.js');
const ownerMiddleware = require('../middleware/ownership.js');




// Create a new category 

router.post('/create', verifyToken, requireRoles('admin', 'manager'), ownerMiddleware, async (req, res, next) => {
    try {
        const { name, pos } = req.body;
        const trimmedName = typeof name === 'string' ? name.trim() : '';

        if (!trimmedName || !pos) {
            return res.status(400).json({ message: 'name and pos are required' });
        }

        if (!isValidObjectId(pos)) {
            return res.status(400).json({ message: 'pos must be a valid POS id' });
        }

        const posExists = await POS.findById(pos);
        if (!posExists) {
            return res.status(400).json({ message: 'pos does not exist' });
        }

        const createdCategory = await Category.create({ name: trimmedName, pos });
        res.status(201).json(createdCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        next(error);
    }
})

// Get all categories
router.get('/all', verifyToken, requireRoles('admin', 'manager'), async (req, res, next) => {
    try {
        const { pos } = req.query;

        if (req.user.role === 'admin') {
            if (pos !== undefined) {
                if (!isValidObjectId(pos)) {
                    return res.status(400).json({ message: 'pos must be a valid POS id' });
                }
                const filteredCategories = await Category.find({ pos });
                return res.status(200).json(filteredCategories);
            }

            const allCategories = await Category.find();
            return res.status(200).json(allCategories);
        }

        if (!req.user.assignedPos) {
            return res.status(403).json({ message: 'Forbidden: no assigned POS.' });
        }

        if (pos !== undefined && String(pos) !== String(req.user.assignedPos)) {
            return res.status(403).json({ message: 'Forbidden: cross-POS access denied.' });
        }

        const scopedCategories = await Category.find({ pos: req.user.assignedPos });
        return res.status(200).json(scopedCategories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        next(error);
    }
})

// Get a category by id 

router.get('/:id', verifyToken, requireRoles('admin', 'manager'), validateObjectIdParam('id', 'category'), async (req, res, next) => {
    try {
        const foundCategory = await Category.findById(req.params.id);
        if (!foundCategory) {
            return res.status(404).json({ message: 'Category not found' });

        }

        if (!ownerMiddleware.assertPosOwnership(req, res, foundCategory.pos)) {
            return;
        }

        return res.status(200).json(foundCategory);
    } catch (error) {
        console.error('Error fetching category:', error);
        next(error);
    }
})

// Update a category by id 

router.put('/:id', verifyToken, requireRoles('admin', 'manager'), validateObjectIdParam('id', 'category'), async (req, res, next) => {
    try {
        const existingCategory = await Category.findById(req.params.id);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (!ownerMiddleware.assertPosOwnership(req, res, existingCategory.pos)) {
            return;
        }

        const { name, pos } = req.body;
        const updateData = {};

        if (Object.prototype.hasOwnProperty.call(req.body, 'name')) {
            const trimmedName = typeof name === 'string' ? name.trim() : '';
            if (!trimmedName) {
                return res.status(400).json({ message: 'name must be a non-empty string' });
            }
            updateData.name = trimmedName;
        }

        if (Object.prototype.hasOwnProperty.call(req.body, 'pos')) {
            if (!pos || !isValidObjectId(pos)) {
                return res.status(400).json({ message: 'pos must be a valid POS id' });
            }

            const posExists = await POS.findById(pos);
            if (!posExists) {
                return res.status(400).json({ message: 'pos does not exist' });
            }

            if (!ownerMiddleware.assertPosOwnership(req, res, pos)) {
                return;
            }

            updateData.pos = pos;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'At least one valid field is required for update' });
        }

        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        return res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
})

// Delete a category by id

router.delete('/:id', verifyToken, requireRoles('admin', 'manager'), validateObjectIdParam('id', 'category'), async (req, res, next) => {
    try {
        const existingCategory = await Category.findById(req.params.id);
        if (!existingCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }

        if (!ownerMiddleware.assertPosOwnership(req, res, existingCategory.pos)) {
            return;
        }

        await Category.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        next(error);
    }
})


module.exports = router;