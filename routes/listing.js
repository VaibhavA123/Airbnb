const express = require('express');
const router = express.Router();
const Listing = require('../models/listing.js');
const { isLoggedIn,validateListing,isOwner } = require("../middleware.js");
const wrapAsync = require('../utils/wrapAsync.js');
const { reviewSchema } = require("../schema.js");
const listingController = require('../controllers/listings.js');
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'),validateListing,wrapAsync(listingController.createListing));


router.get("/new", isLoggedIn,listingController.renderNewForm);

router.route("/:id")
.get(isLoggedIn,wrapAsync(listingController.showListing))
.put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing,wrapAsync(listingController.updateListing))
.delete(isLoggedIn,wrapAsync(listingController.destroyListing));

router.get("/:_id/edit", isLoggedIn ,wrapAsync(listingController.renderEditForm));

module.exports = router;