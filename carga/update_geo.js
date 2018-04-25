const MongoClient = require('mongodb').MongoClient;
var NodeGeocoder = require('node-geocoder');

var HttpsAdapter = require('node-geocoder/lib/httpadapter/httpsadapter.js')
var httpAdapter = new HttpsAdapter(null, {
    headers: {
        'user-agent': 'Farmacia Popular Bot <emdutra@gmail.com>'
    }
});

var options = {
    provider: 'openstreetmap',
    httpAdapter: httpAdapter
};

var geocoder = NodeGeocoder(options);


const url = 'mongodb+srv://edudutra:Reuel-Staples@cluster0-slco2.mongodb.net/admin';
const dbName = 'farmaciapopular';
let client;

(async function() {

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
        const cursor = col.find({$and : [{ notfound : { $exists : 0 } }, {localizacao : {$exists : 0}}]}).sort([["cnpj_da_farmacia", 1]]).limit(99999); //, uf : "SP"}).limit(1000);

        // Iterate over the cursor
        while(await cursor.hasNext()) {
            const doc = await cursor.next();
            console.log({cnpj: doc.cnpj_da_farmacia, nome: doc.farmacia, endereco: doc.endereco});

            var query = {
                format: 'json',
                q: doc.endereco + ', ' + doc.municipio + ', ' + doc.uf + ', Brazil'
                }

            geocoder.geocode(query, function(err, res) {
                if (err) {
                    console.log(err.message)
                    return
                }
                if (res && Array.isArray(res) && res.length > 0) {
                    //console.log(res[0])
                    col.updateOne({_id : doc._id }, { $set : { localizacao :
                                {
                                    type: "Point",
                                    coordinates: [res[0].longitude, res[0].latitude]
                                }
                    }}
                        , function(err, r) {
                            if (err) console.log(err)
                            console.log(doc.cnpj_da_farmacia + '\t' + doc.farmacia + ': ' + r.result.ok)
                            //if (!cursor.hasNext()) client.close()
                        })
                }
                else {
                    //console.log(res[0])
                    col.updateOne({_id : doc._id }, { $set : { notfound : [options.provider] }},
                        function(err, r) {
                            if (err) console.log(err)
                            console.log('Not Found:\t' + doc.cnpj_da_farmacia + '\t' + doc.farmacia + ': ' + r.result.ok)
                            //if (!cursor.hasNext()) client.close()
                        })

                    //console.log(doc.cnpj_da_farmacia + '\t' + doc.farmacia + ': Not Found')
                    //if (!cursor.hasNext()) client.close()
                }

            });
            await sleep(1000)

        }
    } catch (err) {
        console.log(err.stack);
    }

    // Close connection
    //client.close();
})()

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}