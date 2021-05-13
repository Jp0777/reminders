const express = require('express')
const router = new express.Router();
const Reminder = require('../models/reminder')
const auth = require('../middleware/auth')
const sendrem = require('../Emails/hello')
const User = require('../models/user')

router.post('/reminders', auth, async (req, res) => {
    const reminder = new Reminder({ ...req.body, owner: req.user._id });

    try {
        await reminder.save();
        const date = reminder.scheduledDate;
        const time = reminder.scheduledTime.split(':');
        const user = await User.findById(reminder.owner)
        // console.log(user.email)
        sendrem(date, user.name, reminder.name, user.email, time[0], time[1], time[2])
        res.status(201).send(reminder)
    } catch (e) {
        res.status(400).send(e);
    }

})



router.get('/reminders', auth, async (req, res) => {
    try {
        const reminder = await Reminder.find({
            owner: req.user._id
        })


        res.send(reminder)
    } catch (e) {
        res.status(500).send()
    }
})




router.patch('/reminders/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const validUpdates = ['description', 'name', 'scheduledTime', 'scheduledDate']
    const isValid = updates.every((update) => {
        return validUpdates.includes(update)
    })

    if (!isValid)
        return res.status(400).send({ "error": "Not a valid field to be updated" })

    try {
        const reminder = await Reminder.findOne({ _id: req.params.id, owner: req.user._id })

        if (!reminder)
            return res.status(404).send()

        updates.forEach((update) => {
            return reminder[update] = req.body[update]
        })

        await reminder.save()
        const date = reminder.scheduledDate;
        const time = reminder.scheduledTime.split(':');
        const user = await User.findById(reminder.owner)
        sendrem(date, user.name, reminder.name, user.email, time[0], time[1], time[2])
        res.send({ 'success': 'Succesfully updated Your reminder', reminder })
    } catch (e) {
        res.status(400).send(e)
    }
})


router.delete('/reminders/:id', auth, async (req, res) => {

    try {
        const deleted = await Reminder.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!deleted)
            return res.status(404).send()
        res.send({ 'success': 'Succesfully deleted Your reminder', 'reminder': deleted })
    } catch (e) {
        res.status(400).send(e)
    }
})




module.exports = router;