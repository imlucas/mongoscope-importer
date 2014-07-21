var request = require('request');

module.exports = {
  createWriteStream: request.put,
  /**
   * @todo: temporary hack as most URL requests will fail if no user-agent supplied.
   */
  createReadStream: function(url){
    return request(url,{headers: {'User-Agent': 'User-Agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.116 Safari/537.36'}});
  }
};
