Vue.component('query-statistic', {
  props: ['alias', 'file'],
  data: function () {
    return {
      data: "",
      timer: "",
      chart: ""
    }
  },
  mounted: function() {
    var self = this;
    self.fetchFile(self.file);
    self.timer = setInterval(function() {
      self.fetchFile(self.file)
    }, 30000);
  },
  methods: {
    fetchFile: function(file) {
      var self = this;
      console.log(file);
      d3.json(file).then(function(response){
        self.data = (response[0][self.alias]);
        console.log(self.data);
      });
      }
    },
  template: '<span>{{ data }}</span>'
})

Vue.component('query-graph', {
  props: ['alias', 'file', 'type', "xtitle", "ytitle"],
  data: function () {
    return {
      data: "",
      timer: "",
      chart: ""
    }
  },
  mounted: function() {
    var self = this;
    self.fetchFile(self.file);
    self.timer = setInterval(function() {
      self.fetchFile(self.file)
    }, 3000);
  },
  methods: {
    fetchFile: function(file) {
      var self = this;
      d3.json(self.file).then(function(response) {
        var result = response;
        if(self.type === "bar") {
          drawBar(result);
        }
      });

      function drawBar(data) {
        console.log(data);
        var arr = data.map(function(d) { return d.X; });
        console.log(arr);

        var element = document.getElementsByClassName(self.alias);
        
        while (element[0].firstChild) {
          element[0].removeChild(element[0].firstChild);
        }
        console.log(element);
        
        var cl = "img-fluid " + self.alias + "Chart";
        element[0].innerHTML += '<svg class="' + cl + '"> </svg>';
        self.chart = document.getElementsByClassName(self.alias + "Chart")[0];

        var margin = {top: 20, right: 30, bottom: 100, left: 60},
          width = document.getElementsByClassName(self.alias)[0].offsetWidth - margin.left - margin.right,
          height = document.getElementsByClassName(self.alias)[0].offsetHeight - margin.top - margin.bottom;

        var x = d3.scaleBand()
          .range([0, width])
          .padding(0.1);

        var y = d3.scaleLinear()
          .range([height, 0]);

        var xAxis = d3.axisBottom()
          .scale(x);

        var yAxis = d3.axisLeft()
          .scale(y)
          .ticks(10, "d");

        var chart = d3.select("." + self.alias + "Chart")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          x.domain(data.map(function(d) { return d.X; }));
          y.domain([0, d3.max(data, function(d) { return d.Y; })]);
        
        chart.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");
	
        chart.append("g")
	  .attr('transform', 'translate(' + -40 + ', ' + (height / 2) + ')')
	  .append('text')
	  .attr('text-anchor', 'middle')
	  .attr('transform', 'rotate(-90)')
	  .text(self.ytitle);

        chart.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end");

	chart.append("g")
	  .attr('transform', 'translate(' + (width / 2)   + ', ' + (height + 60) + ')')
	  .append('text')
	  .attr('text-anchor', 'middle')
	  .text(self.xtitle);

       /*var line = d3.line()
	  .defined(d => !isNaN(d.value))
	  .x(d => x(d.X))
	  .y(d => y(d.Y))

	     console.log("Right before line");
	      console.log(line);

       /* chart.append("path")
	  .datum(data)
	  .attr("fill", "none")
	  .attr("stroke", "#d64933")
	  .attr("stroke-width", 1.5)
	  .attr("stroke-linejoin", "round")
	  .attr("stroke-linecap", "round")
	  .attr("d", line);*/

        chart.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d.X); })
          .attr("y", function(d) { return y(d.Y); })
          .attr("height", function(d) { return height - y(d.Y); })
          .attr("width", x.bandwidth());       
      }
    }
  },
  template: '<p>{{ chart }}</p>'
})

