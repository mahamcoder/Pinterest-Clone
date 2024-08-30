var express = require('express');
const passport = require('passport');
var router = express.Router();
const usermodel = require('./users');
const postmodel = require('./post');
const localstrategy = require('passport-local');
passport.use(new localstrategy(usermodel.authenticate()))
const upload = require("./multer");

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { error: req.flash('error') });
});
router.get('/register', function (req, res, next) {
  console.log(req.flash('error'))
  res.render('register')
})

router.get('/profile', isloggedIn, async function (req, res, next) {
  let user = await usermodel
    .findOne({ username: req.session.passport.user })
    .populate("posts");
  ;
  res.render('profile', { user });
})
router.get('/feed', isloggedIn, async function (req, res, next) {
  const user = await usermodel.findOne({ username: req.session.passport.user })
  let posts = await postmodel
    .find()
    .populate("user");
  res.render('feed', { user, posts });
})
router.get('/add', isloggedIn, async function (req, res, next) {
  let user = await usermodel.findOne({ username: req.session.passport.user });
  res.render('add', { user });
})
router.post('/createpost', isloggedIn, upload.single('postimage'), async function (req, res, next) {
  let user = await usermodel
    .findOne({ username: req.session.passport.user });
  const post = await postmodel.create({
    user: user._id,
    title: req.body.title,
    discription: req.body.discription,
    image: req.file.filename
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile")
})
router.post('/fileupload', isloggedIn, upload.single('image'), async function (req, res, next) {
  let user = await usermodel.findOne({ username: req.session.passport.user });
  user.profilephoto = req.file.filename;
  await user.save();
  res.redirect('/profile');
})
router.post('/register', function (req, res, next) {
  const data = new usermodel({
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
  }
  )
  usermodel.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function () {
      res.redirect("/feed");
  })
})
})

router.post('/login', passport.authenticate("local", {
  successRedirect: "/feed",
  failureRedirect: "/",
  failureFlash: true,

}), function (req, res, next) {

})
router.get('/logout', function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/')
  })
})
function isloggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

module.exports = router;
