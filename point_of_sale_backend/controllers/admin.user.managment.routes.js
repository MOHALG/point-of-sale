const router = require('express').Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { isValidObjectId, validateObjectIdParam } = require('../middleware/object-id-handler.js');
const { verifyToken, requireRoles } = require('../middleware/verify-token.js');
const ownerMiddleware = require('../middleware/ownership.js');




// create a new user

router.post('/', verifyToken, requireRoles('admin'), async (req, res, next) => {
    try {
        const { username, password, role, assignedPos } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'username and password are required.' });
        }

        if (role !== undefined && !['admin', 'manager', 'cashier'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Allowed values are admin, manager, cashier.' });
        }

        if (assignedPos !== undefined && assignedPos !== null && !isValidObjectId(assignedPos)) {
            return res.status(400).json({ message: 'Invalid assignedPos id.' });
        }

        // Check if the username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create a new user
        const newUser = new User({
            username,
            hashedPassword: bcrypt.hashSync(password, 12),
            role: role ?? 'cashier',
            assignedPos: assignedPos ?? null
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        next(error);
    }
});


// get all users
router.get('/all', verifyToken, requireRoles('admin'), async (req,res,next) => {
    try {
        const allUsers = await User.find();
        res.status(200).json(allUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        next(error);
    }
});

// get a specific user by ID
router.get('/:id', verifyToken, requireRoles('admin'), validateObjectIdParam('id'), async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        next(error);
    }
});


// update a specific user by ID
router.put('/:id', verifyToken, requireRoles('admin'), validateObjectIdParam('id'), async (req, res, next) => {
    try{
        const userId = req.params.id;
        const updatedData = {};

        if (req.body.role !== undefined) {
            updatedData.role = req.body.role;
        }

        if (req.body.assignedPos !== undefined) {
            updatedData.assignedPos = req.body.assignedPos;
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: 'No valid fields provided for update.' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found'});  
        }
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        next(error);
    }
});

// Delete a specific user by ID
router.delete('/:id', verifyToken, requireRoles('admin'), validateObjectIdParam('id'), async (req,res,next) => {
    try {
        const userId = req.params.id;

        if (req.user && req.user.id === userId) {
            return res.status(400).json({ message: 'You cannot delete your own account.' });
        }

        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (userToDelete.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin account.' });
            }
        }

        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        next(error);
    }
});

module.exports = router;