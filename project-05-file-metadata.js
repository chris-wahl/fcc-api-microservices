const multer = require('multer');

module.exports = function(app) {
  app.post('/api/fileanalyse', multer({dest: '/tmp'}).single('upfile'), (req, res) => {
    res.send({
      name: req.file['originalname'],
      type: req.file['mimetype'],
      size: req.file['size']
    })
  });
};
