var express = require('express');
var router = express.Router();
const sqlite = require('sqlite3').verbose();
var models = require('../models');
const auth = require("../config/auth");
const passport = require('passport');

module.exports = {
  signUser: function(user) {
    const token = jwt.sign(
      {
        Username: user.Username,
        UserId: user.UserId
      },
      'secret',
      {
        expiresIn: '1h'
      }
    );
    return token;
  },

  verifyUser: function(req, res, next) {
    try {
      let token = req.cookies.jwt;
      const decoded = jwt.verify(token, 'secret');
      req.userData = decoded;
      models.users
        .findOne({
          where: {
            UserId: decoded.UserId
          }
        })
        .then(user => {
          req.user = user;
          next();
        });
    } catch (err) {
      console.log(err);
      return res.status(401).json({
        message: 'Auth Failed'
      });
    }
  }
};


/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/users', function(req, res, next) {
  models.users
    .findAll({
      where: {
        Deleted: null
      }
    })
    .then(usersFound => {
      res.render('users', {
        users: usersFound
      });
    });
});

router.get('/users/admin', function(req, res) {
  models.users
    .findAll({})
    .then(usersFound => {
      res.render('users', {
        users: usersFound
      });
    });
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post('/signup', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users
  .findOne({
    where: {
      Username: req.body.username
    }
  })
  .then(user => {
    if (user) {
      res.send('this user already exists')
    } else {
      models.users
      .create({
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Username: req.body.username,
        Password: hashedPassword,
        Admin: false
      })
      .then(createdUser => {
        const isMatch = createdUser.comparePassword(req.body.password);

        if (isMatch) {
          const userId = createdUser.UserId
          console.log(userId);
          const token = auth.signUser(createdUser);
          res.cookie('jwt', token);
          res.redirect('profile/' + userId)
        } else {
          console.error('not a match');
        }
      });
    }
  });
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login', function (req, res, next) {
  const hashedPassword = auth.hashPassword(req.body.password);
  models.users.findOne({
    where: {
      Username: req.body.username
    }
  }).then(user => {
    const isMatch = user.comparePassword(req.body.password)

    if (!user) {
      return res.status(401).json({
        message: "Login Failed"
      });
    }
    if (isMatch) {
      const userId = user.UserId
      const token = auth.signUser(user);
      res.cookie('jwt', token);
      res.redirect('profile/' + userId)
    } else {
      console.log(req.body.password);
      res.redirect('login')
    }
  });
});

router.get('/posts', function(req, res, next) {
  res.render('posts')
});
//
router.post('/posts', function(req, res, next) {
  models.posts.findOne({
    where: {
      UserId: req.body.userId
    }
  })
  .then(post => {
    console.log('user post')
  });
});

router.delete('/posts/:id/delete', (req, res) => {
  let postId = parseInt(req.params.id);
  models.posts
  .update(
    {
      Deleted: 'true'
    },
    {
    where: {
      UserId: userId
    }
  }
)
  .then(post => {
    models.users
    .update(
      {
        Deleted: 'true'
      },
      {
        where: {
          UserId: userId
        }
      }
    )
    .then(user => {
      res.redirect('/users');
    });
  });
});

router.get('/login/github', passport.authenticate('github', {
  session: true,
  failureRedirect: "/users/login"
}));

router.get(
  '/login/github/callback',
  passport.authenticate('github', {
    failureRedirect: '/users/login'
  }),
  function (req, res) {
    const token = auth.signUser(req.user);
    res.cookie('jwt', token);
    res.redirect('/users/profile/' + req.user.UserId)
  }
);

router.get('/profile/:id', auth.verifyUser, function (req, res, next) {
  if (req.params.id !== String(req.user.UserId)) {
    res.send('This is not your profile')
  } else {
    let status;
    if (req.user.Admin) {
      status = 'Admin';
    } else {
      status = 'Normal user';
    }

    res.render('profile', {
      FirstName: req.user.FirstName,
      LastName: req.user.LastName,
      Email: req.user.Email,
      UserId: req.user.UserId,
      Username: req.user.Username
    });
  }
});

router.delete('/profile/:id/delete', (req, res) => {
  let userId = parseInt(req.params.id);
  models.posts
  .update(
    {
      Deleted: 'true'
    },
    {
    where: {
      UserId: userId
    }
  }
)
  .then(post => {
    models.users
    .update(
      {
        Deleted: 'true'
      },
      {
        where: {
          UserId: userId
        }
      }
    )
    .then(user => {
      res.redirect('/users');
    });
  });
});

router.get('/logout', function (req, res) {
  res.cookie('jwt', null);
  res.redirect('/users/login');
});

router.get('/users/admin/editUser/:id', function(req, res) {
  let admin = parseInt(req.params.admin);
  models.users.findOne({
    where: {
      admin: admin
    }
  })
})

module.exports = router;

