class Plot {
    
    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;

        this.xvar = opts.xvar;
        this.yvar = opts.yvar;

        this.labelSize = 25;
        this.svg_margin = {top: 5, bottom: 200, left: 50, right: 50}; // of svg canvas on page
        this.margin = {top: 100, bottom: 100, left: 100, right: 50}; // of plot within the svg

        // runtime
        this.zoomMode = [false, false]; // x, y
    }

    setup() {

        // reset the whole canvas each time you redraw
        this.element.innerHTML = '';

        var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight,
            svg_dims = {width: x - this.svg_margin.right - this.svg_margin.left,
                        height: y - this.svg_margin.bottom - this.svg_margin.top};
        this.dims = {width: svg_dims.width
                            - this.margin.left
                            - this.margin.right,
                     height: svg_dims.height
                             - this.margin.top
                             - this.margin.bottom};

        this.svg = d3.select(this.element)
            .append('svg')
            .attr('width', svg_dims.width)
            .attr('height', svg_dims.height)
            .attr("transform", "translate(" + this.svg_margin.left + "," + this.svg_margin.top + ")")
            .call(d3.zoom().on('zoom', this.onZoom.bind(this)));

        // to use x/y keys for x/y zoom
        d3.select('body').on('keydown', function(){
            switch (d3.event.key){
                case "y":
                    this.zoomMode[1] = true;
                    break;
                case "x":
                    this.zoomMode[0] = true;
                    break;
            }
        }.bind(this));
        d3.select('body').on('keyup', function(){
            switch (d3.event.key){
                case "y":
                    this.zoomMode[1] = false;
                    break;
                case "x":
                    this.zoomMode[0] = false;
                    break;
            }
        }.bind(this));

        this.svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", 'lightgrey') // useful for debugging position
            .style("opacity", 0.01);

        this.axes = this.svg.append('g')
            .attr('width', this.dims.width)
            .attr('height', this.dims.height)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        this.axes.append("rect")
            .attr("width", this.dims.width)
            .attr("height", this.dims.height)
            .attr("fill", 'white')
            .style("opacity", 0);

        var clip = this.axes.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr('width', this.dims.width)
            .attr('height', this.dims.height);

    }

    createScales() {
        
        // calculate max and min for data
        const xExtent = d3.extent(this.data, d =>
            this.parseDate(d[this.xvar]));
        // pad x axis boundary dates
        xExtent[0].setDate(xExtent[0].getDate()-5);
        xExtent[1].setDate(xExtent[1].getDate()+5);

        const yExtent = d3.extent(this.data, d => parseInt(d[this.yvar]));
        // pad y axis values
        yExtent[0] = yExtent[0] - 1;
        yExtent[1] = yExtent[1] + 1;
        // force zero baseline if all data points are positive
        //if (yExtent[0] > 0) { yExtent[0] = 0; };

        this.x_scale = d3.scaleTime()
            .domain(xExtent)
            .range([ 0, this.dims.width ]);

        this.y_scale = d3.scaleLinear()
            .domain(yExtent)
            .range([ this.dims.height, 0]);
    }

    addAxes() {

      this.xAxis = d3.axisBottom()
            .scale(this.x_scale)
            .tickFormat(d3.timeFormat("%b"));

      this.yAxis = d3.axisLeft()
            .scale(this.y_scale)
            .tickFormat(d3.format('d'))
            .ticks(4);
      
      this.x_axis = this.svg.append('g')
          .attr("transform", "translate(" + this.margin.left + "," + (this.dims.height + this.margin.top) + ")")
          //.attr("class", "x axis")
          .style("font-size", this.labelSize)
          .call(this.xAxis);

      this.y_axis = this.svg.append('g')
          .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
          //.attr("class", "y axis")
          .style("font-size", this.labelSize)
          .call(this.yAxis);
    }

    drawData() {
      var xsc = this.x_scale;
      var ysc = this.y_scale;
      var xvar = this.xvar;
      var yvar = this.yvar;
       
     this.line = this.axes.append('g')
       .append('path')
        .datum(this.data)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 4)
        .attr("d", d3.line()
               .x(function (d) { return xsc(this.parseDate(d[xvar])); }
                 .bind(this))
               .y(function(d) { return ysc(d[yvar]); })
             )
         .attr("clip-path", "url(#clip)");
      
      this.scatter = this.axes.append('g')
        .selectAll(".dot")
        .attr("class", "dot")
        .data(this.data)
        .enter()
        .append("circle")
          .attr("cx", function (d) 
              { return xsc(this.parseDate(d[xvar])); }
              .bind(this))
          .attr("cy", function (d) { return ysc(d[yvar]); } )
          .attr("r", this.dotR || 5.5)
          .style("fill", "black")
          .attr("clip-path", "url(#clip)");

    }

    onZoom() {

        var zoomX = this.zoomMode[0]==true | this.zoomMode[1]==false;
        var zoomY = this.zoomMode[1]==true | this.zoomMode[0]==false;

        var trans = d3.event.transform;
        var new_x_scale = trans.rescaleX(this.x_scale);
        var new_y_scale = trans.rescaleY(this.y_scale);

        if (zoomX){
           var use_x_scale = new_x_scale;
        }
        else{
           var use_x_scale = this.x_scale;
        }
        if (zoomY){
           var use_y_scale = new_y_scale;
        }
        else{
           var use_y_scale = this.y_scale;
        }

        var xvar = this.xvar;
        var yvar = this.yvar;

        this.x_axis.transition()
         .duration(0)
         .call(this.xAxis.scale(use_x_scale));

        this.y_axis.transition()
         .duration(0)
         .call(this.yAxis.scale(use_y_scale));


        this.scatter
         .attr("cx", function(d){ return use_x_scale(this.parseDate(d[xvar])); }.bind(this))
         .attr("cy", function(d) { return use_y_scale(d[yvar])});

        this.line
        .attr("d", d3.line()
        .x(function (d) { return use_x_scale(this.parseDate(d[xvar]));}.bind(this))
        .y(function(d) { return use_y_scale(d[yvar]); }.bind(this)));

     }

    refresh(){
        this.setup();
        this.createScales();
        this.addAxes();
        this.drawData();

    }

    setData(newData) {
        this.data = newData;
        this.refresh();
        
    }

    setR(r) {
          
        this.scatter.attr('r', r)
        
        // store for use when redrawing
        this.dotR = r;
    }

    parseDate(raw) {

        var parts = raw.split('-');
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10) - 1;
        var day = parseInt(parts[2], 10);
        var date = new Date(year, month, day);
        return date;

    }

}
