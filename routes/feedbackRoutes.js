const express = require('express');
const router = express.Router();

const { getDatabase } = require('../config/mongodb');

// Get all feedback
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();

        const feedback = await db.collection('donor_feedback')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        res.json(feedback);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to load donor feedback'
        });
    }
});


// Get feedback for a specific camp
router.get('/camp/:campId', async (req, res) => {
    try {
        const db = getDatabase();

        const feedback = await db.collection('donor_feedback')
            .find({
                camp_id: req.params.campId
            })
            .sort({ created_at: -1 })
            .toArray();

        res.json(feedback);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to load camp feedback'
        });
    }
});


// Get feedback for a specific venue
router.get('/venue/:venueId', async (req, res) => {
    try {
        const db = getDatabase();

        const feedback = await db.collection('donor_feedback')
            .find({
                venue_id: req.params.venueId
            })
            .sort({ created_at: -1 })
            .toArray();

        res.json(feedback);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to load venue feedback'
        });
    }
});


// Get top-rated camps
router.get('/top-rated', async (req, res) => {
    try {
        const db = getDatabase();

        const topRated = await db.collection('donor_feedback').aggregate([
            {
                $group: {
                    _id: '$camp_id',
                    average_rating: { $avg: '$rating' },
                    total_reviews: { $sum: 1 }
                }
            },
            {
                $sort: {
                    average_rating: -1
                }
            }
        ]).toArray();

        res.json(topRated);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to load top-rated camps'
        });
    }
});


// Add new feedback
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();

        const feedback = {
            feedback_id: req.body.feedback_id,
            donor_id: req.body.donor_id,
            camp_id: req.body.camp_id,
            venue_id: req.body.venue_id,
            rating: Number(req.body.rating),
            title: req.body.title,
            comment: req.body.comment,
            feedback_type: req.body.feedback_type,
            created_at: new Date()
        };

        await db.collection('donor_feedback').insertOne(feedback);

        res.status(201).json({
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Failed to submit feedback'
        });
    }
});


module.exports = router;