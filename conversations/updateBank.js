var auth = require('../services/auth');
var apicalls = require('../services/apicalls');
let commonUtils = require('../services/commonFunctions');

module.exports = function(bp, event) {

    auth.isLoggedin(event.user).then((result) => {
            if (result) {
                //let currentBank = showCurrentBankDetails(event);
                bp.convo.start(event,
                    convo => {
                        convo.threads['default'].addMessage(
                            'Lets update your bank details.');
                        convo.threads['default'].addQuestion('Enter IFSC of new bank?',
                            [
                                {
                                    pattern: /^[A-Za-z]{4}\d{7}$/,
                                    callback: (response) => {
                                        convo.set('IFSC', response.text);
                                        getBankDetailsFromIFSC(event.user, response.text, convo);
                                    },
                                },
                                commonUtils.conversationStop(convo),
                                {
                                    default: true,
                                    callback: () => {
                                        convo.say('Sorry this is not a valid IFSC code');
                                        convo.repeat();
                                    },
                                }
                            ]);

                        convo.createThread(
                            'account');
                        convo.threads['account'].addQuestion(
                            'please enter your new bank account number',
                            [
                                {
                                    pattern: /^[A-Za-z0-9]+$/,
                                    callback: (response) => {
                                        convo.set('accountNumber', response.text);
                                        updateBankDetails(event.user, convo);
                                    },
                                },
                                commonUtils.conversationStop(convo),
                                {
                                    default:
                                        true,
                                    callback:
                                        () => {
                                            convo.say(
                                                'Hrm.. Im expecting an account number!');
                                            convo.repeat();
                                        },
                                },
                            ]);
                    });
            } else {
                if (!bp.convo.find(event)) {
                    event.reply('#dialogFlow', {
                        // You can pass data to the UMM bloc!
                        reason: event.nlp.fulfillment.speech
                    })
                }
            }
        },
    );




    function getBankDetailsFromIFSC(user, ifsc, convo) {
        function success(bank) {
            convo.say('Please confirm the Bank details');
            convo.say('Bank name: '+bank.bank+'\n' +
                'state: '+bank.state+'\n' +
                'city: '+bank.city+'\n' +
                'branch: '+bank.branch+'\n' +
                'address: '+bank.address);
            convo.set('bankDetails', bank);
            convo.set('ifsc',ifsc);

            convo.switchTo('account');
        }
        function failure(error) {
            convo.say("sorry Ifsc is wrong");
            console.log(error);
            convo.repeat();
        }
        apicalls.getBankDetailsByIfscCode(user, {"ifsc": ifsc}, success, failure);
    }

    function updateBankDetails(user, convo) {
        let bank = convo.get('bankDetails');
        let data = {
            bankName:bank.bank,
            number: convo.get('accountNumber'),
            holderName: 'Tejesh',
            branchState: bank.city,
            branchName:bank.branch,
            branchCity:bank.city,
            ifscCode:convo.get('ifsc'),
            branchAddress:bank.address,
            accountType:'Current',
        }
        function success(bank) {
            convo.say('congrats your bank has been updated');
            convo.stop();
        }
        function failure(message) {
            convo.say(message);
            convo.stop();
        }
        apicalls.updateBankDetails(user, data, success, failure);
    }

    function showCurrentBankDetails(event) {
        bp.db.kvs.get('merchantData')
        .then(data => {
            let account = data.merchant.account;
            event.reply('#bankDetails', {
                bankName: account.bankName,
                number: account.number,
                ifscCode: account.ifscCode,
            });
        });
    }



};
