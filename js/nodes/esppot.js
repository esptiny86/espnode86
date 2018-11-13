

NodeLibrary.push({
    nodetype: 'input/potentiometer',
    nodeclass: "ModuleExternalInputPOT",
    nodegenerateheader: function(node)
    {
        var node_class = node.nodeclass;
        return ("ModuleExternalInput * pot" + lowCaseFirst(node.nodeinletvalue.sample[1]) + " = new ModuleExternalInput" + "("  + node.nodeinletvalue.sample[1] + "," +  'inputManager' + ");\n");
    },
    nodegeneratesetup: function(key,node)
    {
        return "";
    },
    nodegenerateconn: function(conn, node)
    {
        return ( lowCaseFirst(conn.inlet_class_alias) + "->" + conn.inlet_alias.toLowerCase() + " =" + " pot" + lowCaseFirst(node.nodeinletvalue.sample[1])  + ";\n");
    },
    rpdnode: {
        title: 'Potentio ~ Input',
        inlets:  { 
            'sample': { type: 'espnode/string', hidden: true },
        },
        outlets: { 
            'out': { type: 'espnode/string'},
        },
        process: function(inlets) {
            // return { 'number': inlets['user-value'] };
        }
    }
});


Rpd.noderenderer('input/potentiometer', 'html', function(){
    var valInput;
    
    return  {
    first: function(bodyElm) {

        valInput = document.createElement('input');
        valInput.style.width = '70px';
        valInput.placeholder = '0'
        // valInput.style.height = '100px';
        valInput.style.color = "#000";
        valInput.style.background = "#CCC";
        // valInput.style.fontSize = "1.25em";
        // valInput.style.padding = "1em";
        valInput.style.fontFamily = "'PT Mono', 'Andale Mono', 'Fira mono', 'Menlo', sans-serif;";

        // valInput.type = 'number';
        // valInput.min = 0;
        // valInput.max = 1000;
        bodyElm.appendChild(valInput);

          
        return { 'sample':
                    { default: function() {  return "0"; },
                      valueOut: Kefir.fromEvents(valInput, 'change')
                                     .map(function() { return (valInput.value); })
                    }
               };
    },
    always: function(bodyElm, inlets, outlets) {
        // console.log(inlets)
        valInput.value = (inlets["sample"]);
    },   
}});


