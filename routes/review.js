const express = require('express');
const router = express.Router({mergeParams : true});
const Listing = require('../models/listing.js');
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require("../schema.js");
const { reviewSchema } = require("../schema.js");
const Review = require('../models/review.js');
const { isLoggedIn,isReviewAuthor } = require('../middleware.js');
const {validateReview} = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');
router.post("/",isLoggedIn,validateReview,wrapAsync(reviewController.createReview));
//Delete review route
router.delete("/:reviewId",isReviewAuthor ,wrapAsync(reviewController.destroyReview));
module.exports = router;