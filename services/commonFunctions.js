
module.exports = {

    serialize : (data) => {
        if(typeof data === 'string') {
            data = JSON.parse(data)
        }
        else {
            data = Object.assign({}, data)
        }
        data = Object.keys(data).map((k) => {
            if(data[k] !== null && data[k] !== undefined) {
                if (data[k] instanceof Array || data[k] instanceof Object) {
                    return encodeURIComponent(k) + '=' + encodeURIComponent(JSON.stringify(data[k]))
                }
                return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
            }
            return false
        })
        data = data.filter((element) => {
                return element
            }
        ).join('&')
        return data
    },

    conversationStop: (convo) => {
        return {
            pattern: /stop/i,
            callback: (response) => {
                convo.stop('aborted');
            }
        }
    },
}