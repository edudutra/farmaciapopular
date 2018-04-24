var request = require('request')

var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb+srv://edudutra:Reuel-Staples@cluster0-slco2.mongodb.net/admin"

request('http://sage.saude.gov.br/paineis/aqt/lista_farmacia.php?output=json&', function (error, response, body) {
    console.log('error:', error)
    console.log('statusCode:', response && response.statusCode)
    var farmacia_popular = JSON.parse(body)

    var colunas = farmacia_popular.metadata;
    colunas.forEach(function(item){
        item.colName = item.colName
            .toLowerCase()
            .replace(/ /g, "_")
            .replace(/[àáâã]/g, "a")
            .replace(/[éêë]/g, "e")
            .replace(/[í]/g, "i")
            .replace(/[óõô]/g, "o")
            .replace(/[ú]/g, "u")
            .replace("&ccedil;", "c")
    })

    var result = []
    for (var i = 0; i < farmacia_popular.resultset.length; i++) {

        var farmacia = {};
        for(var j = 0; j < farmacia_popular.metadata.length; j++)
        {
            farmacia[farmacia_popular.metadata[j].colName] = farmacia_popular.resultset[i][j];
        }
        result.push(farmacia)
        //break
    }

    MongoClient.connect(uri, function(err, client) {
        const farmacias = client.db("farmaciapopular").collection("farmacias");

        farmacias.insertMany(result, function(err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            client.close();
        });
    });


});

/*
db.farmacias.ensureIndex({
    geometry : "2dsphere"
});


var milesToRadian = function(miles){
    var earthRadiusInMiles = 3959;
    return miles / earthRadiusInMiles;
};

var kmsToRadian = function(kms){ var earthRadiusInkms = 6371; return kms / earthRadiusInkms; }

var landmark = db.landmarks.findOne({name: "Washington DC"});

var query = {
    "geometry" : {
        $geoWithin : {
            $centerSphere : [[-46.7140218,-23.6163324], kmsToRadian(5) ]
        }
    }
};
// Step 3: Query points.
db.farmacias.find(query).pretty();

db.farmacias.find(
    {
        geometry:
            { $near:
                    {
                        $geometry: { type: "Point",  coordinates: [ -46.7008891, -23.6576355 ] },
                        $minDistance: 0,
                        $maxDistance: 5000
                    }
            }
    }
).pretty();


db.runCommand(
    {
        geoNear: "farmacias",
        near: { type: "Point", coordinates: [ -46.7008891, -23.6576355 ] },
        spherical: true,
        query: { "properties.uf" : "SP", "properties.no_cidade" : "SAO PAULO" , "properties.no_bairro_farmacia" : "SANTO AMARO" }
    }
)

    .pretty()


db.runCommand(
    {
        geoNear: "farmacias",
        near: { type: "Point", coordinates: [ -46.7008891, -23.6576355 ] },
        spherical: true
    }
)



db.farmacias.aggregate([
    { "$geoNear": {
            "near": {
                "type": "Point",
                "coordinates": [-46.6489961, -23.5426745]
            },
            "spherical": true,
            "distanceField": "distance",
            "limit": 10                  // <-- That's the one!
        }},
    { "$sort": { "distance": 1 } }
]).pretty()


-48.4624922,
    -1.3499136
    */