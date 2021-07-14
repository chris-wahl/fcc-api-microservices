const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: String,
    log: [{
        description: String,
        duration: Number,
        date: String
    }]
});

const User = mongoose.model("User", userSchema);
const BASE_URL = '/api/users/:_id';

function createUser(username, done) {
    User.findOne({username}, (err, data) => {
        if (!!err) {
            console.error(err);
            return done(null);
        } else if (!!data) {
            return done({
                username, _id: data._id
            });
        }

        const user = new User({username});
        user.save((err, data) => {
            if (!!err) {
                console.error(err);
                return done(null);
            }
            return done({
                username, _id: data.id
            });
        })

    });
}

function getAllUsers(done) {
    User.find({})
        .sort({username: 1})
        .select({log: 0, __v: 0})
        .exec((err, data) => {
            if (!!err) {
                console.error(err);
                return done(null);
            }
            return done(data);
        });
}

function createExercise({_id, description, duration, date}, done) {
    User.findOne({_id}, (err, user) => {
        if (!!err) {
            console.error(err);
            return done(null);
        }
        user.log.push({description, duration, date});
        user.save((err, updatedUser) => {
            if (!!err) {
                console.error(err);
                return done(null);
            }
            return done({
                _id,
                username: updatedUser.username,
                description, duration,
                // Date needs to be in this exact format "(Wed 14 Jul 2020)" to pass the test.  This is not specified in the documents.
                date: new Date(date).toString().slice(0, 15)
            });
        })
    })
}


function getUserLog({_id, dateFrom, dateTo, limit}, done) {
    User.findOne({_id}).select({__v: 0}).exec((err, user) => {
        if (!!err || !user) {
            console.error(err);
            return done(null);
        }
        const count = user.log.length;
        if (dateFrom) {
            user.log = user.log.filter(l => l.date >= dateFrom);
        }
        if (dateTo) {
            user.log = user.log.filter(l => l.date <= dateTo);
        }

        if (limit) {
            user.log = user.log.slice(0, limit);
        }

        return done({
            _id, count,
            username: user.username,
            log: user.log.map(l => ({
                description: l.description,
                duration: l.duration,
                date: l.date
            })),
        });
    })
}

module.exports = function (app) {

    app.route(`${BASE_URL}?`)
        .post((req, res) => {
            const {username} = req.body;
            createUser(username, (data) => {
                if (data === null) {
                    return res.send({'error': 'invalid username'});
                }
                return res.json(data);
            })
        })
        .get((req, res) => {
            const {_id} = req.params;
            // Hitting the root URL.  Return the list.
            if (!_id) {
                return getAllUsers((data) => {
                    if (data === null) return res.send({'error': 'An error occurred'});
                    return res.json(data);
                });
            }
        });

    app.route(`${BASE_URL}/exercises`)
        .post((req, res) => {
            const {description, duration} = req.body;
            const {_id} = req.params;

            const date = req.body.date || (new Date()).toISOString().slice(0, 10);

            createExercise({_id, description, duration: parseInt(duration), date}, (data) => {
                if (data === null) {
                    return res.send({error: 'An error occurred'});
                }
                return res.send(data);
            });
        });

    app.route(`${BASE_URL}/logs`)
        .get((req, res) => {
            const {_id} = req.params;

            const dateFrom = req.query.from;
            const dateTo = req.query.to;
            const limit = req.query.limit;


            getUserLog({_id, dateFrom, dateTo, limit}, (data) => {
                if (data === null) {
                    return res.send({error: 'An error occurred'});
                }
                return res.json(data);
            });
        })
}
