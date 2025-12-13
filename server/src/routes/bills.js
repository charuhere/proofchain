import express from 'express';
import multer from 'multer';
import {
  uploadBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  searchBills,
  getBillsExpiringsoon,
  createBill
} from '../controllers/bills.js';
import { scanInbox, importEmail } from '../controllers/gmailScanner.js';
import { authMiddleware } from '../middleware/auth.js';

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
router.use(authMiddleware);

// Bills routes - specific routes FIRST
router.get('/search', searchBills);
router.get('/expiring-soon', getBillsExpiringsoon);
router.post('/upload', upload.single('billImage'), uploadBill);
router.post('/scan-gmail', scanInbox);
router.post('/gmail-import/:id', importEmail); 

// Then generic routes
router.post('/', createBill);
router.get('/', getAllBills);

router.get('/:id', getBillById);
router.patch('/:id', updateBill); 
router.put('/:id', updateBill);
router.delete('/:id', deleteBill);



export default router;
