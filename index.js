var restify = require('restify');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;

var ResourceBookingSchema = new Schema({
    fromTime: Schema.Types.Date,
    toTime: Schema.Types.Date
});

var ResourceBooking = mongoose.model('ResourceBooking', ResourceBookingSchema);

var ResourceSchema = new Schema({
    name: String,
    category: String,
    description: String
});

var Resource = mongoose.model('Resource', ResourceSchema);

mongoose.connect('mongodb://localhost/resource');

var server = restify.createServer({
    name: 'ResourcePlugin',
    version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

function getResourceById(req, res, next) {
    var id = req.params.id;
    console.log(id);
    Resource.findById(id, function(err, doc) {
        return res.send(JSON.stringify(doc));
    });
}

function getResources(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    // .find() without any arguments, will return all results
    // the `-1` in .sort() means descending order
    Resource.find().lean().exec(function (err, data) {
        return res.send(JSON.stringify(data));
    });
}

function postResources(req, res, next) {
    var resource = new Resource();
    resource.title = "Hello";
    resource.save(function () {
        res.send(req.body);
    });
    return next();
}

server.get('/resources', getResources);
server.get('/resources/:id', getResourceById);
server.post('/resources', postResources);

var port = process.env.PORT || 6100;
server.listen(port, function () {
    console.log('%s listening at %s', server.name, server.url);
});