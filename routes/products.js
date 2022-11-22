const router = require('express').Router();
const productController = require('../controller/product.controller');
const cloudinary = require('../utils/cloudinary');
const upload = require('../utils/multer');
const Product = require('../models/product.model'); 

router.post('/upload', upload.single('image'), productController.uploadImage);

router.get('/test', productController.getProducts);
router.get('/team/:id', productController.getTeamProducts);

router.put(
  '/update/:id',
  upload.single('image'),
  productController.updateImage
);
router.get('/productPage/:id', productController.getProductPage);
router.get('/search/:searchQuery', productController.search);
router.delete('/delete/:id', productController.delete);
module.exports = router;
