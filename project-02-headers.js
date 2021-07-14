module.exports = function(app) {

  app.get('/api/whoami', (req, res) => {
    return res.send({
      ipaddress: req.ip,
      language: req.headers['accept-language'],
      software: req.headers['user-agent']
    })
  });

};