var restify = require('restify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

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

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/resource');

var server = restify.createServer({
    name: 'ResourcePlugin',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

//var resource01 = new Resource({name: "Laptop At 17 floor 01"});
//resource01.save(function (err, resource){
//
//    var booking01 = new ResourceBooking();
//    booking01.fromTime = new Date();
//    booking01.toTime = new Date(booking01.fromTime.getTime() + 120 * 60 * 1000);
//    booking01.userId = 40;
//    booking01.resource = resource;
//    booking01.save();
//
//
//    var booking02 = new ResourceBooking();
//    booking02.fromTime = new Date(booking01.fromTime.getTime() + 160 * 60 * 1000);
//    booking02.toTime = new Date(booking02.fromTime.getTime() + 100 * 60 * 1000);
//    booking02.userId = 40;
//    booking02.resource = resource;
//    booking02.save();
//    resource01.resourceBookings.push(booking01);
//    resource01.resourceBookings.push(booking02);
//    resource01.save();
//});
function getResourceById(req, res, next) {
    var id = req.params.id;
    Resource.findById(id).populate('resourceBookings').exec(function(err, doc) {
        return res.send(doc);
    });
}

function getResources(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // .find() without any arguments, will return all results
    // the `-1` in .sort() means descending order
    Resource.find().lean().populate('resourceBookings').exec(function (err, data) {
        return res.send(data);
    });
}


function postResources(req, res, next) {
    var resource = new Resource();
    var postResource = req.body.resource;
    if (!postResource){
        res.send(404);
        return next();
    }
    resource.name = postResource.name;
    resource.description = postResource.description;
    resource.location = postResource.location;
    resource.images = postResource.images;
    resource.save(function () {
        res.send(resource);
    });
    return next();
}
function updateResource(req, res, next) {
    var postResource = req.body.resource;
    if (!postResource){
        res.send(404);
        return next();
    }
    Resource.findById(postResource._id, function(err, data) {
        var resource = data;
        resource.name = postResource.name;
        resource.description = postResource.description;
        resource.location = postResource.location;
        resource.images = postResource.images;
        resource.save(function () {
            res.send(resource);
        });
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

    console.log(id);
    console.log(bookId);
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
    var resourceBooking = new ResourceBooking();

    Resource.findById(id, function (err, resource) {
        resourceBooking.userId = parseInt(userId);
        resourceBooking.fromTime = fromTime;
        resourceBooking.toTime = toTime;
        resourceBooking.resource = resource;
        resourceBooking.save();
        resource.resourceBookings.push(resourceBooking);
        resource.save(function() {
            Resource.findById(id).populate('resourceBookings').exec(function(err, doc) {
                return res.send(doc);
            });
        });
    });

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
server.post('/resources', postResources);
server.put('/resources/:id/book/:bookId/:fromTime/:toTime', updateResourceBook);
server.put('/resources', updateResource);
server.del('/resources/:id', deleteResource);

var port = process.env.PORT || 6100;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});
