var restify = require('restify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var models = require('./models');
var Sequelize = models.sequelize;
var Resources = models.Resources;
var ResourceBookings = models.ResourceBookings;

var ResourceSchema = new Schema({
    name: String,
    category: String,
    description: String,
    location: String,
    images: [String],
    resourceBookings: [
        {type: ObjectId, ref: 'ResourceBooking'}
    ]
});

var Resource = mongoose.model('Resource', ResourceSchema);

var ResourceBookingSchema = new Schema({
    userId: Schema.Types.Number,
    fromTime: Schema.Types.Date,
    toTime: Schema.Types.Date,
    resource: {
        type: ObjectId,
        ref: 'Resource'
    }
});

var ResourceBooking = mongoose.model('ResourceBooking', ResourceBookingSchema);

mongoose.connect(process.env.MONGO_URL || 'mongodb://localhost/resource');

var server = restify.createServer({
    name: 'ResourcePlugin',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

function getResourceById(req, res, next) {
    var id = req.params.id;
    var userId = req.headers['x-user'];
    Resources.findById(id).then(function(result) {
        if (result) {
            var resource = result.dataValues;
            var resourceBookings = [];
            ResourceBookings.findAll({where: {resourceId: id, userId: userId}}).then(function(bookings) {
                bookings.forEach(function(booking) {
                    resourceBookings.push(booking.dataValues);
                });
                resource.resourceBookings = resourceBookings;
                res.send(result.dataValues);
            });
        } else {
            res.send(404);
        }
    });
}

function getResources(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    Resources.findAll().then(function(result) {
       return res.send(result);
    }).catch(function(err) {
        console.log(err);
    });
}

function addResource(req, res, next) {
    var resource = req.body.resource;
    var name = resource.name;
    var images = resource.images;
    var location = resource.location;
    var description = resource.description;
    Resources.create({
        name: name,
        images: images,
        location: location,
        description: description
    }).then(function(result) {
        res.send(result.dataValues);
    }).catch(function(err) {
        console.error(err);
        res.send(500);
    });
}

function updateResource(req, res, next) {
    var resource = req.body.resource;
    if (!resource){
        res.send(404);
        return next();
    }
    Resources.update({
        name: resource.name,
        images: resource.images,
        location: resource.location,
        description: resource.description
    }, { where: {id: resource.id} }).then(function(result) {
        res.send(resource);
    });
    return next();
}

function deleteResource(req, res, next) {
    var id = req.params.id;

    Resource.findById(id).populate('resourceBookings').exec(function (err, doc) {
        if (!err) {
            doc.remove(function () {
                Resource.findById(id).remove(function () {
                    return res.send(200);
                });
            });
        }
    });

    return next();
}

function deleteResourceBook(req, res, next) {
    var id = req.params.id;
    var bookId = req.params.bookId;

    ResourceBooking.findById(bookId).remove(function () {
        Resource.findById(id).populate('resourceBookings').exec(function(err, doc) {
            return res.send(doc);
        });
    });

    return next();
}


function bookResource(req, res, next) {
    var id = req.params.id;
    var userId = req.headers['x-user'];
    var fromTime = Date.parse(req.params.fromTime);
    var toTime = Date.parse(req.params.toTime);
    Resources.findById(parseInt(id)).then(function(result) {
        if (result) {
            var resource = result.dataValues;
            ResourceBookings.create({
                resourceId: resource.id,
                userId: userId,
                fromTime: fromTime,
                toTime: toTime
            }).then(function(result) {
                res.send(result.dataValues);
            }).catch(function(err) {
                console.error(err);
                res.send(500);
            });
        } else {
            res.send(404);
        }
    });
    //Resource.findById(id, function (err, resource) {
    //    resourceBooking.userId = parseInt(userId);
    //    resourceBooking.fromTime = fromTime;
    //    resourceBooking.toTime = toTime;
    //    resourceBooking.resource = resource;
    //    resourceBooking.save();
    //    resource.resourceBookings.push(resourceBooking);
    //    resource.save(function() {
    //        Resource.findById(id).populate('resourceBookings').exec(function(err, doc) {
    //            return res.send(doc);
    //        });
    //    });
    //});

    return next();
}

function updateResourceBook(req, res, next) {
    var id = req.params.id;
    var bookId = req.params.bookId;

    ResourceBooking.findById(bookId, function(err, data) {
        var resourceBooking = data;
        resourceBooking.fromTime = Date.parse(req.params.fromTime);
        resourceBooking.toTime = Date.parse(req.params.toTime);
        resourceBooking.save(function(err) {
            res.send(resourceBooking);
        });
    });
    return next();
}

server.get('/resources', getResources);
server.get('/resources/:id', getResourceById);
server.del('/resources/:id/book/:bookId', deleteResourceBook);
server.post('/resources/:id/book/:fromTime/:toTime', bookResource)
server.post('/resources', addResource);
server.put('/resources/:id/book/:bookId/:fromTime/:toTime', updateResourceBook);
server.put('/resources', updateResource);
server.del('/resources/:id', deleteResource);

var port = process.env.PORT || 6100;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
