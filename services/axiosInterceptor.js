var axios = require('axios');
var auth = require('./auth');
var commonUtils = require('./commonFunctions');



/**
 * request interceptor
 */
axios.interceptors.request.use((config) => {

        config = Object.assign({}, config);

        /**
         * Serialize the post data Useful for cases when you want to
         * send serialized data pass true serialize = true API request config
         * @type {[type]}
         */
        if (config.serialize === true) {
            config.data = commonUtils.serialize(config.data)
        }

        /**
         * For LoggedIn Case
         */
        /*if(global.Authorization) {
            config.headers.Authorization = "bearer "+global.Authorization
        }*/

        /*if(auth.getAuthHeader()){
            config.headers.Authorization = "bearer "+ auth.getAuthHeader()
        }*/

        return config;


    },
    (error) => {
        return Promise.reject(error)
    })

/**
 * response interceptor
 */
axios.interceptors.response.use(
    (response) => {
        return response.data
    },
    (error) => {
        if (error && error.config && error.config.noAuthorizeCheck && error.status == '401') {
            return Promise.reject(error)
        }

        console.log(error);
        /**
         *Handling 401 case
         */
        if (error && error.status == '401') {
            auth.logout()
            //auth.handleInactivityTimeout(window.location.pathname + window.location.search, 401)
        }
        /**
         * Handling 403 case
         */
        if (error && error.status == '403') auth.logout()


        if(error.config)
            var exception = 'Some Error Occured. Please try later';

        throw exception
    })
