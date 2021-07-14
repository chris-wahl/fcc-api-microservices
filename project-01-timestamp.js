module.exports = function(app) {
  
  app.get('/api/:value?', (req, res) => {
    const respondWith = (date) => res.send({
      'unix': date.getTime(),
      'utc': date.toGMTString()
    });

    if (!req.params.value) {
      return respondWith(new Date());    
    }

    const date = new Date(req.params.value);
    if (!isNaN(date)) {
        return respondWith(date);
    } else {
      const seconds = parseInt(req.params.value);
      if (!isNaN(seconds)) {
        return respondWith(new Date(seconds));
      }
    }
    res.send({error: 'Invalid Date'});
  });
};
