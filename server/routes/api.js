const express = require('express');
const analyzeController = require('../controllers/analyzeController');
const authController = require('../controllers/authController');
const historyController = require('../controllers/historyController');
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/analyze
// @desc    Analyze symptoms and return conditions
// @access  Public
router.post('/analyze', analyzeController.analyzeSymptoms);

// Auth Routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.getMe);

// History Routes
router.post('/history', auth, historyController.saveReport);
router.get('/history', auth, historyController.getHistory);

// Order Routes
router.post('/orders', auth, orderController.createOrder);
router.get('/orders', auth, orderController.getOrders);

// @route   GET /api/conditions
// @desc    Get all satisfied conditions (for debugging/list)
// @access  Public
router.get('/conditions', analyzeController.getAllConditions);

module.exports = router;
