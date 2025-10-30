import express from 'express';
import { changePassword, forgotPassword, login, logout, register, reVerify, verify, verifyOTP } from '../controllers/userController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/reverify', reVerify);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.post('/ForgotPassword', forgotPassword);
router.post('/verifyOtp/:email', verifyOTP);
router.post('/changePassword/:email', changePassword);



export default router;