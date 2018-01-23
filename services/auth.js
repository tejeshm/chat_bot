var axios = require('axios');

module.exports = function login(data, success, failure) {

    axios({
        method: 'POST',
        url:   'http://pp25.payumoney.com/auth/op/registerUserViaReferral',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        noAuthorizeCheck: true ,
        data: xwwwfurlenc(data),
    }).then((responseData) => {

        if (responseData.data.status == 0) {
            var mId = responseData.data.result.adminMerchantId;
            global.Authorization = responseData.data.result.userVal;
            console.log(global.Authorization);
            success(mId);
        } else {
            failure(responseData.data.msg)
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
