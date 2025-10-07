// import express from 'express';
// import protect from '../middleware/authMiddleware.js';
// import Post from '../models/postModel.js';
// import User from '../models/userModel.js';
// import Notification from '../models/notificationModel.js';

// const router = express.Router();

// // A helper to consistently populate a post document after it's saved/updated.
// const fullyPopulatePost = async (post) => {
//     await post.populate('user', 'name username avatarUrl');
//     await post.populate('comments.user', 'name username avatarUrl');
//     return post;
// };

// // @route   GET /api/posts/feed
// // @desc    Get posts for the current user's feed
// router.get('/feed', protect, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.user.id).lean();
//         if (!currentUser) {
//             return res.status(401).json({ message: "User not found." });
//         }
        
//         const userIdsForFeed = [currentUser._id, ...(currentUser.following || [])];

//         // 1. Fetch plain post objects
//         const postsFromDb = await Post.find({ user: { $in: userIdsForFeed } })
//             .sort({ createdAt: -1 })
//             .limit(50)
//             .lean();

//         if (!postsFromDb || postsFromDb.length === 0) {
//             return res.json([]);
//         }

//         // 2. Gather all unique user IDs from posts and comments
//         const userIds = new Set();
//         postsFromDb.forEach(post => {
//             if (post.user) userIds.add(post.user.toString());
//             (post.comments || []).forEach(comment => {
//                 if (comment.user) userIds.add(comment.user.toString());
//             });
//         });

//         // 3. Fetch all required users in one go
//         const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name username avatarUrl').lean();

//         // 4. Create a user map for quick lookup
//         const userMap = new Map(users.map(user => [user._id.toString(), {
//             id: user._id.toString(),
//             name: user.name,
//             username: user.username,
//             avatarUrl: user.avatarUrl
//         }]));

//         // 5. Manually populate and filter posts to create the final response
//         const populatedPosts = postsFromDb.map(post => {
//             const author = userMap.get(post.user.toString());
//             if (!author) {
//                 return null; // Filter out post if author is deleted/not found
//             }

//             const populatedComments = (post.comments || []).map(comment => {
//                 const commentAuthor = userMap.get(comment.user.toString());
//                 if (!commentAuthor) {
//                     return null; // Filter out comment if author is deleted/not found
//                 }
//                 return {
//                     id: comment._id.toString(),
//                     user: commentAuthor,
//                     text: comment.text,
//                     timestamp: comment.createdAt ? comment.createdAt.toISOString() : new Date(0).toISOString()
//                 };
//             }).filter(Boolean);

//             // Replicate the structure expected by the frontend
//             return {
//                 id: post._id.toString(),
//                 user: author,
//                 content: post.content,
//                 imageUrl: post.imageUrl,
//                 timestamp: post.createdAt ? post.createdAt.toISOString() : new Date(0).toISOString(),
//                 likes: (post.likes || []).map(id => id.toString()),
//                 comments: populatedComments
//             };
//         }).filter(Boolean);

//         res.json(populatedPosts);

//     } catch (error) {
//         console.error("Error in /api/posts/feed route:", error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   GET /api/posts
// // @desc    Get all posts for discover page, sorted by newest
// router.get('/', protect, async (req, res) => {
//     try {
//         const postsFromDb = await Post.find({})
//             .sort({ createdAt: -1 })
//             .lean();

//         if (!postsFromDb || postsFromDb.length === 0) {
//             return res.json([]);
//         }

//         const userIds = new Set();
//         postsFromDb.forEach(post => {
//             if (post.user) userIds.add(post.user.toString());
//             (post.comments || []).forEach(comment => {
//                 if (comment.user) userIds.add(comment.user.toString());
//             });
//         });

//         const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('name username avatarUrl').lean();

//         const userMap = new Map(users.map(user => [user._id.toString(), {
//             id: user._id.toString(),
//             name: user.name,
//             username: user.username,
//             avatarUrl: user.avatarUrl
//         }]));

//         const populatedPosts = postsFromDb.map(post => {
//             const author = userMap.get(post.user.toString());
//             if (!author) return null;

