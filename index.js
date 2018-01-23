var axios = require('axios');
var login = require('./services/auth');

module.exports = function(bp) {

    bp.hear(/hello/i, (event, next) => {
        bp.convo.start(event, convo => {
            convo.threads['default'].addMessage('Hello! Lets create an account for you')
            convo.threads['default'].addQuestion('Can you tell me your name please?', [
                {
                pattern: /(\w+)/i,
                    callback: (response) => {
                        convo.set('name', response.match);
                        convo.say('Okay. I am going to call you ' + response.match);
                        convo.switchTo('email');
                    }
                },
                {
                default: true,
                    callback: () => {
                        convo.say('Sorry I dont understand');
                        // Repeats the last question / message
                        convo.repeat()
                    }
                }
            ]);
            convo.createThread('email');
            convo.threads['email'].addQuestion('Your email address', [
                {
                    pattern: /([A-Za-z0-9_\-\.]){1,64}@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,})/,
                    callback: (response) => { // Using the response event
                    console.log(response.text);
                        convo.set('email', response.text);
                        convo.say('Email is ' + response.text);
                        convo.switchTo('number');
                    }
                },
                {
                default: true,
                    callback: () => {
                        convo.say('Hrm.. Im expecting email!');
                        convo.repeat();
                    }
                }
            ])

            convo.createThread('number');
            convo.threads['number'].addQuestion('Phone number as well', [
                {
                    pattern: /^[6-9][0-9]{9}$/,
                    callback: (response) => { // Using the response event
                    console.log(response.text);
                        convo.set('phone', response.text);
                        convo.say('Phone is ' + response.text);
                        convo.say('Can you confirm the information by saying "create account"');
                    }
                },
                {
                default: true,
                    callback: () => {
                        convo.say('Hrm.. Im expecting a number!');
                        convo.repeat();
                    }
                }
            ])

        })
    })

    bp.hear(/create account/i, (event, next) => {
        if (bp.convo.find(event))
        {
            var convo = bp.convo.find(event);
            var data = {
                userType: 'merchantadmin',
                name: convo.get('name'),
                username: convo.get('email'),
                phone: convo.get('phone'),
                password: 'forgot1',
                source: 'bot',
                platform: 'bot',
                businessOrigin: 'PAYUNOW'
            }
            function onSuccess(mId) {
                convo.say('Congratulation, your account has been created.');
                convo.say(`Your MID is ${mId}`);
                convo.stop();
            }
            function onFailure(msg) {
                convo.say('You account could not be created ');
                convo.say(msg);
                convo.stop();
            }
            login(data, onSuccess, onFailure);

        } else {
            event.reply('#dialogFlow', {
                // You can pass data to the UMM bloc!
                reason: event.nlp.fulfillment.speech
            })
        }

    })

    bp.hear(/create link/i, (event, next) => {
        if (global.Authorization) {
        bp.convo.start(event, convo => {
            convo.threads['default'].addMessage('Lets create a link')
            convo.threads['default'].addQuestion('Amount?', [
                {
                        pattern: /(\d+)/i,
                        callback: (response) => {
                            convo.set('amount', response.match);
                            //api call
                            function success(link) {
                                convo.say(link);
                            }
                            function failure() {
                                convo.say('sorry link could not be created');
                            }
                            createPaymentLink(response.match, success, failure)
                        }
                },
                {
                    default: true,
                        callback: () => {
                            convo.say('Sorry we are expected an amount');
                            convo.repeat()
                        }
                    }
            ]);

        })

        } else {

            event.reply('#dialogFlow', {
                // You can pass data to the UMM bloc!
                reason: event.nlp.fulfillment.speech
            })
        }

    })

    function createPaymentLink(amount, success, failure) {
        axios({
            method: 'POST',
            url:   'http://pp25.payumoney.com/payment/merchant/v1/singleInvoice',
            headers: {
                'Authorization' :global.Authorization,
                'Content-Type' : 'application/json'
            },
            data: {"amount":{"subAmount":amount},"userDetails":{},"invoiceDescription":"sadsad","channel":{"viaSms":0,"viaEmail":0},"source":"PAYUMONEY_INVOICE"},
        }).then((responseData) => {
            if (responseData.data.status == 0) {
                success();
            } else {
                failure();
            }

        }).catch((response) => {
                console.log(response);
        });
    }

    var xwwwfurlenc = function (srcjson){
        if(typeof srcjson !== "object")
            if(typeof console !== "undefined"){
                console.log("\"srcjson\" is not a JSON object");
                return null;
            }
        u = encodeURIComponent;
        var urljson = "";
        var keys = Object.keys(srcjson);
        for(var i=0; i <keys.length; i++){
            urljson += (keys[i]) + "=" + (srcjson[keys[i]]);
            if(i < (keys.length-1))urljson+="&";
        }
        return urljson;
    }

    /*bp.hear(/.*!/i, (event, next) => {
        if (bp.convo.find(event))
        {
            var convo = bp.convo.find(event);
            //convo.switchTo('default');
        } else {
            event.reply('#dialogFlow', {
                // You can pass data to the UMM bloc!
                reason: event.nlp.fulfillment.speech
            })
        }
    })*/


    // You can also pass a matcher object to better filter events
    /*bp.hear({
        type: /message|text/i,
        text: /exit|bye|goodbye|quit|done|leave|stop/i
    }, (event, next) => {
        event.reply('#goodbye', {
        // You can pass data to the UMM bloc!
            reason: 'unknown'
        })
    })*/

}
