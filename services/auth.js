
const AUTHKEY = 'auth_token';

module.exports = {

    _bp:  null,

    _authHeader : null,

    setBp: function(bp){
        this._bp = bp;
    },

    login : function (user, token) {
        this._authHeader = token;
        return this._bp.users.tag(user.userId, AUTHKEY, token);
    },

    isLoggedin: function (user) {
        /*return new Promise((resolve, reject) => {
            resolve (this._authHeader != null ? true : false);
        });*/
        //return this._authHeader ? true : false
        return this._bp.users.hasTag(user.userId, AUTHKEY);
    },

    getAuthHeader: function (user) {
        return this._bp.users.getTag(user.userId, AUTHKEY);
    },

    logout: function (user) {
        this._bp.users.untag(user.userId, AUTHKEY)
    }
}