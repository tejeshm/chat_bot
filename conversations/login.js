var auth = require('../services/auth');
var apicalls = require('../services/apicalls');
let commonUtils = require('../services/commonFunctions');

module.exports = function(bp, event) {

    auth.isLoggedin(event.user).then((result) => {
            if(!result) {
                bp.convo.start(event, convo => {
                    convo.threads["default"].addMessage("Hello! Lets log into your account first")
                    convo.threads["default"].addQuestion("Can you tell me your email id?", [
                        {
                            pattern: /([A-Za-z0-9_\-\.]){1,64}@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,})/,
                            callback: (response) => { // Using the response event
                                convo.set("email", response.text);
                                convo.say("Email is " + response.text);
                                sendOtp(event);
                            }
                        },
                        commonUtils.conversationStop(convo),
                        {
                            default: true,
                            callback: () =>
                            {
                                convo.say('Hrm.. Im expecting email!');
                                convo.repeat();
                            }
                        }
                    ]);

                    convo.createThread('otp');
                    convo.threads['otp'].addQuestion('Please enter the OTP', [{
                        pattern: /^[0-9]{6}$/,
                        callback: (response) => { // Using the response event
                            convo.set("otp", response.text);
                            login(event);
                        }
                    },
                        {
                            default:true,
                            callback: () =>{
                                convo.say('Hrm.. Im expecting a number!');
                                convo.repeat();
                            }
                        }
                    ])

                })
            }
            else
            {
                event.reply('#introOptions');
            }
        });




    function sendOtp (event) {

        if (bp.convo.find(event)) {
            var convo = bp.convo.find(event);
            var data = {
                emailId: convo.get('email'),
                existing: 1,
                platformType: 'PAYUNOWAPP'
            }
            let onSuccess = () => {
                convo.say('An, OTP has been sent to your mobile/email.');
                convo.switchTo('otp');
            }
            let onFailure = (msg) => {
                convo.say("Sorry the account doesn't exists");
                //convo.switchTo('default');
                convo.stop();
            }
            apicalls.sendOtp(data, onSuccess, onFailure);

        } else {
            event.reply('#dialogFlow', {
                // You can pass data to the UMM bloc!
                reason: event.nlp.fulfillment.speech
            })
        }

    }

    function login(event) {
        if (bp.convo.find(event)) {
            var convo = bp.convo.find(event);
            var data = {
                emailId:convo.get('email'),
                isLogin:true,
                otp:convo.get('otp'),
                platformType:'PAYUNOWAPP'
            }
            function onSuccess(authToken) {
                convo.say('Congratulation, your are now logged in.');
                convo.say('#introOptions');
                auth.login(event.user, authToken).then(() => {
                    getMerchantDetails(event);
                })
                convo.stop();
            }
            function onFailure(msg) {
                convo.say('Sorry wrong credentials');
                convo.switchTo('default');
                convo.stop();
            }
            apicalls.login(data, onSuccess, onFailure);

        } else {
            event.reply('#dialogFlow', {
                // You can pass data to the UMM bloc!
                reason: event.nlp.fulfillment.speech
            })
        }

    }

    function getMerchantDetails(event) {
        function onSuccess(data) {
            //save in db
            //console.log(data);
            bp.db.kvs.set('merchantData', data.result);
        }
        function onFailure(msg) {
            console.log('could not get Merchant details');
        }
        apicalls.getCompleteMerchantDetails(event.user, onSuccess, onFailure);
    }

}
