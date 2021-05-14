const express = require('express')
const router = new express.Router();
const Reminder = require('../models/reminder')
const auth = require('../middleware/auth')
const sendrem = require('../Emails/reminder')
const User = require('../models/user')

router.post('/reminders', auth, async (req, res) => {
    const reminder = new Reminder({ ...req.body, owner: req.user._id });

    try {
        const time = new Date(reminder.scheduledTime)
        const now = new Date(Date.now())
        if (time.toString() < now.toString())
            return res.status(400).send({ "error": "Please Enter time greater than now" })
        await reminder.save();
        const user = await User.findById(reminder.owner)
        sendrem(time.getFullYear(), time.getMonth() + 1, time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), user.name, reminder.name, user.email)
        res.status(201).send({ success: "You will get email on scheduled time for this reminder", reminder })
    } catch (error) {
        res.status(400).send();
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



        const time = new Date(req.body.scheduledTime)
        const now = new Date(Date.now())
        console.log(time)
        if (req.body.scheduledTime) {
            if (time.toString() < now.toString())
                return res.status(400).send({ "error": "Please Enter time greater than now" })
        }

        updates.forEach((update) => {
            return reminder[update] = req.body[update]
        })

        await reminder.save()
        console.log("Hello")
        const user = await User.findById(reminder.owner)
        sendrem(time.getFullYear(), time.getMonth() + 1, time.getDate(), time.getHours(), time.getMinutes(), time.getSeconds(), user.name, reminder.name, user.email)
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