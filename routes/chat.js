const express = require('express');
const router = express.Router();
const Chat = require('../models/chat');
const { requireLogin } = require('../middleware');

router.post('/start', requireLogin, async (req, res) => {
    const { participantId } = req.body;

    try {
        let chat = await Chat.findOne({
            participants: { $all: [req.user._id, participantId] },
        });

        if (!chat) {
            chat = new Chat({
                participants: [req.user._id, participantId],
                messages: [],
            });
            await chat.save();
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error starting chat.');
    }
});

router.post('/:chatId/messages', requireLogin, async (req, res) => {
    const { chatId } = req.params;
    const { body } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).send('Chat not found.');

        chat.messages.push({
            sender: req.user._id,
            body,
        });
        await chat.save();

        res.status(200).json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error sending message.');
    }
});

router.get('/:chatId', requireLogin, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.chatId).populate('messages.sender');
        if (!chat) return res.status(404).send('Chat not found.');

        res.status(200).json(chat);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching chat.');
    }
});

module.exports = router;