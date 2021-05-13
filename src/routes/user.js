const express = require('express')
const router = new express.Router();
const User = require('../models/user')
const Reminder = require('../models/reminder')
const auth = require('../middleware/auth')
const sendEmail = require('../Emails/sendinblue')


router.post('/users', async (req, res) => {
    const user = new User(req.body);

    try {

        await user.save();
        sendEmail(user.email, user.name, `Welcome ${user.name},You have succesfully signed up`)
        res.status(201).send({ 'success': 'Succesfully signed up,Check your gmail inbox!', user })
    } catch (e) {
        res.status(400).send(e);
    }


})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        const token = await user.genrateAuthToken();

        res.send({ user, token })
    } catch (e) {
        res.status(404).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        })

        await req.user.save()
        res.send({ 'success': 'Succesfully logged out' })
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutall', auth, async (req, res) => {

    try {
        req.user.tokens = [];
        await req.user.save()
        res.send({ 'success': 'Succesfully logged out from all devices', user: req.user })
    } catch (e) {
        res.status(500).send(e)
    }
})


router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const validUpdates = ['name', 'email', 'password', 'age'];
    const isValid = updates.every((update) => {
        return validUpdates.includes(update)
    })
    if (!isValid)
        return res.status(400).send({ "error": "Not a valid field to be updated" })
    try {
        updates.forEach((update) => {
            return req.user[update] = req.body[update]
        })

        await req.user.save()

        res.send({ 'success': 'Succesfully updated your information', user: req.user })
    } catch (e) {
        res.status(400).send(e)
    }
})



router.delete('/users/me', auth, async (req, res) => {
    try {

        const deletedReminders = await Reminder.deleteMany({ 'owner': req.user._id })
        const deleted = await User.findOneAndDelete({ _id: req.user._id });
        sendEmail(deleted.email, deleted.name, `Hello ${deleted.name},You have succesfully deleted your account`)
        res.send({ 'success': 'Succesfully deleted your account,Check your gmail inbox!', user: deleted })
    } catch (e) {
        res.status(400).send(e)
    }

})



module.exports = router;