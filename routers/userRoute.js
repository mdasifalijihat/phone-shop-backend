import express from 'express';
import { allUsers, changePassword, forgotPassword, getUserId, login, logout, register, reVerify, verify, verifyOTP } from '../controllers/userController.js';
import { isAdmin, isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify', verify);
router.post('/reverify', reVerify);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.post('/ForgotPassword', forgotPassword);
router.post('/verifyOtp/:email', verifyOTP);
router.post('/changePassword/:email', changePassword);
router.get('/allUsers',isAuthenticated, isAdmin, allUsers )
router.get('/getUsers/:userId', getUserId )
 


export default router;