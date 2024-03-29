const SibApiV3Sdk = require('sib-api-v3-sdk');

const sendRemider = (year, month, date, hours, minutes, seconds, userName, reminderName, email) => {
    if (month < 10)
        month = '0' + month
    if (date < 10)
        date = '0' + date
    if (hours < 10)
        hours = '0' + hours
    if (minutes < 10)
        minutes = '0' + minutes
    if (seconds < 10)
        seconds = '0' + seconds

    let defaultClient = SibApiV3Sdk.ApiClient.instance;

    let apiKey = defaultClient.authentications['api-key'];
    apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

    let apiInstance = new SibApiV3Sdk.ContactsApi();

    let opts = {
        'limit': 50,
        'offset': 0,

    };
    let identifier;

    const update = (emailUpdate) => {
        console.log("" + year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "+05:30")
        apiInstance.getContacts(opts).then(function (data) {
            identifier = data["contacts"][0]["email"]

            apiInstance = new SibApiV3Sdk.ContactsApi();
            for (let i = 0; i < data["contacts"].length; i++) {
                let identifier = data["contacts"][i].email;
                if (identifier !== 'pateljayen07@gmail.com' && identifier !== emailUpdate) {
                    apiInstance.deleteContact(identifier).then(function () {
                        console.log('API called successfully.');
                    }, function (error) {
                        console.error(error);
                    });
                }
            }
            for (let i = 0; i < data["contacts"].length; i++) {
                if (data["contacts"][i].email === emailUpdate)
                    return;
            }
            apiInstance = new SibApiV3Sdk.ContactsApi();
            let createContact = new SibApiV3Sdk.CreateContact();

            createContact.email = emailUpdate;
            createContact.listIds = [2]

            apiInstance.createContact(createContact).then(function (data) {
                console.log('Create Contact API called successfully. Returned data: ' + JSON.stringify(data));
            }, function (error) {
                console.error(error);
            });

        }, function (error) {
            console.error(error);
        });
    }



    update(email)


    apiInstance = new SibApiV3Sdk.EmailCampaignsApi();

    let emailCampaigns = new SibApiV3Sdk.UpdateEmailCampaign();

    emailCampaigns = {
        tag: 'myTag',
        sender: { name: 'Jayen Patel', email: 'pateljayen07@gmail.com' }, name: 'My First Campaign',
        scheduledAt: new Date("" + year + "-" + month + "-" + date + "T" + hours + ":" + minutes + ":" + seconds + "+05:30"),
        subject: ' My {{params.subject}}',
        replyTo: 'replyto@domain.com',
        toField: '{{contact.FIRSTNAME}} {{contact.LASTNAME}}',
        recipients: { listIds: [2] },
        htmlContent: `<html>Hello ${userName} this is a reminder for ${reminderName} at your scheduled time.Be relaxed<html>`,
        inlineImageActivation: false,
        mirrorActive: false,
        recurring: false,
        type: 'classic',
        header: 'If you are not able to see this mail, click {here}',
        footer: 'If you wish to unsubscribe from our newsletter, click {here}',
        utmCampaign: 'My utm campaign value',
        params: { 'PARAMETER': 'My param value', 'ADDRESS': 'Seattle, WA', 'SUBJECT': 'New Subject' }
    }

    apiInstance.createEmailCampaign(emailCampaigns).then(function (data) {
        console.log('Create Campaign API called successfully. Returned data: ' + JSON.stringify(data));
        // let campaignId = data.id;
        // setTimeout(() => {
        //     let apiInstance = new SibApiV3Sdk.EmailCampaignsApi();
        //     let emailTo = new SibApiV3Sdk.SendTestEmail();

        //     emailTo = {
        //         "emailTo": ["pateljayen07@gmail.com"]
        //     };
        //     apiInstance.sendTestEmail(campaignId, emailTo).then(function () {
        //         console.log('Send API called successfully.');
        //     }, function (error) {
        //         console.error(error);
        //     });
        // }, 3000)
    }, function (error) {
        console.error(error);
    });
}

module.exports = sendRemider





