import express from 'express';
import multer from 'multer';
import {
  uploadBill,
  getAllBills,

  updateBill,
  deleteBill,


  createBill
} from '../controllers/bills.js';
import { scanInbox, importEmail } from '../controllers/gmailScanner.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireUser } from '../middleware/requireUser.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'application/pdf'].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and PDF allowed.'));
    }
  }
});

// All routes require authentication
// All routes require authentication and a valid MongoDB user linked
router.use(authMiddleware, requireUser);

// Bills routes - specific routes FIRST


router.post('/upload', upload.single('billImage'), uploadBill);
router.post('/scan-gmail', scanInbox);
router.post('/gmail-import/:id', importEmail);

// Then generic routes
router.post('/', createBill);
router.get('/', getAllBills);


router.patch('/:id', updateBill);
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);



export default router;
