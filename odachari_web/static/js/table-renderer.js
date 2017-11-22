var charts = {};
function TableRenderer(elementId) {
   var chart = charts[elementId];
   if (!chart) {
      chart = new _TableRenderer(elementId);
      charts[elementId] = chart;
   }

   return chart;
}

function _TableRenderer(elementId) {
   this.elementId = elementId;
   this.element = document.getElementById(elementId);
   this.setScopeElementId = function(id) {
      try {
         this.scope = angular.element(document.getElementById(id)).scope();
      }catch(e) {
         console.warn("angularのスコープがない");
      }
   }
   this.addData = function(json, direction) {
      var data = JSON.parse(json);
      var table = this.addTable(data);
      if (direction < 0) {
         this.element.insertBefore(table, this.element.firstChild);
      }else if (direction > 0) {
         this.element.appendChild(table);
      }
   }
   this.setData = function(json) {
      this.clear();
      var data = JSON.parse(json);
      var table = this.addTable(data);
      this.element.appendChild(table);
   }
   this.clear = function() {
      this.element.innerHTML = "";
   }
   this.addTable = function(data) {
      var table = document.createElement("table");
      table.className = "table-renderer";
      //header
      var _header = document.createElement("thead");
      var header = document.createElement("tr");
      _header.appendChild(header);
      table.appendChild(_header);
      for (var i = 0; i < data.columns.length; i ++) {
         var th = document.createElement("th");
         th.innerText = data.columns[i];
         th.width = data.sizes[i] + "%";
         header.appendChild(th);
      }
      for (var i = 0; i < data.datas.length; i ++) {
         var s = this.scope;
         (function(d){
            var tr = document.createElement("tr");
            tr.classList.add(d.class);
            var click = d.click;
             console.log(d);
            for (var ii = 0; ii < d.data.length; ii ++) {
               var td = document.createElement("td");
               td.innerText = d.data[ii];
               tr.appendChild(td);
            }
//             console.log(d);
            tr.addEventListener("click", function() {
               try {
                  s.openModal(click.type, click.id);
               }catch(e) {
                  console.warn("スコープエレメントが見つかりません");
               }
            });
            table.appendChild(tr);
         })(data.datas[i]);
      }
      var foot = document.createElement("tfoot");
      for (var i = 0; i < data.additions.length; i ++) {
         var addition = data.additions[i];
         var tr = document.createElement("tr");
         var title = document.createElement("td");
         var value = document.createElement("td");
         value.colSpan = data.columns.length - 1;

         title.innerText = addition[0];
         value.innerText = addition[1];
         tr.appendChild(title);
         tr.appendChild(value);
         foot.appendChild(tr);
      }
      table.appendChild(foot);
      return table;
   }
}