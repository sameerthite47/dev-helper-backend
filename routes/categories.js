const express = require('express');
const passport = require('passport');
const router = express.Router();

//Load input validations
const validateCategoryInput = require('../validation/category');

//Load category model
const Category = require('../models/Category');
const Post = require('../models/Post');
const User = require('../models/User');

//Test route
router.get('/test', (req, res) => {
    res.send({name:'Test'});
});

//@Route    GET /api/categories
//@Desc     Get categories
//@Access   Public
router.get('/', (req, res) => {
    Category.find()
        .populate('user', ['name', 'email'])
        .sort({ name:1 })
        .then(categories => res.json(categories))
        .catch(err => res.status(404).json({ notfound: 'Categories not found.'}));
});

//@Route    GET /api/categories/:id
//@Desc     Get category by id
//@Access   Public
router.get('/:cat_id', (req, res) => {
    Category.findById(req.params.cat_id)
        .then(category => {
            if (category) {
                res.status(200).json(category);
            } else {
                res.status(404).json({ message: "Category not found!" });
            }
        })
});//Get by id ends


//@Route    GET /api/categories/dashboard
//@Desc     Get Dashboard Data
//@Access   Private
router.get('/get/dashboard', passport.authenticate('jwt', { session: false }), (req, res) => {
    // res.json({ message: 'Dashboard'});
    const count = {
        category:0,
        post:0,
        user:0
    }
    Category.countDocuments()
        .then(cTotal => {
            count.category = cTotal;
            Post.countDocuments()
                .then(pTotal => {
                    count.post = pTotal;
                    User.countDocuments()
                        .then(uTotal => {
                            count.user = uTotal;
                            res.status(200).json(count)
                        })
                })
        });
});//get dashboard ends

//@Route    POST /api/categories
//@Desc     Create category
//@Access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateCategoryInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    const newCategory = new Category({
        name:req.body.name,
        description:req.body.description,
        imageUrl:req.body.imageUrl,
        user:req.user.id
    });

    newCategory.save()
        .then(category => res.json(category))
        .catch(err => res.json(err));
});//category ends

//@Route    PUT /api/categories/:id
//@Desc     Update category
//@Access   Private
router.put('/:cat_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validateCategoryInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newCategory = new Category({
        name:req.body.name,
        description:req.body.description,
        imageUrl:req.body.imageUrl,
        user:req.user.id,
        _id:req.params.cat_id
    });

    Category.updateOne({ _id:req.params.cat_id }, newCategory)
        .then(category => {
            res.status(200).json({ message:'Category update successfully.'});
        }).catch(err => res.status(400).json(err));

});//update category ends

//@Route    DELETE /api/categories/:id
//@Desc     Delete category
//@Access   Private
router.delete('/:cat_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Category.findByIdAndRemove(req.params.cat_id)
        .then(() => {
            res.status(200).json({ message: 'Category deleted successfully!' });
        }).catch(err => res.status(400).json(err));
});//delete ends

module.exports = router;