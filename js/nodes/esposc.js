

NodeLibrary.push({
    nodetype: 'input/osc',
    nodeclass: "ModuleExternalInputOSC",
    nodegenerateheader: function(node)
    {
        var node_class = "ModuleExternalInput";
        return (node_class + " *" + lowCaseFirst(node.nodeinletvalue.sample[1]) + " = new " + node_class + "(" + '"/' + node.nodeinletvalue.sample[1] + '"' + "," +  'inputManager' + ");\n");
    },
    nodegeneratesetup: function(key,node)
    {
        return "";
    },
    nodegenerateconn: function(conn, node)
    {
        return ( lowCaseFirst(conn.inlet_class_alias) + "->" + conn.inlet_alias.toLowerCase() + " =" + " " + lowCaseFirst(node.nodeinletvalue.sample[1])  + ";\n");
    },
    rpdnode: {
        title: 'OSC ~ Input',
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


Rpd.noderenderer('input/osc', 'html', function(){
    var valInput;
    
    return  {
    first: function(bodyElm) {

        valInput = document.createElement('input');
        valInput.style.width = '70px';
        valInput.placeholder = '/osc1'
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
                    { default: function() {  return "Sample1"; },
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