//             const populatedComments = (post.comments || []).map(comment => {
//                 const commentAuthor = userMap.get(comment.user.toString());
//                 if (!commentAuthor) return null;
//                 return {
//                     id: comment._id.toString(),
//                     user: commentAuthor,
//                     text: comment.text,
//                     timestamp: comment.createdAt ? comment.createdAt.toISOString() : new Date(0).toISOString()
//                 };
//             }).filter(Boolean);

//             return {
//                 id: post._id.toString(),
//                 user: author,
//                 content: post.content,
//                 imageUrl: post.imageUrl,
//                 timestamp: post.createdAt ? post.createdAt.toISOString() : new Date(0).toISOString(),
//                 likes: (post.likes || []).map(id => id.toString()),
//                 comments: populatedComments
//             };
//         }).filter(Boolean);

//         res.json(populatedPosts);
        
//     } catch (error) {
//         console.error("Discover posts route error:", error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   GET /api/posts/:id
// // @desc    Get a single post by ID
// router.get('/:id', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         post = await fullyPopulatePost(post);
//         res.json(post);
//     } catch (error) {
//         console.error('Get post by ID error:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   POST /api/posts
// // @desc    Create a new post
// router.post('/', protect, async (req, res) => {
//     const { content, imageUrl } = req.body;
//     if (!content && !imageUrl) {
//         return res.status(400).json({ message: 'Post must have content or an image' });
//     }
//     try {
//         const post = new Post({
//             content: content || '',
//             imageUrl: imageUrl || null,
//             user: req.user.id,
//         });

//         let createdPost = await post.save();
//         createdPost = await createdPost.populate({ 
//             path: 'user', 
//             select: 'name username avatarUrl' 
//         });
        
//         req.io.emit('newPost', createdPost);
//         res.status(201).json(createdPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   DELETE /api/posts/:id
// // @desc    Delete a post
// router.delete('/:id', protect, async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         if (post.user.toString() !== req.user.id) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }
//         await post.deleteOne();
//         req.io.emit('postDeleted', req.params.id);
//         res.json({ message: 'Post removed' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   PUT /api/posts/:id/like
// // @desc    Like or unlike a post
// router.put('/:id/like', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const isLiked = post.likes.some(like => like.equals(req.user.id));
//         if (isLiked) {
//             post.likes = post.likes.filter(like => !like.equals(req.user.id));
//         } else {
//             post.likes.push(req.user.id);
//             if (post.user.toString() !== req.user.id) {
//                 const existingNotification = await Notification.findOne({
//                    recipient: post.user,
//                    sender: req.user.id,
//                    type: 'like',
//                    postId: post._id,
//                 });
//                 if (!existingNotification) {
//                     const notification = new Notification({
//                         recipient: post.user,
//                         sender: req.user.id,
//                         type: 'like',
//                         postId: post._id,
//                     });
//                     await notification.save();
//                     const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
//                     const recipientSocket = req.onlineUsers.get(post.user.toString());
//                     if (recipientSocket) {
//                         req.io.to(recipientSocket).emit('newNotification', populatedNotification);
//                     }
//                 }
//             }
//         }

//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   POST /api/posts/:id/comments
// // @desc    Comment on a post
// router.post('/:id/comments', protect, async (req, res) => {
//     const { text } = req.body;
//      if (!text) {
//         return res.status(400).json({ message: 'Comment text is required' });
//     }
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const newComment = { text, user: req.user.id };
//         post.comments.push(newComment);
        
//         if (post.user.toString() !== req.user.id) {
//              const notification = new Notification({
//                 recipient: post.user,
//                 sender: req.user.id,
//                 type: 'comment',
//                 postId: post._id,
//             });
//             await notification.save();
//             const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
//             const recipientSocket = req.onlineUsers.get(post.user.toString());
//             if (recipientSocket) {
//                 req.io.to(recipientSocket).emit('newNotification', populatedNotification);
//             }
//         }
        
//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.status(201).json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   DELETE /api/posts/:id/comments/:comment_id
// // @desc    Delete a comment
// router.delete('/:id/comments/:comment_id', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
//         if (!comment) {
//             return res.status(404).json({ message: 'Comment does not exist' });
//         }

//         if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }

//         post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);
        
//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.json(updatedPost);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// export default router;






















