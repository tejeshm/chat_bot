require('dotenv').config()
var starters = require('./services/conversation_starters');
var auth = require('./services/auth');


var loginConversation = require('./conversations/login');
var paymentLinkConversation = require('./conversations/createPaymentLink');
var bankUpdateConversation = require('./conversations/updateBank');


module.exports = function(bp) {

    auth.setBp(bp);

    bp.hear(starters.CREATE_LINK, (event, next) => {
        paymentLinkConversation(bp, event);
    });

    bp.hear(starters.UPDATE_BANK, (event, next) => {
        bankUpdateConversation(bp, event);
    });

    bp.hear({type: 'notif'}, (event, next) => {
        // all the conditions matched
        event.reply('#pennyDropPending');
    })


    //replace this with a function and move it, logic to start a conversation comes from here.
    //let defaultRegex = new RegExp("^((?!"+starters.CREATE_LINK+"\\b|"+starters.LOGIN+"\\b).)*$");
    //let defaultRegex = /.*/;
    bp.hear(/.*/i, (event, next) => {
        if (!bp.convo.find(event)) {
            switch (event.nlp.metadata.intentName){
                case starters.LOGIN:
                    loginConversation(bp, event);
                    break;

                case starters.CREATE_LINK:
                    paymentLinkConversation(bp);
                    break;

                case starters.UPDATE_BANK:
                    bankUpdateConversation(bp);
                    break;

                default:
                    event.reply('#dialogFlow', {
                        reason: event.nlp.fulfillment.speech
                    });
            }

        }
    });

    bp.hear(/HITL_START/, (event, next) => {
        bp.messenger.sendTemplate(event.user.id, {
            template_type: 'button',
            text: 'Bot paused, a human will get in touch very soon.',
            buttons: [{
                type: 'postback',
                title: 'Cancel request',
                payload: 'HITL_STOP'
            }]
        })

        bp.notifications.send({
            message: event.user.first_name + ' wants to talk to a human',
            level: 'info',
            url: '/modules/botpress-hitl'
        })
        bp.hitl.pause(event.platform, event.user.id)
    })

    bp.hear(/HITL_STOP/, (event, next) => {
        bp.messenger.sendText(event.user.id, 'Human in the loop disabled. Bot resumed.')
        bp.hitl.unpause(event.platform, event.user.id)
    })

    bp.hear({ type: 'message', text: /.+/i }, (event, next) => {
        bp.messenger.sendText(event.user.id, 'You said: ' + event.text)
    })

}
