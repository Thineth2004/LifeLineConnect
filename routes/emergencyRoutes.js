const express = require('express');
const router = express.Router();

const { getDatabase } = require('../config/mongodb');


// Get all emergency appeals
router.get('/', async (req, res) => {
    try {
        const db = getDatabase();

        const appeals = await db.collection('emergency_appeals')
            .find({})
            .sort({ created_at: -1 })
            .toArray();

        res.json(appeals);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to load emergency appeals'
        });
    }
});


// Search appeals by blood group
router.get('/blood-group/:bloodGroup', async (req, res) => {
    try {
        const db = getDatabase();

        const appeals = await db.collection('emergency_appeals')
            .find({
                blood_group: req.params.bloodGroup
            })
            .sort({ created_at: -1 })
            .toArray();

        res.json(appeals);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to search emergency appeals'
        });
    }
});


// Search appeals by keyword
router.get('/search', async (req, res) => {
    try {
        const db = getDatabase();

        const keyword = req.query.keyword;

        if (!keyword) {
            return res.status(400).json({
                error: 'Keyword is required'
            });
        }

        const appeals = await db.collection('emergency_appeals')
            .find({
                $or: [
                    {
                        title: {
                            $regex: keyword,
                            $options: 'i'
                        }
                    },
                    {
                        message: {
                            $regex: keyword,
                            $options: 'i'
                        }
                    }
                ]
            })
            .sort({ created_at: -1 })
            .toArray();

        res.json(appeals);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to search emergency appeals'
        });
    }
});


// Get one emergency appeal
router.get('/:id', async (req, res) => {
    try {
        const db = getDatabase();

        const appeal = await db.collection('emergency_appeals')
            .findOne({
                appeal_id: req.params.id
            });

        if (!appeal) {
            return res.status(404).json({
                error: 'Emergency appeal not found'
            });
        }

        res.json(appeal);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to load emergency appeal'
        });
    }
});


// Add a new emergency appeal
router.post('/', async (req, res) => {
    try {
        const db = getDatabase();

        const appeal = {
            appeal_id: req.body.appeal_id,
            title: req.body.title,
            blood_group: req.body.blood_group,
            hospital_id: req.body.hospital_id,
            hospital_name: req.body.hospital_name,
            urgency: req.body.urgency,
            required_units: Number(req.body.required_units),
            current_units: Number(req.body.current_units || 0),
            message: req.body.message,
            status: req.body.status || 'Active',
            created_at: new Date(),
            discussion: []
        };

        await db.collection('emergency_appeals').insertOne(appeal);

        res.status(201).json({
            message: 'Emergency appeal created successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to create emergency appeal'
        });
    }
});


// Add discussion message
router.post('/:id/discussion', async (req, res) => {
    try {
        const db = getDatabase();

        const message = {
            user_id: req.body.user_id,
            message: req.body.message,
            created_at: new Date()
        };

        const result = await db.collection('emergency_appeals')
            .updateOne(
                {
                    appeal_id: req.params.id
                },
                {
                    $push: {
                        discussion: message
                    }
                }
            );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                error: 'Emergency appeal not found'
            });
        }

        res.status(201).json({
            message: 'Discussion message added successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to add discussion message'
        });
    }
});


module.exports = router;