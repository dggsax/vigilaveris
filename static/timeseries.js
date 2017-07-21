function Time_Series(div_id,title,width,height,x_range,y_range,num_traces,colors, unique, socket=null){
    var div_id = div_id;
    var title = title;
    var unique = unique;
    var socket = socket;
    var colors = colors;
    var y_range_orig = y_range.slice(0); //used for reset mechanisms.
    var vals_orig = x_range;
    var y_range = y_range.slice(0);
    var num_traces = num_traces;
    var vals = x_range;
    var total_height = height;
    var xchange = false;
    var margin = {top: 20, right: 30, bottom: 30, left: 40};
    var data = [];
    for (var i = 0; i<num_traces; i++){
        data.push(d3.range(vals).map(function() { return 0; }));
    }
    var height = total_height - margin.top - margin.bottom;
    var total_width = width;
    var width = total_width - margin.right - margin.left;
    var overall = $("#"+div_id).append("<div id=\""+div_id+unique+"_overall\">");
    var title_div = $("#"+div_id+unique+"_overall").append("<div class=\"plot_title\" id=\""+div_id+unique+"_title\">"+title+"</div>");
    var top_row = $("#"+div_id+unique+"_overall").append("<div class=\"chart\" id=\""+div_id+unique+"top\">");
    var bottom_row = $("#"+div_id+unique+"_overall").append("<div class=\"chart\" id=\""+div_id+unique+"bot\">");
    var line;
    var traces;
    

    var x_axis;
    var y_axis;
    var x;
    var y;
    var x_grid;
    var y_grid;
    var chart;
    var chartBody;
    
    var draw_plot_region = function(){
        console.log("drawing plot for "+unique);
        if (xchange){
            xchange = false;
            if (vals> data[0].length){//increasing amount
                for (var i = 0; i<num_traces;i++){
                    var tempdata = d3.range(vals-data[i].length).map(function() { return 0; });
                    data[i] = tempdata.concat(data[i]);
                }
            }else if (vals< data[0].length){
                var to_remove = data[0].length-vals;
                for(var i =0; i<num_traces; i++){
                    data[i] = data[i].slice(-vals);
                }
            }
        }
        chart = d3.select("#"+div_id+unique+"top").append("svg")
        .attr("id","svg_for_"+div_id+unique).attr("width",total_width).attr("height",total_height).attr('style',"display:inline-block;").attr("class", "gsc");
        y = d3.scale.linear().domain([y_range[0],y_range[1]]).range([height,0]);
        x = d3.scale.linear().domain([0,vals-1]).range([0,width]);
        x_axis = d3.svg.axis().scale(x).orient("bottom").ticks(11);
        y_axis = d3.svg.axis().scale(y).orient("left").ticks(11);
        x_grid = d3.svg.axis().scale(x).orient("bottom").ticks(20).tickSize(-height, 0, 0).tickFormat("");
        y_grid = d3.svg.axis().scale(y).orient("left").ticks(11).tickSize(-width, 0, 0).tickFormat("");
        chart.append("g").attr("transform","translate("+margin.left +","+ margin.top + ")");
        chart.append("g").attr("class", "grid").attr("transform","translate("+margin.left+","+(height+margin.top)+")").call(x_grid);
        chart.append("g").attr("class", "grid").attr("transform","translate("+margin.left+","+margin.top+")").call(y_grid);
        clippy = chart.append("defs").append("svg:clipPath").attr("id",div_id+unique+"clip").append("svg:rect").attr("id",div_id+unique+"clipRect").attr("x",margin.left).attr("y",margin.top).attr("width",width).attr("height",height);
        chartBody = chart.append("g").attr("clip-path","url(#"+div_id+unique+"clip"+")");
        line = new d3.svg.line().x(function(d, i) { return x(i)+margin.left; }.bind(this)).y(function(d, i) { return y(d)+margin.top; }.bind(this));
        traces = [];
        console.log(line);
        for (var i=0; i<num_traces; i++){
            traces.push(chartBody.append("path").datum(data[i]).attr("class","line").attr("d",line).attr("stroke",colors[i]));
        }
        chart.append("g").attr("class", "x axis").attr("transform","translate("+margin.left+","+(height+margin.top)+")").call(x_axis).selectAll("text")
        .attr("y", -5).attr("x", 20).attr("transform", "rotate(90)");
        chart.append("g").attr("class", "y axis").attr("transform","translate("+margin.left+","+margin.top+")").call(y_axis);
    };
    draw_plot_region();
    $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC2\" >");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VP\">Z+</button>");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VRS\">RS</button>");
    $("#"+div_id+unique+"BC2").append("<button class='scaler' id=\""+div_id+unique+"VM\">Z-</button>");
    $("#"+div_id+unique+"top").prepend("<div class ='v_button_container' id = \""+div_id+unique+"BC1\" >");
    $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OI\">O+</button>");
    $("#"+div_id+unique+"BC1").append("<button class='scaler' id=\""+div_id+unique+"OD\">O-</button>");
    $("#"+div_id+unique+"bot").append("<div class ='h_button_container' id = \""+div_id+unique+"BC4\" >");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HM\">Z-</button>");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HRS\">RS</button>");
    $("#"+div_id+unique+"BC4").append("<button class='scaler' id=\""+div_id+unique+"HP\">Z+</button>");
    this.step = function(values){
            //this.trace.attr("d",this.line).attr("transform",null).transition().duration(0).ease("linear").attr("transform","translate("+this.x(-1)+",0)");
            for (var i=0; i<values.length; i++){
                traces[i].attr("d",line).attr("transform",null);
                for (var j=0; j<values[i].length;j++){
                    data[i].push(values[i][j]);
                    data[i].shift();
                }
            }
    };
    var steppo = this.step;
    var update_scales = function(){
        d3.select("#svg_for_"+div_id+unique).remove();
        draw_plot_region();
    };
    // Updating!
    if (socket != null){
        socket.on("update_"+unique,function(values){steppo(values);});
    }
    // Ticker thangs
    $("#"+div_id).on("click",function(event){
        console.log(event.target.id);
        switch(event.target.id){
            case div_id+unique+"VM": 
                var parent_range = y_range[1] - y_range[0];
                var parent_mid = (y_range[1] - y_range[0])/2 + y_range[0];
                y_range[1] = (y_range[1] - parent_mid)*2+parent_mid;
                y_range[0] = parent_mid-(parent_mid - y_range[0])*2;
                update_scales();
                break;
            case div_id+unique+"VP":
                var parent_range = y_range[1] - y_range[0];
                var parent_mid = (y_range[1] - y_range[0])/2 + y_range[0];
                y_range[1] = (y_range[1] - parent_mid)*0.5+parent_mid;
                y_range[0] = parent_mid-(parent_mid - y_range[0])*0.5;
                update_scales();
                break;
            case div_id+unique+"VRS":
                y_range =y_range_orig.slice(0);
                update_scales();
                break;
            case div_id+unique+"HM":
                if (vals >4){
                    vals = Math.round(vals/2);
                }
                xchange = true;
                update_scales();
                break;
            case div_id+unique+"HP":
                vals = vals*2;
                xchange = true;
                update_scales();
                break;
            case div_id+unique+"HRS":
                vals =vals_orig;
                xchange = true;
                update_scales();
                break;
            case div_id+unique+"OD":
                var diff = y_range[1] - y_range[0];
                var tp = diff*0.1;
                y_range[1] = y_range[1]+tp;
                y_range[0]=y_range[0]+tp;
                update_scales();
                break;
            case div_id+unique+"OI":
                var diff = y_range[1] - y_range[0];
                var tp = diff*0.1;
                y_range[1] = y_range[1]-tp;
                y_range[0] = y_range[0]-tp;
                update_scales();
                break;
        }
    });
};