// import express from 'express';
// import mongoose from 'mongoose';
// import protect from '../middleware/authMiddleware.js';
// import Post from '../models/postModel.js';
// import User from '../models/userModel.js';
// import Notification from '../models/notificationModel.js';

// const router = express.Router();

// // A helper to consistently populate a post document after it's saved/updated.
// const fullyPopulatePost = async (post) => {
//     await post.populate('user', 'name username avatarUrl');
//     await post.populate('comments.user', 'name username avatarUrl');
//     return post;
// };

// // A helper to format a populated Mongoose post document into the shape the frontend expects.
// const formatPostForFrontend = (post) => {
//     if (!post || !post.user) {
//         // This can happen if the user who created the post has been deleted.
//         // We filter these out to avoid errors on the frontend.
//         return null;
//     }

//     // post.toJSON() applies the transformations from the schema (e.g., adding 'id', 'timestamp')
//     const postObject = post.toJSON();

//     // The frontend expects an 'author' field, not a 'user' field.
//     postObject.author = post.user.toJSON();
//     delete postObject.user;

//     // We also need to process the comments to ensure they have an 'author' field.
//     postObject.comments = post.comments
//         .map(comment => {
//             // Filter out comments where the author might have been deleted.
//             if (!comment.user) return null;

//             const commentObject = comment.toJSON();
//             commentObject.author = comment.user.toJSON();
//             delete commentObject.user;
//             return commentObject;
//         })
//         .filter(Boolean); // Removes any null comments from the array.

//     return postObject;
// };


// // @route   GET /api/posts/feed
// // @desc    Get posts for the current user's feed
// router.get('/feed', protect, async (req, res) => {
//     try {
//         const currentUser = await User.findById(req.user.id);
//         if (!currentUser) {
//             return res.status(401).json({ message: "User not found." });
//         }
        
//         const userIdsForFeed = [currentUser._id, ...(currentUser.following || [])];

//         const postsFromDb = await Post.find({ user: { $in: userIdsForFeed } })
//             .sort({ createdAt: -1 })
//             .limit(50)
//             .populate('user') // Populate the user (author) of the post
//             .populate('comments.user'); // Populate the user (author) of each comment

//         // Format each post for the frontend and filter out any invalid ones.
//         const formattedPosts = postsFromDb
//             .map(formatPostForFrontend)
//             .filter(Boolean);

//         res.json(formattedPosts);

//     } catch (error) {
//         console.error("Error in /api/posts/feed route:", error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   GET /api/posts
// // @desc    Get all posts for discover page, sorted by newest
// router.get('/', protect, async (req, res) => {
//     try {
//         const postsFromDb = await Post.find({})
//             .sort({ createdAt: -1 })
//             .populate('user')
//             .populate('comments.user');
        
//         const formattedPosts = postsFromDb
//             .map(formatPostForFrontend)
//             .filter(Boolean);

//         res.json(formattedPosts);
        
//     } catch (error) {
//         console.error("Discover posts route error:", error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   GET /api/posts/:id
// // @desc    Get a single post by ID
// router.get('/:id', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         post = await fullyPopulatePost(post);
//         res.json(post);
//     } catch (error) {
//         console.error('Get post by ID error:', error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   POST /api/posts
// // @desc    Create a new post
// router.post('/', protect, async (req, res) => {
//     const { content, imageUrl } = req.body;
//     if (!content && !imageUrl) {
//         return res.status(400).json({ message: 'Post must have content or an image' });
//     }
//     try {
//         const post = new Post({
//             content: content || '',
//             imageUrl: imageUrl || null,
//             user: req.user.id,
//         });

//         let createdPost = await post.save();
//         createdPost = await fullyPopulatePost(createdPost);
        
//         req.io.emit('newPost', createdPost);
//         res.status(201).json(createdPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   DELETE /api/posts/:id
// // @desc    Delete a post
// router.delete('/:id', protect, async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }
//         if (post.user.toString() !== req.user.id) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }
//         await post.deleteOne();
//         req.io.emit('postDeleted', req.params.id);
//         res.json({ message: 'Post removed' });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });


