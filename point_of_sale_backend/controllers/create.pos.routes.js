const router = require ('express').Router();
const { validateObjectIdParam } = require('../middleware/object-id-handler.js');
const PointOfSale = require('../models/Pos.js');
const { verifyToken,requireRoles } = require('../middleware/verify-token.js');
const ownerMiddleware = require('../middleware/ownership.js');





// Create a new point of sale
router.post('/create', verifyToken, requireRoles('admin', 'manager'), async (req, res, next) => {
    try {
        const { name, location, paymentMethods } = req.body;
        const createdPointOfSale = await PointOfSale.create({ name, location, paymentMethods });
        return res.status(201).json(createdPointOfSale);

    } catch (error) {
        console.error('Error creating point of sale:', error);
        next(error);
    }
});

// Get all points of sale
router.get('/all', verifyToken, requireRoles('admin', 'manager', 'cashier'), async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            const allPointsOfSale = await PointOfSale.find();
            return res.status(200).json(allPointsOfSale);
        }

        if (!req.user.assignedPos) {
            return res.status(403).json({ message: 'Forbidden: no assigned POS.' });
        }

        const scopedPos = await PointOfSale.find({ _id: req.user.assignedPos });
        return res.status(200).json(scopedPos);
    } catch (error) {
        console.error('Error fetching points of sale:', error);
        next(error);
    }
});


//get a point of sale by id
router.get('/:id', verifyToken, requireRoles('admin', 'manager', 'cashier'), validateObjectIdParam('id', 'point of sale'), async (req, res, next) => {
    try {
        const foundPointOfSale = await PointOfSale.findById(req.params.id);
        if (!foundPointOfSale) {
            return res.status(404).json({ message: 'Point of sale not found' });

        }

        if (!ownerMiddleware.assertPosOwnership(req, res, foundPointOfSale._id)) {
            return;

        }
        return res.status(200).json(foundPointOfSale);
    } catch (error) {
        console.error('Error fetching point of sale:', error);
        next(error);
    }
});











module.exports = router;