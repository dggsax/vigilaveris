//////////////////////////////////////////////////////////////////////////////////////////////////
//    Timeplot handler                                                                          //
//                                                                                              //
//                                                                                              //
//       Job: builds and generates timeplots then updates socket when timeplots change values   //
//                                                                                              //
//       What it needs to do: settings gear to allow specification for:                         //
//             * sin wave generation                                                            //
//             * square wave generation                                                         //
//             * amplitude                                                                      //
//			   * offset                                                                         //
//			   * frequency                                                                      //
//			   * resolution                                                                     //
//                                                                                              //
//////////////////////////////////////////////////////////////////////////////////////////////////

// Function that generates plots
var plots = new Array();
function plot_generate(name,min,max,datapoints){
    var newb = document.createElement("div"); //create div
    $(newb).addClass("sbs draggable timeplot-container"); //make it sbs, dragable, and a container
    var newtitle = document.createElement("div"); //make inside div
    $(newtitle).addClass("plot_title timeplot-item").html(name); //make it title
    var newplot = document.createElement("div"); //make another div
    $(newplot).addClass("chart timeplot-item"); //make it a chart
    $(newplot).prop('id',name); //call it appropriate name
    $(newtitle).appendTo($(newb)); //add into sbs div
    $(newplot).appendTo($(newb)); //add into sbs div
    plots.push({'name':name,'plot':newb,'min':min, 'max':max, 'datapoints':datapoints});  //add entry to array.
}

// Function that builds timeplots
var plot_handlers = new Array();
function build_plots(){
    var rows,cols;
    //figure out how many rows and columns of plots
    switch (true){
        case plots.length == 4:
            rows = 2;
            cols = 2;
            break;
        case plots.length == 3:
            rows = 1;
            cols = 3;
            break;
        case plots.length>4:
            rows = Math.ceil(plots.length/3);
            cols = 3;
    }
    var plot_count = 0

    // Start constructing the html
    for (var i=0; i<rows;i++){
        // Think of this like building a grid
        var new_row = document.createElement("div"); // build div
        $(new_row).addClass("row row-centered"); // define that div as a row
        var new_col = document.createElement("div"); // create columns div for that row
        $(new_col).addClass("col-md-12"); // make a column based off of css library
        $(new_col).appendTo($(new_row)); // attach that column to the row
        for (var j=0; j<cols; j++){ // for however many columns are necessary for that row
            if (plot_count < plots.length){ 
                $(plots[plot_count]['plot']).appendTo($(new_col));
                plot_count=plot_count+1;
            }
        }
        $(new_row).appendTo($("#main_area"));   
    }
    //angle =new LWChart("Angle","red",[-100, 100],175,PLOT_HEIGHT,PLOT_WIDTH,datapoints);
    for (var i=0; i<plot_count;i++){
        var name = plots[i]['name'];
        var min = plots[i]['min'];
        var max = plots[i]['max'];
        var datapoints = plots[i]['datapoints'];
        plot_handlers[name] = new LWChart(name,"red",[min,max],PLOT_HEIGHT,PLOT_WIDTH,datapoints);
    }
};

function LWChart(div_id,color,y_range,height,width,vals){
    this.div_id = div_id;
    this.color = color;
    this.y_range_orig = y_range.slice(0); //used for reset mechanisms.
    this.y_range = y_range;
    this.vals = vals;
    this.margin = {top: 20, right: 30, bottom: 30, left: 40};
    this.data = d3.range(this.vals).map(function() { return 0; });
    this.height = height - this.margin.top - this.margin.bottom;
    this.width = width - this.margin.right - this.margin.left;
    this.setup = function(){
        this.chart = d3.select("#"+this.div_id).append("svg")
        .attr("id","svg_for_"+this.div_id).attr("width",width).attr("height",height).attr('style',"display:inline-block;").attr("class", "gsc");
        this.y = d3.scale.linear().domain([this.y_range[0],this.y_range[1]]).range([this.height,0]);
        this.x = d3.scale.linear().domain([0,this.vals-1]).range([0,this.width]);
        this.x_axis = d3.svg.axis().scale(this.x).orient("bottom").ticks(20);
        this.y_axis = d3.svg.axis().scale(this.y).orient("left").ticks(11);
        this.x_grid = d3.svg.axis().scale(this.x).orient("bottom").ticks(20).tickSize(-this.height, 0, 0).tickFormat("");
        this.y_grid = d3.svg.axis().scale(this.y).orient("left").ticks(11).tickSize(-this.width, 0, 0).tickFormat("");
        this.chart.append("g").attr("transform","translate("+this.margin.left +","+ this.margin.top + ")");
        this.chart.append("g").attr("class", "x axis")
        .attr("transform","translate("+this.margin.left+","+(this.height+this.margin.top)+")").call(this.x_axis);
        this.chart.append("g").attr("class", "y axis").attr("transform","translate("+this.margin.left+","+this.margin.top+")").call(this.y_axis);
        this.chart.append("g").attr("class", "grid")
        .attr("transform","translate("+this.margin.left+","+(this.height+this.margin.top)+")").call(this.x_grid);
        this.chart.append("g").attr("class", "grid").attr("transform","translate("+this.margin.left+","+this.margin.top+")").call(this.y_grid);
        this.line = d3.svg.line().x(function(d, i) { return this.x(i)+this.margin.left; }.bind(this)).
        y(function(d, i) { return this.y(d)+this.margin.top; }.bind(this));
        this.clip_id = "clipper_"+this.div_id;
        this.clipper = this.chart.append("clipPath").attr("id", this.clip_id)
        .append("rect").attr("x",this.margin.left).attr("y",this.margin.top)
        .attr("width",this.width).attr("height",this.height);
        this.trace = this.chart.append("g").append("path").datum(this.data).attr("class","line")
        .attr("d",this.line).attr("clip-path", "url(#"+this.clip_id+")");
        };
    this.setup();
    //console.log(this.div_id);
    $("#"+this.div_id).prepend("<div class ='button_container' id = \""+this.div_id+"BC2\" >");
    $("#"+this.div_id+"BC2").append("<button class='scaler' id=\""+this.div_id+"VP\">Z+</button><br>");
    $("#"+this.div_id+"BC2").append("<button class='scaler' id=\""+this.div_id+"RS\">RS</button><br>");
    $("#"+this.div_id+"BC2").append("<button class='scaler' id=\""+this.div_id+"VM\">Z-</button><br>");
    $("#"+this.div_id).prepend("<div class ='button_container' id = \""+this.div_id+"BC1\" >");
    $("#"+this.div_id+"BC1").append("<button class='scaler' id=\""+this.div_id+"OI\">O+</button><br>");
    $("#"+this.div_id+"BC1").append("<button class='scaler' id=\""+this.div_id+"OD\">O-</button><br>");
    this.step = function(value){
            this.data.push(value);
            this.trace.attr("d",this.line).attr("transform",null).transition().duration(2).ease("linear").attr("transform","translate("+this.x(-1)+",0)");
            this.data.shift();
    };
    this.update = function(){
        d3.select("#svg_for_"+this.div_id).remove();
        this.setup();
    };
};