// // @route   PUT /api/posts/:id/like
// // @desc    Like or unlike a post
// router.put('/:id/like', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const isLiked = post.likes.some(like => like.equals(req.user.id));
//         if (isLiked) {
//             post.likes = post.likes.filter(like => !like.equals(req.user.id));
//         } else {
//             post.likes.push(req.user.id);
//             if (post.user.toString() !== req.user.id) {
//                 const existingNotification = await Notification.findOne({
//                    recipient: post.user,
//                    sender: req.user.id,
//                    type: 'like',
//                    postId: post._id,
//                 });
//                 if (!existingNotification) {
//                     const notification = new Notification({
//                         recipient: post.user,
//                         sender: req.user.id,
//                         type: 'like',
//                         postId: post._id,
//                     });
//                     await notification.save();
//                     const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
//                     const recipientSocket = req.onlineUsers.get(post.user.toString());
//                     if (recipientSocket) {
//                         req.io.to(recipientSocket).emit('newNotification', populatedNotification);
//                     }
//                 }
//             }
//         }

//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   POST /api/posts/:id/comments
// // @desc    Comment on a post
// router.post('/:id/comments', protect, async (req, res) => {
//     const { text } = req.body;
//      if (!text) {
//         return res.status(400).json({ message: 'Comment text is required' });
//     }
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const newComment = { text, user: req.user.id };
//         post.comments.push(newComment);
        
//         if (post.user.toString() !== req.user.id) {
//              const notification = new Notification({
//                 recipient: post.user,
//                 sender: req.user.id,
//                 type: 'comment',
//                 postId: post._id,
//             });
//             await notification.save();
//             const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
//             const recipientSocket = req.onlineUsers.get(post.user.toString());
//             if (recipientSocket) {
//                 req.io.to(recipientSocket).emit('newNotification', populatedNotification);
//             }
//         }
        
//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.status(201).json(updatedPost);
//     } catch (error) {
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// // @route   DELETE /api/posts/:id/comments/:comment_id
// // @desc    Delete a comment
// router.delete('/:id/comments/:comment_id', protect, async (req, res) => {
//     try {
//         let post = await Post.findById(req.params.id);
//         if (!post) {
//             return res.status(404).json({ message: 'Post not found' });
//         }

//         const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
//         if (!comment) {
//             return res.status(404).json({ message: 'Comment does not exist' });
//         }

//         if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
//             return res.status(401).json({ message: 'User not authorized' });
//         }

//         post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);
        
//         let updatedPost = await post.save();
//         updatedPost = await fullyPopulatePost(updatedPost);
//         req.io.emit('postUpdated', updatedPost);
//         res.json(updatedPost);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

// export default router;








import express from 'express';
import mongoose from 'mongoose';
import protect from '../middleware/authMiddleware.js';
import Post from '../models/postModel.js';
import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

const router = express.Router();

// A helper to consistently populate a post document after it's saved/updated.
const fullyPopulatePost = async (post) => {
    await post.populate('user', 'name username avatarUrl');
    await post.populate('comments.user', 'name username avatarUrl');
    return post;
};


