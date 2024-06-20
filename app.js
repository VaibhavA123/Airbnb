if(process.env.NODE_ENV != "production"){
require('dotenv').config();
}

const express = require('express');
const app = express();
const port = 8080;
const path = require("path");
const mongoose = require('mongoose');
const Listing = require('./models/listing.js');
const ejsMate = require('ejs-mate');
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");
const Review = require('./models/review.js');
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const methodOverride = require('method-override');
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));

const store = MongoStore.create({
    mongoUrl : process.env.ATLASDB_URL,
    crypto : {
        secret : process.env.SECRET
    },
    touchAfter : 24 * 3600,
});

store.on('error',() => {
    console.log('ERROR in MONGO SESSION STORE',err);
});

const sessionOptions = {
    store : store,
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
}


app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


main()
.then(() => {
    console.log('connection successful');
})
.catch((err) => {
    console.log(err);
});

async function main() {
    // await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
    await mongoose.connect(process.env.ATLASDB_URL);
}

app.get("/testListening",(req,res) => {
    let sampleListing = new Listing({
        title : "My New Villa",
        description : "By the beach",
        price:1200,
        location:"Calangute, Goa",
        country : "India"
    });
    // res.send("Hello");
    // sampleListing.save()
    // .then((result) => {
    //     res.send(result);
    // });

});

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    console.log(res.locals.success);
    console.log(res.locals.error);
    next();
});

// app.get("/demouser",async (req,res) => {
//     let fakeUser = new User({
//         email : "student@gmail.com",
//         username : "delta-student"
//     });
//     let registeredUser = await User.register(fakeUser,"helloworld");
//     res.send(registeredUser);
// });

// app.get("/test",async (req,res) => {
//     const user = new User({
//         email : "vibhavgoel474@gmail.com",
//         username : "Vaibhav Goel"
//     });
//     let new_User = await User.register(user,"Varun@34252233743974");
//     res.send(new_User);
// });


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);



app.get("/listing/rooms",async (req,res) => {
    let data = await Listing.find({place:"Rooms"});
    data.image.url = req.file.path;
        res.render("rooms.ejs",{data});
});


app.use((err,req,res,next) => {
    let { statusCode = 500,message='Something went wrong!'} = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render('error.ejs',{err});
});

app.listen(port,() => {
    console.log(`app is listening to port ${port}`);
});