const express = require('express');
const passport = require('passport');
const router = express.Router();

//Load input validations
const validatePostInput = require('../validation/post');

//Load post model
const Post = require('../models/Post');

//Test route
router.get('/test', (req, res) => {
    res.send({name:'Hello from Post'});
});

//@Route    GET /api/posts
//@Desc     Get posts
//@Access   Public
router.get('/', (req, res) => {
    Post.find()
        .populate('user', ['name'])
        .populate('category', ['name'])
        .sort({ createdDate:-1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ notfound: 'Posts not found.'}));
});//Get posts ends

//@Route    GET /api/posts/:id
//@Desc     Get post by id
//@Access   Public
router.get('/:post_id', (req, res) => {
    Post.findById(req.params.post_id)
        .populate('user', ['name'])
        .populate('category', ['name'])
        .then(post => {
            if (post) {
                res.status(200).json(post);
            } else {
                res.status(404).json({ message: "Post not found!" });
            }
        })
});//Get by id ends

//@Route    GET /api/posts/category/:id
//@Desc     Get posts by category id
//@Access   Public
router.get('/category/:cat_id', (req, res) => {
    Post.find({ category:req.params.cat_id, isActive: true })
        .populate('user', ['name'])
        .populate('category', ['name'])
        .then(posts => {
            res.status(200).json(posts);
        })
});//get by category id ends

//@Route    POST /api/posts
//@Desc     Create Post
//@Access   Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }
    
    const newPost = new Post({
        title:req.body.title,
        body:req.body.body,
        description:req.body.description,
        imageUrl:req.body.imageUrl,
        comments:req.body.comments,
        likes:req.body.likes,
        user:req.user.id,
        category:req.body.category,
        isActive:req.body.isActive
    });

    newPost.save()
        .then(post => res.json(post))
        .catch(err => res.json(err));
});//post ends

//@Route    PUT /api/posts/:post_id
//@Desc     Update Post
//@Access   Private
router.put('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    //Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const newPost = new Post({
        _id:req.params.post_id,
        title:req.body.title,
        body:req.body.body,
        description:req.body.description,
        imageUrl:req.body.imageUrl,
        comments:req.body.comments,
        likes:req.body.likes,
        user:req.user.id,
        category:req.body.category,
        isActive:req.body.isActive
    });

    Post.updateOne({ _id:req.params.post_id }, newPost)
        .then(post => {
            res.status(200).json({ message:'Post update successfully.'});
        }).catch(err => res.status(400).json(err));
});//put post ends

//@Route    DELETE /api/posts/:id
//@Desc     Delete post
//@Access   Private
router.delete('/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findByIdAndRemove(req.params.post_id)
        .then(() => {
            res.status(200).json({ message: 'Post deleted successfully!' });
        }).catch(err => res.status(400).json(err));
});//delete ends

//@Route    POST /api/posts/add/comment
//@Desc     Add comment on post
//@Access   Public
router.post('/add/comment/:post_id', (req, res) => {
    console.log(req.params.post_id);
    Post.findOne({ _id:req.params.post_id})
        .then(post => {
            console.log(post);
            const newComment = {
                name: req.body.name,
                comment: req.body.comment
            };
            post.comments.unshift(newComment);
            //Save
            post.save()
                .then(updatedPost => {
                    res.status(200).json(updatedPost);
                }).catch(err => {
                    res.status(400).json(err);
                })
            
        }).catch(error => {
            res.status(404).json({message:'Post not found.'});
        });
});

//@Route    PUT /api/posts/comment/change-status
//@Desc     Change comment status
//@Access   Private
router.put('/comment/update/:post_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const updatedPost = {
        name:req.body.name,
        comment:req.body.comment,
        createdDate:req.body.createdDate,
        isActive:req.body.isActive,
        _id:req.body._id
    }
    Post.findById(req.params.post_id)
        .then(post => {
            //Check if comment exists or not
            if (post.comments.filter(
                  comment => comment._id.toString() === req.body._id
                ).length === 0) {
                return res.status(404).json({ message: 'Comment does not exist' });
            }
            //get element
            post.comments.map(item => {
                if (item._id.toString() == req.body._id) {
                    item.name = req.body.name;
                    item.comment = req.body.comment;
                    item.createdDate = req.body.createdDate;
                    item.isActive = req.body.isActive;
                }
            });

            setTimeout(() => {
                console.log(post.comments);
                post.save()
                .then(result => {
                    res.status(200).json({ message: 'Comment updated successfully!'})
                })
            },100);
            

        }).catch(err => {
            res.status(400).json({ message:'Something went wrong. Please try again.'})
        })
});

//@Route    POST /api/posts/comment/:post_id/:comment_id
//@Desc     Delete comment
//@Access   Private
router.delete('/comment/:post_id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Post.findById(req.params.post_id)
        .then(post => {
            //Check if comment exists or not
            if (
                post.comments.filter(
                  comment => comment._id.toString() === req.params.comment_id
                ).length === 0
              ) {
                return res.status(404).json({ message: 'Comment does not exist' });
              }

              // Get remove index
            const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

            // Splice comment out of array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.status(200).json({ message: 'Comment deleted successfully!'}));
        }).catch(err => {
            res.status(400).json({ message:'Something went wrong. Please try again.'})
        })
});

module.exports = router;