Vue.component('drawmap', {
  props: ['alias', 'file', 'type'],
  data: function () {
    return {
      data: "",
      timer: "",
      chart: ""
    }
  },
  mounted: function() {
    var self = this;
    self.fetchFile(self.file);
    /*self.timer = setInterval(function() {
      self.fetchFile(self.file)
    }, 60000);*/
  },
  methods: {
    fetchFile: function(file) {
      var self = this;
      var formatNumber = d3.format(",.0f");

      var element = document.getElementsByClassName(self.alias);
      while (element[0].firstChild) {
	      console.log("In while loop: " + element[0]);
        element[0].removeChild(element[0].firstChild);
      }
      console.log(element);

      var cl = "img-fluid " + self.alias + "Chart";
      element[0].innerHTML += '<svg class="' + cl + '"> </svg>';
      self.chart = document.getElementsByClassName(self.alias + "Chart")[0];

      var width = document.getElementsByClassName(self.alias)[0].offsetWidth,
          height = document.getElementsByClassName(self.alias)[0].offsetHeight;

      var svg = d3.select("." + self.alias + "Chart")
	  .attr("width", width)
	  .attr("height", width / 2.14)
	    //.attr("width", $(".container-fluid").width())
	  //.attr("height", $(".container-fluid").width() / 2.14)

      var projection = d3.geoEquirectangular()
      .center([0, 0])
      .scale([width / (2 * Math.PI)])
      .translate([width / 2, width / 4]);
      //.scale([($(".container-fluid").width() / (2 * Math.PI))])
      //.translate([$(".container-fluid").width() / 2, $(".container-fluid").height() / 2]);

      var path = d3.geoPath()
         .projection(projection);

      var countryCount = d3.csv(file, function(data) {
        return {
	  Code: data.Code,
	  Count: +data.Count
        };
      });

      var countries = d3.json("/js/map-data/countries.json", function(error, data) {
        if (error) throw error;
      });

      countryCount.then(function(count) {
        countries.then(function(data) {
	  console.log("Count data: ");
	  console.log(count);
	  console.log("Map data: ");
	  console.log(data);

	  var kvArray = [];
	  var maxCount = count[0].Count;
	  var minCount = count[0].Count;
	  for (i = 0; i < count.length; i++) {
            kvArray.push([count[i].Code, count[i].Count]);
	    if (maxCount < count[i].Count) maxCount = count[i].Count;
	    if (minCount > count[i].Count) minCount = count[i].Count;
	  }
	  console.log(minCount);
	  console.log(maxCount);
          var color = d3.scaleLog()
	  .domain([minCount, maxCount])
          .range(["yellow","red"]);
	  var mapCountryCount = new Map(kvArray);
          var countriesProperties = topojson.feature(data, data.objects.countries).features;
	  for (i = 0; i < countriesProperties.length; i++) {
	    countriesProperties[i].properties.Count = mapCountryCount.get(countriesProperties[i].properties.Code);
	  }

	  console.log(countriesProperties);

          svg.append("g")
             .attr("class", "countries")
            .selectAll("path")
            .data(countriesProperties)
            .enter().append("path")
             .attr("d", path);

	  svg.append("g")
	     .attr("class", "circles")
	    .selectAll("path")
            .data(countriesProperties)
	    .enter().append("circle")
	      .attr("fill", function (d) { return color(d.properties.Count)})
	      .attr("fill-opacity", 0.5)
	      .attr("stroke", "#fff")
	      .attr("stroke-width", 0.5)
	      .attr("transform", d => `translate(${path.centroid(d)})`)
	      .attr("r", function (d) { return Math.log10(d.properties.Count) * 2.5 })
	    .append("title")
	      .text(function (d) { return d.properties.Name + "\n" + formatNumber(d.properties.Count); });
        });
      });
    }
  },
  template: '<p>{{ chart }}</p>'
})


var app = new Vue({
  el: "#queryApp",
  data: {
    query: "",
    results: [],
    headers: [],
    hash: "#dashboard",
  },
  methods: {
    runQuery: function() {
      var self = this;
      jQuery.ajax({
        type: "GET",
        url: "ajaxfile.php",
        data: {
          query: this.query
        },
        dataType: "json"
      })
      .done(function(response) {
        self.headers = [];
        self.results = [];
        for (var header in response[0]) {
          if(response[0].hasOwnProperty(header)) {
            console.log(response);
            console.log(header);
            self.headers.push(header);
          }
        }
        self.results = response
      });    
    }
  }
})
