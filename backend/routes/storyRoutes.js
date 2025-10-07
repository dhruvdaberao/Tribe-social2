import express from 'express';
import protect from '../middleware/authMiddleware.js';
import Story from '../models/storyModel.js';
import User from '../models/userModel.js';

const router = express.Router();

// @route   POST /api/stories
// @desc    Create a new story
router.post('/', protect, async (req, res) => {
    const { imageUrl, text, textPosition, imagePosition } = req.body;

    if (!imageUrl && !text) {
        return res.status(400).json({ message: 'Story must have an image or text.' });
    }

    try {
        const story = new Story({
            user: req.user.id,
            imageUrl,
            text,
            textPosition,
            imagePosition,
        });

        const createdStory = await story.save();
        res.status(201).json(createdStory);
    } catch (error) {
        console.error('Error creating story:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/stories/my-stories
// @desc    Get current user's active stories
router.get('/my-stories', protect, async (req, res) => {
    try {
        const stories = await Story.find({ user: req.user.id }).sort({ createdAt: 'asc' });
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// @route   DELETE /api/stories/:id
// @desc    Delete a story
router.delete('/:id', protect, async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        if (story.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized to delete this story' });
        }

        await story.deleteOne();
        res.json({ message: 'Story deleted' });
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
