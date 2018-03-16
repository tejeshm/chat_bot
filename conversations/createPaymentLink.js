var auth = require('../services/auth');
var apicalls = require('../services/apicalls');
let commonUtils = require('../services/commonFunctions');

module.exports = function(bp, event) {

    auth.isLoggedin(event.user).then((result) => {
        if (result) {
            bp.convo.start(event, convo => {
                convo.threads['default'].addMessage('Lets create a link')
                convo.threads['default'].addQuestion('Amount?', [
                    {
                        pattern: /(\d+)/i,
                        callback: (response) => {
                            convo.set('amount', response.match);
                            createLink(event.user, convo, response.match);
                        }
                    },
                    commonUtils.conversationStop(convo),
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
            if (!bp.convo.find(event)) {
                event.reply('#dialogFlow', {
                    reason: event.nlp.fulfillment.speech
                })
            }
        }
    });

    function createLink(user, convo, amount) {
        function success(link) {
            console.log(link);
            convo.say(link);
            convo.stop();
        }
        function failure() {
            convo.say('sorry link could not be created');
            convo.stop();
        }
        apicalls.createLink(user, amount, success, failure)
    }
};