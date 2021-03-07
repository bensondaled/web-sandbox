class Plot {
    
    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;

        this.xvar = opts.xvar;
        this.yvar = opts.yvar;

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
            //svg_dims = {width: x - svg_margin.left - svg_margin.right,
            //            height: y - svg_margin.top - svg_margin.bottom},
            svg_dims = {width: x - 100,
                        height: y - 100},
            svg_margin = {top: 5, bottom: 0, left: 5, right: 0};
        this.margin = {top: 100, bottom: 100, left: 50, right: 50},
        this.dims = {width: svg_dims.width - this.margin.left - this.margin.right,
                     height: svg_dims.height - this.margin.top - this.margin.bottom};

        this.svg = d3.select(this.element)
            .append('svg')
            .attr('width', svg_dims.width)
            .attr('height', svg_dims.height)
            .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")
            .call(d3.zoom().on('zoom', this.onZoom.bind(this)));

        this.svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", 'lightgrey');

        this.axes = this.svg.append('g')
            .attr('width', this.dims.width)
            .attr('height', this.dims.height)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        this.axes.append("rect")
            .attr("width", this.dims.width)
            .attr("height", this.dims.height)
            .attr("fill", 'white');
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
        yExtent[0] = yExtent[0] - 1000;
        yExtent[1] = yExtent[1] + 1000;
        console.log(yExtent);
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
            .tickFormat(d3.timeFormat("%m-%d"));

      this.yAxis = d3.axisLeft()
            .scale(this.y_scale)
            .tickFormat(d3.format('d'));
      
      this.x_axis = this.svg.append('g')
          .attr("transform", "translate(" + this.margin.left + "," + (this.dims.height + this.margin.top) + ")")
          //.attr("class", "x axis")
          .call(this.xAxis);

      this.y_axis = this.svg.append('g')
          .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
          //.attr("class", "y axis")
          .call(this.yAxis);
    }

    drawData() {
      var xsc = this.x_scale;
      var ysc = this.y_scale;
      var xvar = this.xvar;
      var yvar = this.yvar;
      
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
           var new_x_scale = d3.event.transform.rescaleX(this.x_scale);
           var new_y_scale = d3.event.transform.rescaleY(this.y_scale);
            
           this.x_axis.transition()
             .duration(0)
             .call(this.xAxis.scale(new_x_scale));

           this.y_axis.transition()
             .duration(0)
             .call(this.yAxis.scale(new_y_scale));
           
         
          var xvar = this.xvar;
          var yvar = this.yvar;
          this.scatter
             .attr("cx", function(d)
                          { return new_x_scale(this.parseDate(d[xvar])); }
                      .bind(this))
             .attr("cy", function(d) {
                           return new_y_scale(d[yvar])
                         });
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
