var express = require('express');
var router = express.Router();
/*
* GET contactList.
*/
router.get('/contactList', function(req, res) {
var db = req.db;
    var collection = db.get('contactList');
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:3000",
    });
collection.find({},{},function(err,docs){
if (err === null)
res.json(docs);
else res.send({msg: err});
});
});

/*
 * POST to addContact.
 */
router.post('/addContact', function(req, res) {
    var db = req.db;
    var collection = db.get('contactList');
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:3000",
      });
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
* PUT to updateContact
*/
router.put('/updateContact/:id', function (req, res) {
    var db = req.db;
    var collection = db.get('contactList');
    var contactToUpdate = req.params.id;
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:3000",
    });
    var filter = { "_id": contactToUpdate};
    collection.update(filter, { $set: {"name": req.body.name, "tel": req.body.tel, "email": req.body.email}}, function (err, result) {
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    })
});


/*
 * DELETE to deleteContact.
 */
router.delete('/deleteContact/:id', function(req, res) {
    var db = req.db;
    var contactID = req.params.id;
    var collection = db.get('contactList');
    res.set({
        "Access-Control-Allow-Origin": "http://localhost:3000",
    });
    collection.remove({'_id':contactID}, function(err, result){
    	res.send((err === null)?{msg:''}:{msg:err});
    });
});

/*
 * Handle preflighted request
 */
router.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
});

/* GET users listing.
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
*/

module.exports = router;
