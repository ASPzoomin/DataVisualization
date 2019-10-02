var incomeDomain = [0,10000,50000,70000,80000,150000,290000,3600000];
var incomeColor = d3.scaleThreshold()
    .domain(incomeDomain)
    .range(d3.schemeReds[7]);
// incomeData 
var incomeData = d3.map();

// asynchronous tasks, load topojson maps and data
d3.queue()
    .defer(d3.json, "data/ny-quantize-topo.json")
    .defer(d3.csv, "data/income.csv",function(d) {
        if(isNaN(d.income)){
            incomeData.set(d.id,0);
        } else {
            incomeData.set(d.id,+d.income);
        }
    })
    .await(ready);
    
// callback function  
function ready(error, data) {

    if (error) throw error;

    // new york topojson
    var new_york = topojson.feature(data, {
        type: "GeometryCollection",
        geometries: data.objects.ny.geometries
    });

    // projection and path
    var projection = d3.geoAlbersUsa()
        .fitExtent([[20, 20], [460, 580]], new_york);;

    var geoPath = d3.geoPath()
        .projection(projection);

    // draw new york map and bind income data
    d3.select("svg.income").selectAll("path")
        .data(new_york.features)
        .enter()
        .append("path")
        .attr("d", geoPath)
        .attr("fill", function(d) {
            var incomeValue = incomeData.get(d.properties.GEOID);
            return(incomeValue!=0? incomeColor(incomeValue) :"blue" );
        })
}