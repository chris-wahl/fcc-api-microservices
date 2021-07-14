const dns = require('dns');
const mongoose = require('mongoose')

const shortUrlSchema = new mongoose.Schema({
  original_url: String,
  short_url: String,
});

let ShortURL = mongoose.model("ShortURL", shortUrlSchema);

const findShortUrl = (short_url, done) => {
  ShortURL.findOne({short_url}, (err, data) => {
      if (!!err) {
        console.error(err);
        return done(null);
      } else if (data == null) {
        return done(null);
      }
      return done(data.original_url);
  })
}


const getAll = (done) => {
  ShortURL.find({}, 'original_url short_url')
  .sort({original_url: 1})
  .exec(
    (err, data) => {
      if (!!err) {
        console.error(err);
        return done(null);
      }
      return done(data.map(e => ({original_url: e.original_url, short_url: e.short_url})));
    }
  )
}


const createShortUrl = (original_url, done) => {
  ShortURL.findOne({original_url}, (err, existingUrl) => {
      if (!!err) {
        console.error(err);
        return done(null);
      } else if (!!existingUrl) {
        // A record already exists.  Return it.
        return done({
          original_url, short_url: existingUrl.short_url
        });
      }
      ShortURL.count((err, count) => {
        if (!!err) {
          console.error(error);
          return data(null);
        }
        existingUrl = new ShortURL({original_url, short_url: count + 1});

        existingUrl.save((err, _) => {
          if (!!err) {
            console.error(err);
            return done(null);
          }
          return done({
            original_url,
            short_url: count + 1
          });
        });
      });    
  });
};

module.exports = function(app) {

  app.route('/api/shorturl/:url?')
    .get((req, res) => {
      const short_url = req.params.url;
      
      // If hitting the shorturl root, send back current mapping
      if (!short_url) {
        return getAll((data) => res.send(data));
      }
      // Otherwise try to find a result and return the redirect
      findShortUrl(short_url, (original_url) => {
        if (original_url === null) {
          return res.send({error: 'Invalid URL'});
        }
        return res.redirect(302, original_url);
      });
  })
    .post((req, res) => {
      const original_url = req.body.url;

      // Can't use URL.hostname like in the dns lookup because it will
      // correct `ftp:/xxx` to `ftp://xxx` automatically.  Which is
      // undesired here.`
      if (original_url.match(/^.+tp[s]?:\/\/.+/g) === null) {
        return res.send({error: 'invalid url'});
      }

      dns.lookup(new URL(original_url).hostname, {all: true}, (err, _) => {
        if (!!err) { 
          return res.send({'error': 'invalid url'})
        }
        createShortUrl(original_url, (data) => {
          if (data === null) {
            return res.send({'error': 'An error occurred.'});
          }
          return res.json(data);
        });
    });
  });
};