// @route   GET /api/posts/feed
// @desc    Get posts for the current user's feed
router.get('/feed', protect, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(401).json({ message: "User not found." });
        }
        
        const userIdsForFeed = [currentUser._id, ...(currentUser.following || [])];

        const postsFromDb = await Post.find({ user: { $in: userIdsForFeed } })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user')
            .populate('comments.user');

        // Map and format the posts safely for the frontend.
        const formattedPosts = postsFromDb
            .map(post => {
                // If a post's author has been deleted, populate returns null. Filter these out.
                if (!post || !post.user) {
                    return null;
                }
                
                // .toJSON() recursively transforms the document and all populated fields.
                const postObject = post.toJSON();
                
                // The frontend expects an 'author' field. Rename 'user' to 'author'.
                postObject.author = postObject.user;
                delete postObject.user;

                // Do the same for each comment.
                postObject.comments = postObject.comments.map(comment => {
                    if (!comment.user) return null; // Filter out comments from deleted users
                    comment.author = comment.user;
                    delete comment.user;
                    return comment;
                }).filter(Boolean); // Remove any null comments

                return postObject;
            })
            .filter(Boolean); // Remove any null posts

        res.json(formattedPosts);

    } catch (error) {
        console.error("Error in /api/posts/feed route:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   GET /api/posts
// @desc    Get all posts for discover page, sorted by newest
router.get('/', protect, async (req, res) => {
    try {
        const postsFromDb = await Post.find({})
            .sort({ createdAt: -1 })
            .populate('user')
            .populate('comments.user');
        
        // Map and format the posts safely for the frontend.
        const formattedPosts = postsFromDb
            .map(post => {
                if (!post || !post.user) {
                    return null;
                }
                const postObject = post.toJSON();
                postObject.author = postObject.user;
                delete postObject.user;
                postObject.comments = postObject.comments.map(comment => {
                    if (!comment.user) return null;
                    comment.author = comment.user;
                    delete comment.user;
                    return comment;
                }).filter(Boolean);
                return postObject;
            })
            .filter(Boolean);

        res.json(formattedPosts);
        
    } catch (error) {
        console.error("Discover posts route error:", error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
router.get('/:id', protect, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        post = await fullyPopulatePost(post);
        res.json(post);
    } catch (error) {
        console.error('Get post by ID error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   POST /api/posts
// @desc    Create a new post
router.post('/', protect, async (req, res) => {
    const { content, imageUrl } = req.body;
    if (!content && !imageUrl) {
        return res.status(400).json({ message: 'Post must have content or an image' });
    }
    try {
        const post = new Post({
            content: content || '',
            imageUrl: imageUrl || null,
            user: req.user.id,
        });

        let createdPost = await post.save();
        createdPost = await fullyPopulatePost(createdPost);
        
        req.io.emit('newPost', createdPost);
        res.status(201).json(createdPost);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await post.deleteOne();
        req.io.emit('postDeleted', req.params.id);
        res.json({ message: 'Post removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
router.put('/:id/like', protect, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const isLiked = post.likes.some(like => like.equals(req.user.id));
        if (isLiked) {
            post.likes = post.likes.filter(like => !like.equals(req.user.id));
        } else {
            post.likes.push(req.user.id);
            if (post.user.toString() !== req.user.id) {
                const existingNotification = await Notification.findOne({
                   recipient: post.user,
                   sender: req.user.id,
                   type: 'like',
                   postId: post._id,
                });
                if (!existingNotification) {
                    const notification = new Notification({
                        recipient: post.user,
                        sender: req.user.id,
                        type: 'like',
                        postId: post._id,
                    });
                    await notification.save();
                    const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
                    const recipientSocket = req.onlineUsers.get(post.user.toString());
                    if (recipientSocket) {
                        req.io.to(recipientSocket).emit('newNotification', populatedNotification);
                    }
                }
            }
        }

        let updatedPost = await post.save();
        updatedPost = await fullyPopulatePost(updatedPost);
        req.io.emit('postUpdated', updatedPost);
        res.json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/posts/:id/comments
// @desc    Comment on a post
router.post('/:id/comments', protect, async (req, res) => {
    const { text } = req.body;
     if (!text) {
        return res.status(400).json({ message: 'Comment text is required' });
    }
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = { text, user: req.user.id };
        post.comments.push(newComment);
        
        if (post.user.toString() !== req.user.id) {
             const notification = new Notification({
                recipient: post.user,
                sender: req.user.id,
                type: 'comment',
                postId: post._id,
            });
            await notification.save();
            const populatedNotification = await notification.populate('sender', 'name username avatarUrl');
            const recipientSocket = req.onlineUsers.get(post.user.toString());
            if (recipientSocket) {
                req.io.to(recipientSocket).emit('newNotification', populatedNotification);
            }
        }
        
        let updatedPost = await post.save();
        updatedPost = await fullyPopulatePost(updatedPost);
        req.io.emit('postUpdated', updatedPost);
        res.status(201).json(updatedPost);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/posts/:id/comments/:comment_id
// @desc    Delete a comment
router.delete('/:id/comments/:comment_id', protect, async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = post.comments.find(c => c._id.toString() === req.params.comment_id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment does not exist' });
        }

        if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        post.comments = post.comments.filter(c => c._id.toString() !== req.params.comment_id);
        
        let updatedPost = await post.save();
        updatedPost = await fullyPopulatePost(updatedPost);
        req.io.emit('postUpdated', updatedPost);
        res.json(updatedPost);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;
