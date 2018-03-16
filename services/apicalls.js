var axios = require('axios');
var axiosInterceptor =  require('./axiosInterceptor');
var auth = require('./auth');

let baseUrl = process.env.BASE_URL;

module.exports = {

    sendOtp: function sendOtp(data, success, failure){

        axios({
            method: 'POST',
            url: baseUrl+'/auth/op/generateAndSendPayuNowOTP',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            serialize: true,
            data: data,
        }).then((responseData) => {
            console.log(responseData);
                if (responseData.status == 0) {
                    success();
                } else {
                    failure(responseData.msg)
                }

            }).
            catch((response) => {
                console.log('catch', response);
            });
    },

    login: function login(data, success, failure) {

        axios({
            method: 'POST',
            url: baseUrl+'/auth/op/verifyOTPForLoginAndSignUp',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            serialize: true,
            data: data,
        }).then((responseData) => {
                if (responseData.status == 0) {
                    global.Authorization = responseData.result.token.body.access_token;
                    let authToken = responseData.result.token.body.access_token;
                    success(authToken);
                } else {
                    failure(responseData.msg)
                }

            }).
            catch((response) => {
                console.log(response);
            });
    },


    createLink : function createPaymentLink(user, amount, success, failure) {
        auth.getAuthHeader(user).then((token) => {
            axios({
                method: 'POST',
                url: baseUrl+"/payment/app/merchant/v1/singleInvoice",
                headers: {
                    Authorization: "bearer "+ token
                },
                data: {
                    "amount": {"subAmount": amount},
                    "userDetails": {},
                    "invoiceDescription": "sadsad",
                    "channel": {"viaSms": 0, "viaEmail": 0},
                    "source": "PAYUMONEY_INVOICE"
                },
            }).then((responseData) => {
                if (responseData.status == 0) {
                    success(responseData.result.specialMsg);
                } else {
                    failure();
                }

            }).catch((response) => {
                console.log('catch', response);
                failure();
            });
        })
    },

    getCompleteMerchantDetails(user, success, fail){
        auth.getAuthHeader(user).then((token) => {
            return axios({
                method: 'GET',
                url: baseUrl+"/auth/app/merchant/getCompleteMerchantDetails",
                headers: {
                    Authorization: "bearer " + token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
            }).then((responseData) => {
                //console.log(responseData);
                if (responseData.status == 0) {
                    success(responseData);
                } else {
                    fail(responseData);
                }

            }).catch((response) => {
                console.log(response);
            });
        })
    },

    getBankDetailsByIfscCode (user, data, success, fail) {
        auth.getAuthHeader(user).then((token) => {
            return axios({
                method: 'GET',
                url: baseUrl+"/auth/app/user/loadBankByIfsc",
                headers: {
                    Authorization: "bearer " + token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                params: data
            }).then((responseData) => {
                if (responseData.status == 0) {
                    success(responseData.result);
                } else {
                    fail(responseData);
                }

            }).catch((response) => {
                console.log(response);
            });
        })
    },

    updateBankDetails (user, data, success, fail) {
        auth.getAuthHeader(user).then((token) => {
            return axios({
                method: 'POST',
                url: baseUrl+"/auth/app/merchant/addUpdateBankDetails",
                headers: {
                    Authorization: "bearer " + token,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                serialize: true,
                data: data
            }).then((responseData) => {
                if (responseData.status == 0) {
                    console.log(responseData);
                    success(responseData.result);
                } else {
                    fail(responseData.message);
                }

            }).catch((response) => {
                console.log(response);
            });
        })
    }
}