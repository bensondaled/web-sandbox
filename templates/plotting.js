class Chart {
    
    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;
        // create the chart
        this.draw();
    }
    
    draw() {
        // define width, height and margin
        this.width = this.element.offsetWidth;
        this.height = this.width / 2;
        this.margin = {
            top: 20,
            right: 75,
            bottom: 45,
            left: 50
        };

        // set up parent element and SVG
        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg');
        svg.attr('width',  this.width);
        svg.attr('height', this.height);

        // we'll actually be appending to a <g> element
        this.plot = svg.append('g')
            .attr('transform',`translate(${this.margin.left},${this.margin.top})`);

        // create the other stuff
        this.createScales();
        this.addAxes();
        this.addLine();
    }
    
    createScales() {
        // shorthand to save typing later
        const m = this.margin;
        
        // calculate max and min for data
        const xExtent = d3.extent(this.data, d => d[0]);
        const yExtent = d3.extent(this.data, d => d[1]);

        // force zero baseline if all data points are positive
        if (yExtent[0] > 0) { yExtent[0] = 0; };

        this.xScale = d3.scaleTime()
            .range([0, this.width-m.right])
            .domain(xExtent);

        this.yScale = d3.scaleLinear()
            .range([this.height-(m.top+m.bottom), 0])
            .domain(yExtent);
    }

    addAxes() {
        const m = this.margin;

        // create and append axis elements
        // this is all pretty straightforward D3 stuff
        const xAxis = d3.axisBottom()
            .scale(this.xScale)
            .ticks(d3.timeMonth);

        const yAxis = d3.axisLeft()
            .scale(this.yScale)
            .tickFormat(d3.format("d"));

        this.plot.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0, ${this.height-(m.top+m.bottom)})`)
            .call(xAxis);

        this.plot.append("g")
            .attr("class", "y axis")
            .call(yAxis)
    }
    
    addLine() {
        const line = d3.line()
            .x(d => this.xScale(d[0]))
            .y(d => this.yScale(d[1]));

        this.plot.append('path')
            // use data stored in `this`
            .datum(this.data)
            .classed('line',true)
            .attr('d',line)
            // set stroke to specified color, or default to red
            .style('stroke', this.lineColor || 'red');
    }
    
    // the following are "public methods"
    // which can be used by code outside of this file

    setColor(newColor) {
        this.plot.select('.line')
            .style('stroke', newColor);
        
        // store for use when redrawing
        this.lineColor = newColor;
    }

    setData(newData) {
        this.data = newData;

        // full redraw needed
        this.draw();
    }
}

// ------

class Plot {
    
    constructor(opts) {
        this.data = opts.data;
        this.element = opts.element;

        this.xvar = 'deaths_2019_all_ages';
        this.yvar = 'deaths_2020_all_ages';

        // create the chart
        this.draw();
    }

    draw() {
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

        //this.element.innerHTML = '';
        this.svg = d3.select(this.element)
            .append('svg')
            .attr('width', svg_dims.width)
            .attr('height', svg_dims.height)
            .attr("transform", "translate(" + svg_margin.left + "," + svg_margin.top + ")")
            .call(d3.zoom().on('zoom', this.onZoom.bind(this)));

        this.svg.append("rect")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("fill", "pink");

        this.axes = this.svg.append('g')
            .attr('width', this.dims.width)
            .attr('height', this.dims.height)
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        this.axes.append("rect")
            .attr("width", this.dims.width)
            .attr("height", this.dims.height)
            .attr("fill", "grey");
        var clip = this.axes.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("id", "clip-rect")
            .attr("x", "0")
            .attr("y", "0")
            .attr('width', this.dims.width)
            .attr('height', this.dims.height);

        // create the other stuff
        this.createScales();
        this.addAxes();
        this.drawData();
    }

    createScales() {
        
        // calculate max and min for data
        const xExtent = d3.extent(this.data, d => d[this.xvar]);
        const yExtent = d3.extent(this.data, d => d[this.yvar]);

        // force zero baseline if all data points are positive
        if (yExtent[0] > 0) { yExtent[0] = 0; };

        this.x_scale = d3.scaleLinear()
            .domain(xExtent)
            .range([ 0, this.dims.width ]);

        this.y_scale = d3.scaleLinear()
            .domain(yExtent)
            .range([ this.dims.height, 0]);
    }

    addAxes() {

      this.xAxis = d3.axisBottom()
            .scale(this.x_scale)
            .tickFormat(d3.format('d'));

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
          .attr("cx", function (d) { return xsc(d[xvar]); } )
          .attr("cy", function (d) { return ysc(d[yvar]); } )
          .attr("r", 5.5)
          .style("fill", "#69b3a2")
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
             .attr("cx", function(d) {
                           return new_x_scale(d[xvar])
                         })
             .attr("cy", function(d) {
                           return new_y_scale(d[yvar])
                         });
         }

}
