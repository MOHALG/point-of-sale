function assertPosOwnership(req, res, targetPos) {
    if (!req.user || !req.user.id) {
        res.status(401).json({ message: 'Unauthorized' });
        return false;
    }

    const role = req.user.role;

    if (role === 'admin') {
        return true;
    }

    if (role !== 'manager' && role !== 'cashier') {
        res.status(403).json({ message: 'Forbidden: insufficient role.' });
        return false;
    }

    if (!req.user.assignedPos) {
        res.status(403).json({ message: 'Forbidden: no assigned POS.' });
        return false;
    }

    if (!targetPos) {
        res.status(400).json({ message: 'POS context is required for ownership check.' });
        return false;
    }

    if (String(req.user.assignedPos) !== String(targetPos)) {
        res.status(403).json({ message: 'Forbidden: cross-POS access denied.' });
        return false;
    }

    return true;
}

function ownershipMiddleware(req, res, next) {
    const targetPos = req.params.posId || req.body.pos || req.query.pos;

    // Important: do not fail here when context is missing.
    // Id-based routes should load the resource first and then call assertPosOwnership.
    if (!targetPos) {
        return next();
    }

    if (!assertPosOwnership(req, res, targetPos)) {
        return;
    }

    return next();
}

module.exports = ownershipMiddleware;
module.exports.assertPosOwnership = assertPosOwnership;
