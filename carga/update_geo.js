const MongoClient = require('mongodb').MongoClient;
var NodeGeocoder = require('node-geocoder');

var options = {
    provider: 'openstreetmap'
};

var geocoder = NodeGeocoder(options);


const url = 'mongodb+srv://edudutra:Reuel-Staples@cluster0-slco2.mongodb.net/admin';
const dbName = 'farmaciapopular';

(async function() {
    let client;

    try {
        client = await MongoClient.connect(url);
        console.log("Connected correctly to server");

        const db = client.db(dbName);

        // Get the collection
        const col = db.collection('farmacias');

        // Insert a single document
//        const r = await col.insertMany([{a:1}, {a:1}, {a:1}]);
//        assert.equal(3, r.insertedCount);

        // Get the cursor
        const cursor = col.find({ localizacao : { $exists:0 } }).limit(10);

        // Iterate over the cursor
        while(await cursor.hasNext()) {
            const doc = await cursor.next();
            console.dir(doc);

            geocoder.geocode({q: doc.endereco + ', ' + doc.bairro + ', ' + doc.municipio + ', ' + doc.uf + ', Brazil'} , function(err, res) {
                console.log(res);
            });

        }
    } catch (err) {
        console.log(err.stack);
    }

    // Close connection
    client.close();
})();