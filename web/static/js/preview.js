var PLOT_WIDTH = 300;
var PLOT_HEIGHT = 175;
var HEADROOM_PRESENT = false;

var ALREADY_BUILT = false;
var TOGGLE_PARAM = '';

// Function that generates sliders
var sliders = new Array();
function slider_generate(name,min,max,resolution){
    var newb = document.createElement("div"); 
    $(newb).addClass('col-md-3');
    $(newb).attr('id','my_num_row');
    $(newb).append('<label class="element-label" for="'+name+'">'+name+':</label>');
    $(newb).append('<span><input type="range" name="'+name+'" id="'+name+'" value="0" min="'+min+'" max="'+max+'" step='+resolution+' class="paramSlider"></span>');
    $(newb).append('<i class="fa fa-sliders fa-2x" aria-hidden="true" id="' + name + '""></i>')
    sliders.push({'name': name, 'obj':newb});
}

// Function that generates plots
var plots = new Array();
function plot_generate(name,min,max,datapoints){
    var newb = document.createElement("div"); //create div
    $(newb).addClass("sbs"); //make it sbs
    var newtitle = document.createElement("div"); //make inside div
    $(newtitle).addClass("plot_title").html(name); //make it title
    var newplot = document.createElement("div"); //make another div
    $(newplot).addClass("chart"); //make it a chart
    $(newplot).prop('id',name); //call it appropriate name
    $(newtitle).appendTo($(newb)); //add into sbs div
    $(newplot).appendTo($(newb)); //add into sbs div
    plots.push({'name':name,'plot':newb,'min':min, 'max':max, 'datapoints':datapoints});  //add entry to array.
}

// Function that builds the sliders
function build_sliders(alt,csv){
    var total_rows = Math.ceil(sliders.length/3);
    var slider_count = 0;
    for (var i = 0; i < total_rows; i++){
      var new_row = document.createElement("div");
      $(new_row).addClass("row row-centered");
      var new_buffer1 = document.createElement("div");
      $(new_buffer1).addClass("col-md-1");
      $(new_row).append(new_buffer1);
      for (var j = 0; j<3; j++){
        if(slider_count < sliders.length){
          $(sliders[slider_count]['obj']).appendTo($(new_row));
          slider_count = slider_count+1;
        }
      }
      var new_buffer2 = document.createElement("div");
      $(new_buffer2).addClass("col-md-1");
      $(new_buffer2).appendTo($(new_row));
      $(new_row).appendTo($("#param_area")).trigger("create");         
    } 
};

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
        $(new_row).appendTo($("#plot_area"));   
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

/////////////////////
//                 //
//    Autopilot    //
//                 //
/////////////////////

$(document).on("mouseover", ".fa-sliders", function(){
    $(this).css("background-color","yellow")
});

$(document).on("mouseleave", ".fa-sliders", function(){
    $(this).css("background-color","initial");
});

$(document).on("click",".fa-sliders",function(){
    console.log(this.id);
    // console.log(this.parents());
    var settings = document.createElement("div");
    console.log(settings);

});


/////////////////////END OF AUTOPILOT/////////////////////

var datapoints = 100
var isActive;

