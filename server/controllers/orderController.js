const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const { items, totalAmount, address, phone, paymentMethod, paymentDetails } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ msg: 'Order must contain at least one item.' });
        }

        if (!address || !phone) {
            return res.status(400).json({ msg: 'Please provide delivery address and phone number.' });
        }

        const newOrder = new Order({
            userId: req.user.id,
            items,
            totalAmount,
            address,
            phone,
            paymentMethod: paymentMethod || 'COD',
            paymentDetails: paymentDetails || '',
            status: 'Placed'
        });

        const order = await newOrder.save();
        res.status(201).json(order);
    } catch (err) {
        console.error("Create Order Error:", err.message);
        res.status(500).send('Server Error');
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("Get Orders Error:", err.message);
        res.status(500).send('Server Error');
    }
};
