var request = require('request');

request('http://i3geo.saude.gov.br/i3geo/ogc.php?service=WFS&version=1.0.0&request=GetFeature&typeName=farmacia_popular_estabelecimento&outputFormat=JSON', function (error, response, body) {
    console.log('error:', error) // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode) // Print the response status code if a response was received
    var farmacia_popular = JSON.parse(body) // Print the HTML for the Google homepage.

    var result = []
    for (let item of farmacia_popular.features) {
        var farmacia = Object.assign({}, ...item.properties)
        //console.log(farmacia)
        result.push(farmacia)
    }
});