$(document).on('pageinit', function() {
    isActive = true; //used for turning off plot updates when page not in focus
    window.onfocus = function () { 
      console.log("IN FOCUS");
      isActive = true; 
      $('.sbs').css('background-color',"#f9f9f9");
    }; 
    
    window.onblur = function () { 
      console.log("OUT OF FOCUS");
      isActive = false; 
      $('.sbs').css('background-color',"#ffde46");

    }; 

    //Handle sockets with server:
 
    var socket = io('http://localhost:3000');

    //Server sending socket containing list of valid serial ports:
    socket.on('serial list display', function(portlist){
        $("#serialport").children().remove().end();
        $.each(portlist, function (i, item) {
            $('#serialport').append($('<option>', { 
                value: i,
                text : item.comName 
            }));
            $('#serialport option[value='+i+']').prop('selected','selected').change();
        });
    });
    //Connect/Disconnect to Serial Port
    $('#connect').click(function(){
        console.log("esta lit");
        hootenanny();
        if($(this).text() != 'Connected (Click to Disconnect)'){
            socket.emit('serial connect request',{state: ALREADY_BUILT});
            $('#csv').val(0).slider('refresh');
            $('#alternator').val(0).slider('refresh');
            isActive = true;
        }else{
            socket.emit('serial disconnect request');
        }
    });
    //Update switch to connected or disconnected based on return socket from server
    socket.on('serial connected', function(){
        $('#connect').text('Connected (Click to Disconnect)');
    });
    socket.on('serial disconnected', function(){
        console.log("oh yeah disconnecting!");
        $('#connect').text('Disconnected (Click to Connect)');
    });
    socket.on('state toggle', function(val){
        console.log("toggling");
        $('#'+TOGGLE_PARAM).val(parseFloat(val)).slider('refresh');
    });

    $('#csv').change(function(){
        console.log("csv preference changed!");
        socket.emit('csv state', $(this).val())
    });
    $('#alternator').change(function(){
        console.log("desiring alternating!");
        socket.emit('alternate state', $(this).val());
    });

    //update serial port upon selection: 
    $('#serialport').change(function(){
    console.log("serialport selected");
        socket.emit('serial select', $('#serialport option:selected').text());
    });
    //upadte baud rate upon selection: 
    $('#baud').change(function(){
        socket.emit('baud select', $('#baud option:selected').text());
    });

    //#####################################################
    //##                                                 ##
    //##    THIS IS WHERE YOU MAKE THE PREVIEW HAPPEN    ##
    //##                                                 ##
    //#####################################################

    // Insert the stuff here
    // socket.on('startup',function(msg){
    function hootenanny(){
        var alt = false;
        var csv = false;
        //WIPE THE SLATE CLEAN:
        $("#plot_area").empty(); //do it this way because jquery needs to be cleaned properly
        $("#param_area").empty();
        sliders = new Array();
        plots = new Array();
        plot_handlers = new Array();
        //-------
        // msg = msg+''; //convert to string...stupid I know.
        msg = "&C&S~Gonzo~commname~0~69~5&A~Gonzo~2&S~Joe~commname~0~69~5&S~Wei~commname~0~100~1&S~Jesus~commname~3~5~1&S~Wow~commname~0~3~4&T~Hehe~U1~1~5&T~Joe~F4~0~100&T~Everything~U1~0~10&T~Help~U1~0~255&T~Wow~S4~2~5&"
        // msg = "&A~DesiredAngV~5&C&S~Direct~O~0~5.0~0.1&S~DesiredAngV~A~-1~1~0.1&T~AngleV~F4~0~2.5&T~BackEMF~F4~0~5&T~MCmd~F4~0~5&H~4&"
        var sets = msg.split("&");
        var duration = 100; //default
        for (var i = 0;  i < sets.length; i++){
            var test = sets[i].split("~");
            if (test[0] == "D"){
                duration = parseFloat(test[1]);
            }
        }

        for (var i = 0;  i < sets.length; i++){
            console.log(sets[i]);
            var test = sets[i].split("~");
            console.log(test);
            switch (test[0][0]){
                case "A":
                    alt=true;
                    TOGGLE_PARAM = test[1];
                    break;
                case "C":
                    csv=true;
                    break;
                case "S":
                    var name = test[1];
                    var lo = test[3];
                    var hi = test[4];
                    var res = test[5];
                    slider_generate(name,lo,hi,res);
                    break;
                case "T":
                    var name = test[1];
                    var lo = test[3];
                    var hi = test[4];
                    plot_generate(name,parseFloat(lo),parseFloat(hi),duration);
                    break;
                case "H":
                    HEADROOM_PRESENT = true;
                    break;
            }
        }
        build_sliders(alt,csv);
        build_plots();
        $('.paramSlider').change(function(){
            var message = 'change';
            console.log(message);
            socket.emit(message,{id: $(this).attr('id'), val:$(this).val()}); 
        }); 
        socket.emit('all set from gui');
        ALREADY_BUILT = true;
    };

    socket.on('setup slider', function(thing){
        $("#"+thing[0]).val(parseFloat(thing[1])).slider("refresh");
    })
    
    socket.on('note', function(msg) {
        if (isActive){
            if (HEADROOM_PRESENT){
                h = msg.pop();
                document.getElementById("headroom").innerHTML= "more than " + h.toString() + " microseconds";
            }
            for (var i =0; i<msg.length; i++){
                plot_handlers[plots[i]['name']].step(msg[i]);
            }
        }
    });

    $(document).on("click", ".scaler",function(){
        var parent = plot_handlers[$(this).parent().parent().attr("id")];
        //console.log($(this).attr("id"));
        var parid = $(this).parent().parent().attr("id")
        switch ($(this).attr("id")){
            case parid+"VM":
                var parent_range = parent.y_range[1] - parent.y_range[0];
                var parent_mid = (parent.y_range[1] - parent.y_range[0])/2 + parent.y_range[0];
                parent.y_range[1] = (parent.y_range[1] - parent_mid)*2+parent_mid;
                parent.y_range[0] = parent_mid-(parent_mid - parent.y_range[0])*2;
                break;
            case parid+"VP":
                var parent_range = parent.y_range[1] - parent.y_range[0];
                var parent_mid = (parent.y_range[1] - parent.y_range[0])/2 + parent.y_range[0];
                parent.y_range[1] = (parent.y_range[1] - parent_mid)*0.5+parent_mid;
                parent.y_range[0] = parent_mid-(parent_mid - parent.y_range[0])*0.5;
                break;
            case parid+"RS":
                parent.y_range =parent.y_range_orig.slice(0); 
                break;
            case parid+"OD":
                var diff = parent.y_range[1] - parent.y_range[0];
                var tp = diff*0.1;
                parent.y_range[1] = parent.y_range[1]+tp;
                parent.y_range[0]=parent.y_range[0]+tp;
                break;
            case parid+"OI":
                var diff = parent.y_range[1] - parent.y_range[0];
                var tp = diff*0.1;
                parent.y_range[1] = parent.y_range[1]-tp;
                parent.y_range[0] = parent.y_range[0]-tp;
                break;
        }
        parent.update();
    });
    $('.fa-sliders').hover(function() {
        $(this).css("background-color","yellow");
        console.log("hover");
    });

}); 

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