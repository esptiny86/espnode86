var espNodeContainer = [];
var espNodeClassContainer = [];
var espNodeClassConnection = [];
var espNodeCount = {};
var espNodePos = {};
var espRoot = "";

var espNodeReset = function()
{
    espNodeContainer = [];
    espNodeClassContainer = [];
    espNodeClassConnection = [];
    espNodeCount = {};
    espNodePos = {};
}

var exportSpec = {
    'network/add-patch': function(update) {
        espRoot = (update.patch);
        var patch = update.patch;
        return [ 'network/add-patch', patch.id, encodeURIComponent(patch.name) ];
    },
    'patch/open': function(update) {
        return update.parent ? [ 'patch/open', update.patch.id, update.parent.id ]
                             : [ 'patch/open', update.patch.id ];
    },
    'patch/close': function(update) {
        return [ 'patch/close', update.patch.id ];
    },
    'patch/set-inputs': function(update) {
        var patch = update.patch;
        var srcInputs = update.inputs,
            inputs = [];
        srcInputs.forEach(function(srcInput) { inputs.push(srcInput.id); });
        return [ 'patch/set-inputs', update.patch.id ].concat(inputs);
    },
    'patch/set-outputs': function(update) {
        var patch = update.patch;
        var srcOutputs = update.outputs,
            outputs = [];
        srcOutputs.forEach(function(srcOutput) { outputs.push(srcOutput.id); });
        return [ 'patch/set-outputs', update.patch.id ].concat(outputs);
    },
    'patch/project': function(update) {
        return [ 'patch/project', update.patch.id, update.target.id, update.node.id ];
    },
    'patch/move-canvas': function(update) {
        return [ 'patch/move-canvas', update.patch.id, update.position[0], update.position[1] ];
    },
    'patch/resize-canvas': function(update) {
        return [ 'patch/resize-canvas', update.patch.id, update.size[0], update.size[1] ];
    },
    'patch/add-node': function(update) {
        var node = update.node;
        espAddToContainer(node);
        return [ 'patch/add-node', node.patch.id, node.id, node.type, encodeURIComponent(node.def.title) ];
    },
    'patch/remove-node': function(update) {
        espDeleteFromContainer(update.node);
        return [ 'patch/remove-node', update.patch.id, update.node.id ];
    },
    'node/turn-on': function(update) {
        return [ 'node/turn-on', update.node.id ];
    },
    'node/turn-off': function(update) {
        return [ 'node/turn-off', update.node.id ];
    },
    'node/add-inlet': function(update) {
        var inlet = update.inlet;
        espAddInletToContainer(inlet);
        return [ 'node/add-inlet', update.node.id, inlet.id,
                 inlet.type, inlet.alias, encodeURIComponent(inlet.def.label) ];
    },
    'node/remove-inlet': function(update) {
        return [ 'node/remove-inlet', update.node.id, update.inlet.id ];
    },
    'node/add-outlet': function(update) {
        var outlet = update.outlet;
        espAddOutletToContainer(outlet);
        return [ 'node/add-outlet', update.node.id, outlet.id,
                 outlet.type, outlet.alias, encodeURIComponent(outlet.def.label) ];
    },
    'node/remove-outlet': function(update) {
        return [ 'node/remove-outlet', update.node.id, update.outlet.id ];
    },
    'node/move': function(update) {
        return [ 'node/move', update.node.id ].concat(update.position);
    },
    'node/configure': function(update) {
        return [ 'node/configure', update.node.id ].concat(JSON.stringify(update.props));
    },
    'outlet/connect': function(update) {
        espAddToConnection(update);
        return [ 'outlet/connect', update.outlet.id, update.inlet.id, update.link.id ];
    },
    'outlet/disconnect': function(update) {
        espDeleteConnection(update)
        return [ 'outlet/disconnect', update.outlet.id, update.link.id ];
    },
    'inlet/update': function(update) {
        // console.log(update);
        espUpdateInletValue(update);
        return [ 'inlet/update' ];
    },    
    'outlet/update': function(update) {
        // console.log(update.outlet);
        espUpdateOutletValue(update);
        return [ 'outlet/update' ];
    },        
    'link/enable': function(update) {
        return [ 'link/enable', update.link.id ];
    },
    'link/disable': function(update) {
        return [ 'link/disable', update.link.id ];
    }
};

var  lowCaseFirst = function(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

var espUpdateNodePosition = function(inlet)
{
    //node coresponding source outlet
    // var node_out = _.findWhere(espNodeContainer, {nodeid: inlet.node.id});
    // console.log(inlet);
    
    espNodePos[inlet.node.id] = {
        x: inlet.position[0], 
        y: inlet.position[1]
    };

    // for (var i = 0, l = espNodeContainer.length; i < l; i++) {
    //      if(espNodeContainer[i].nodeid === inlet.node.id){
    //         espNodeContainer[i]['nodeposition'].x = inlet.position[0];
    //         espNodeContainer[i]['nodeposition'].y = inlet.position[1];            
    //     }
    // }
    // console.log(inlet.id + " node:" + inlet.node.id )
}

var espAddInletToContainer = function(inlet)
{
    //node coresponding source outlet
    // console.log(inlet);
    var node_out = _.findWhere(espNodeContainer, {nodeid: inlet.node.id});

    if (inlet.alias === "") return;

    for (var i = 0, l = espNodeContainer.length; i < l; i++) {
         if(espNodeContainer[i].nodeid === node_out.nodeid){
            espNodeContainer[i]['nodeinlet'].push({
                id: inlet.id,
                type: inlet.type,
                alias: inlet.alias,
                value: inlet.alias
            });
        }
    }
    // console.log(inlet.id + " node:" + inlet.node.id )
}


var espAddOutletToContainer = function(outlet)
{
    //node coresponding source outlet
    var node_out = _.findWhere(espNodeContainer, {nodeid: outlet.node.id});
    // console.log(outlet);
    if (outlet.alias === "") return;

    for (var i = 0, l = espNodeContainer.length; i < l; i++) {
         if(espNodeContainer[i].nodeid === node_out.nodeid){
            espNodeContainer[i]['nodeoutlet'].push({
                id: outlet.id,
                type: outlet.type,
                alias: outlet.alias,
                value: outlet.alias
            });
        }
    }
    // console.log(inlet.id + " node:" + inlet.node.id )
}

var espUpdateInletValue = function(node)
{
    //node coresponding destination inlet
    var node_in = _.findWhere(espNodeContainer, {nodeid: node.inlet.node.id});
    
    if (node.inlet.alias === "" || _.isUndefined(node_in) ) return;

    var inlet_name = node.inlet.alias.toLowerCase();
    // console.log(inlet_name)

    if(node.value === "")
    {
        delete node_in.nodeinletvalue[inlet_name];
    }else{
        node_in.nodeinletvalue[inlet_name] = [node.inlet.id, node.value];
    }
}

var espUpdateOutletValue = function(node)
{
    //node coresponding destination inlet
    var node_in = _.findWhere(espNodeContainer, {nodeid: node.outlet.node.id});
    
    if (node.outlet.alias === "" || _.isUndefined(node_in) ) return;

    var outlet_name = node.outlet.alias.toLowerCase();

    // console.log(node.value)

    if(node.value === "")
    {
        delete node_in.nodeoutletvalue[outlet_name];
    }else{
        node_in.nodeoutletvalue[outlet_name] = [node.outlet.id, node.value];
    }
}

var espAddToConnection = function(node)
{
    //node coresponding destination inlet
    var node_in = _.findWhere(espNodeContainer, {nodeid: node.inlet.node.id});

    //node coresponding source outlet
    var node_out = _.findWhere(espNodeContainer, {nodeid: node.outlet.node.id});

    if(node.value === "") node.link.inlet.receive("");
    // node.link.inlet.receive("");
    // console.log(node);
    // console.log(node_out.nodeclass);
    

    // console.log(node)
    // console.log(node.inlet.node.type + node.inlet.node.id + "->" + node.link.inlet.alias + " = " + node.outlet.node.type + node.outlet.node.id + "->" + node.link.outlet.alias );

    // for (var i = 0, l = espNodeContainer.length; i < l; i++) {
        //  if(espNodeContainer[i].nodeid === node_in.nodeid){
            // espNodeContainer[i].nodeconnection = node.outlet.node.type + node.outlet.node.id + "->" + node.link.outlet.alias
        //  }
    // }

    espNodeClassConnection.push({
        linkid: node.link.id, //refactor this linkidn = rpd link id
        inletid: node.inlet.id,
        outletid: node.outlet.id,
        nodeid: node.link.id,
        // connection: node_in.nodevariable + "->" + node.link.inlet.alias + " = " + node_out.nodevariable + "->" + ,
        inlet_class_alias: node_in.nodevariable,
        inlet_class: node_in.nodeclass,
        inlet_alias: node.link.inlet.alias,
        outlet_class_alias: node_out.nodevariable,
        outlet_class: node_out.nodeclass,
        outlet_alias: node.link.outlet.alias,
        node_in_id: node_in.nodeid,
        node_out_id: node_out.nodeid
    });

}   


var espDeleteConnection = function(node)
{
    var link = _.findWhere(espNodeClassConnection, {nodeid: node.link.id});

    // console.log(node,kubj)
    node.link.inlet.receive("");
    // randomNode.inlets['max'].receive(256);
    // console.log(link)

    if (link !== undefined) {
        espNodeClassConnection = _.filter(espNodeClassConnection, function(el) {
            return el.nodeid !== node.link.id;
        });            
    }else{
        return;
    }
}


var espAddToContainer = function(node)
{   
    // node.inlets.forEach(function(srcInput) { console.log(srcInput)  });
    var node_prop = _.findWhere(NodeLibrary, {nodetype: node.type});
    var node_class = "";
    var node_variable = "";

    if (node_prop !== undefined) {
        // console.log(node_prop);
        node_class = node_prop.nodeclass;
        node_variable = node_prop.nodevariable;
    }else{
        return;
    }

    if (_.isUndefined(espNodeCount[node_class])){
        espNodeCount[node_class] = 1;
    } else {
        espNodeCount[node_class] = espNodeCount[node_class] + 1;
    }    

    var node_pos = (espNodePos[node.id])
    // console.log(node_pos)
    espNodeContainer.push({
        nodeid: node.id,
        nodedesc: encodeURIComponent(node.def.title),
        nodeclass: node_class,
        nodevariable: lowCaseFirst(node_class)  + "_" + espNodeCount[node_class],
        nodetype: node.type,
        nodeinletvalue: {},
        nodeoutletvalue: {},    
        nodeinlet: [],
        nodeoutlet: [],
        nodeposition: {
            x:node_pos.x, 
            y:node_pos.y
        }
    })

}

var espDeleteFromContainer = function(node)
{
    var node = _.findWhere(espNodeContainer, {nodeid: node.id});
    if (node !== undefined) {
        espNodeContainer = _.filter(espNodeContainer, function(el) {
            return el.nodeid !== node.nodeid;
        });            
    }else{
        return;
    }
}   

var NodeToCpp = function() {

    var include_string = ""
    var setup_string = ""


    //Patch node class variable
    var cnt = 0;

    for (var i = 0, l = espNodeContainer.length; i < l; i++) {
            var node = espNodeContainer[i];
            var node_def = _.findWhere(NodeLibrary, {nodetype: node.nodetype});
            if (node.nodeclass === "ModuleSamplePack"){
                node.nodevariable =  node.nodeclass + "_" + node.nodeinletvalue.sample[1] + "_" + cnt++;
            }
    }    

    //Generate code for connected node
    for (var i = 0, l = espNodeClassConnection.length; i < l; i++) {
        
        var conn = espNodeClassConnection[i];
        var node_in_type = espNodeClassConnection[i].inlet_class;
        var node_out_type = espNodeClassConnection[i].outlet_class;

        var node_def = _.findWhere(NodeLibrary, {nodeclass: node_type});

        if (node_in_type === 'ModuleSamplePack')
        {
            var inlet = _.findWhere(espNodeContainer, {nodeid: conn.node_in_id});
            conn.inlet_class_alias = lowCaseFirst(inlet.nodevariable);        
        }
        if (node_out_type === 'ModuleSamplePack')
        {
            var outlet = _.findWhere(espNodeContainer, {nodeid: conn.node_out_id});
            conn.outlet_class_alias = lowCaseFirst(outlet.nodevariable);      
        }

    }




    //Generate Module Init and setup
    for (var i = 0, l = espNodeContainer.length; i < l; i++) {
        
        var node = espNodeContainer[i];
        var node_def = _.findWhere(NodeLibrary, {nodetype: node.nodetype});

        //all except constant module
        if (_.isUndefined(node_def.nodegenerateheader))
        {
            if (node.nodeclass !== "ModuleConstant" && node.nodeclass !== "DAC"&& node.nodeclass !== "Param" && node.nodeclass !== "NodeList") 
                include_string += (node.nodeclass + " *" + node.nodevariable + " = new " + node.nodeclass + "()" + ";\n");
        }

        // console.log(node.nodeclass);
        if (_.isUndefined(node_def.nodegeneratesetup))
        {
            for (var key in node.nodeinletvalue) {
                if (key !== "user-value" && node.nodeclass !== "DAC"  && node.nodeinletvalue[key] !== 0 && node.nodeinletvalue[key][1] !== "0" && node.nodeinletvalue[key][1] !== 0)
                    setup_string = setup_string + node.nodevariable + "->" + key + " = new ModuleConstant(" + node.nodeinletvalue[key][1] + ");\n";
            }            
        }


    }


    //Generate Module Init and setup
    //based on node definition
    for (var i = 0, l = espNodeContainer.length; i < l; i++) {    
        var node = espNodeContainer[i];
        var node_def = _.findWhere(NodeLibrary, {nodetype: node.nodetype});
        if (!_.isUndefined(node_def) && !_.isUndefined(node_def.nodegenerateheader))
            include_string +=  node_def.nodegenerateheader(node);
        if (!_.isUndefined(node_def) && !_.isUndefined(node_def.nodegeneratesetup))
            for (var key in node.nodeinletvalue)
                setup_string +=  node_def.nodegeneratesetup(key, node);
    }

    //Generate code for connected node
    for (var i = 0, l = espNodeClassConnection.length; i < l; i++) {

        var conn = espNodeClassConnection[i];
        var node_type = espNodeClassConnection[i].inlet_class;
        var node_def = _.findWhere(NodeLibrary, {nodeclass: node_type});
        var node_in = _.findWhere(espNodeContainer, {nodeclass: node_type});

        
        if (!_.isUndefined(node_def) && !_.isUndefined(node_def.nodegenerateconn))
            include_string +=  node_def.nodegenerateconn(conn,node_in);

        // console.log(node_in);
        // setup_string = setup_string + conn.inlet_class_alias + "->" + conn.inlet_alias.toLowerCase() + "=" + conn.outlet_class_alias + "->" + conn.outlet_alias.toLowerCase() +";\n";

    }
    
    
    //Generate code for connected node
    for (var i = 0, l = espNodeClassConnection.length; i < l; i++) {
        
        var conn = espNodeClassConnection[i];
        var node_type = espNodeClassConnection[i].inlet_class;
        var node_def = _.findWhere(NodeLibrary, {nodeclass: node_type});

        if (_.isUndefined(node_def.nodegenerateconn)){
            if (conn.inlet_class !== "DAC")
            {
                if (conn.outlet_alias.toLowerCase() === "out")
                {
                    setup_string = setup_string + conn.inlet_class_alias + "->" + conn.inlet_alias.toLowerCase() + "=" + conn.outlet_class_alias +";\n";
                } else {
                    if (conn.outlet_class !== "ModuleConstant")
                    {
                        if (conn.outlet_class === "Param")
                        {
                            setup_string = setup_string + conn.inlet_class_alias + "->" + conn.inlet_alias.toLowerCase() + '= &amp;param[' + (parseInt(conn.outlet_alias.toLowerCase().replace(/\D/g,''))-1) +"];\n";
    
                        }else{
                            if (_.isUndefined(node_def.nodegenerateconn))
                                setup_string = setup_string + conn.inlet_class_alias + "->" + conn.inlet_alias.toLowerCase() + "=" + conn.outlet_class_alias + "->" + conn.outlet_alias.toLowerCase() +";\n";
                        }
                    }
                }
            }
        }

                // else
                    // setup_string = setup_string + conn.inlet_class_alias + "->" + conn.inlet_alias.toLowerCase() + "= new ModuleConstant() " + conn.outlet_class_alias + "->" + conn.outlet_alias.toLowerCase() +";\n";
    }


    // For dac last module
    for (var i = 0, l = espNodeClassConnection.length; i < l; i++) {        
        var conn = espNodeClassConnection[i]; 
        var node_type = espNodeClassConnection[i].inlet_class;
        var node_def = _.findWhere(NodeLibrary, {nodeclass: node_type});
        var node_outlet = _.findWhere(espNodeContainer, {nodeclass: conn.outlet_class});

        if (conn.inlet_class === "DAC")
        {   
            console.log(conn);
            if (conn.outlet_class === 'ModuleSamplePack')
            {
                setup_string =  setup_string + "\n\nthis->last_module = " +  lowCaseFirst(conn.outlet_class) +"_"+ node_outlet.nodeinletvalue.sample[1] + ";\n";
            }else{
                setup_string =  setup_string + "\n\nthis->last_module = " + conn.outlet_class_alias + ";\n";
            }
        }
    }


    // console.log(include_string);
    // console.log(setup_string);

    return include_string + "\n\n" + setup_string;
} 

var NodeToPlainNetwork = function() 
{
    var rootid = "sad4";
    var plain_network = ""
    plain_network = plain_network + "v2.1.1" + "\n" 
    plain_network = plain_network + "network/add-patch "+rootid+" root"+"\n";
    plain_network =  plain_network + "patch/open "+rootid+"\n";

    for (var i = 0, l = espNodeContainer.length; i < l; i++) {
        
        var node = espNodeContainer[i];     
        
        plain_network = plain_network + ("patch/add-node "+rootid+" " + node.nodeid + " " + node.nodetype + " " + node.nodedesc) + "\n";
        plain_network = plain_network + ("node/turn-on " + node.nodeid) + "\n";
        for (var j = 0, m = node.nodeinlet.length; j < m; j++) {
            var inlet = node.nodeinlet[j];
            inlet.alias = encodeURIComponent(inlet.alias);
            inlet.value = encodeURIComponent(inlet.value);

            plain_network = plain_network + ("node/add-inlet "+ node.nodeid +" "+ inlet.id +" "+inlet.type+" "+inlet.alias+" "+inlet.value+"") + "\n";
        }
        for (var j = 0, m = node.nodeoutlet.length; j < m; j++) {
            var outlet = node.nodeoutlet[j];
            outlet.alias = encodeURIComponent(outlet.alias);
            outlet.value = encodeURIComponent(outlet.value);

            plain_network = plain_network + ("node/add-outlet "+ node.nodeid +" "+ outlet.id +" "+outlet.type+" "+outlet.alias+" "+outlet.value+"") + "\n";
                
        }              
        // plain_network = plain_network + ("node/move " + node.nodeid + " " + node.nodeposition.x + " " + node.nodeposition.y) + "\n";
    }



    for (var i = 0, l = espNodeContainer.length; i < l; i++) {        
        var node = espNodeContainer[i];              
        var node_pos = espNodePos[node.nodeid];

        plain_network = plain_network + ("node/move " + node.nodeid + " " + node_pos.x + " " + node_pos.y) + "\n";
    }    

    for (var i = 0, m = espNodeClassConnection.length; i < m; i++) {      
        var conn = espNodeClassConnection[i];  
        plain_network = plain_network + ("outlet/connect " + conn.outletid + " " + conn.inletid + " " + conn.linkid) + "\n";
    }

    for (var i = 0, l = espNodeContainer.length; i < l; i++) {        
        var node = espNodeContainer[i];                     
        for (var key in node.nodeoutletvalue) {
            var nodeoutlet = node.nodeoutletvalue[key];
            plain_network = plain_network + "node/update-outlet " + node.nodeid + " " + nodeoutlet[0] + " "   + key + " " + encodeURIComponent(nodeoutlet[1]) + "\n";
        }
        for (var key in node.nodeinletvalue) {
            var nodeinlet = node.nodeinletvalue[key];
            plain_network = plain_network + "node/update-inlet " + node.nodeid + " " + nodeinlet[0] + " "   + key + " " + encodeURIComponent(nodeinlet[1]) + "\n";
        }
    }

    return(plain_network.slice(0, -1));

    // espNodeClassConnection.push({
    //     linkid: node.link.id, //refactor this linkidn = rpd link id
    //     inletid: node.inlet.id,
    //     outletid: node.outlet.id,
    //     nodeid: node.link.id,
    //     // connection: node_in.nodevariable + "->" + node.link.inlet.alias + " = " + node_out.nodevariable + "->" + ,
    //     inlet_class_alias: node_in.nodevariable,
    //     inlet_class: node_in.nodeclass,
    //     inlet_alias: node.link.inlet.alias,
    //     outlet_class_alias: node_out.nodevariable,
    //     outlet_class: node_out.nodeclass,
    //     outlet_alias: node.link.outlet.alias
    // });

    // espNodeContainer.push({
    //     nodeid: node.id,
    //     nodeclass: node_class,
    //     nodevariable: lowCaseFirst(node_class)  + "_" + espNodeCount[node_class],
    //     nodetype: node.type,
    //     nodeinletvalue: {},
    //     nodeinlet: [],
    //     nodeoutlet: [],
    //     nodeposition: {x:0, y:0}
    // })

    // "v2.1.1
    // patch/add-node j08w s44i espnode/oscillator Oscillator
    // node/turn-on s44i
    // node/add-inlet s44i pai4 espnode/string Frequency undefined
    // node/add-inlet s44i kkcj espnode/string Wavetable undefined
    // node/add-outlet s44i ss2v espnode/string Out undefined
    // patch/add-node j08w 4nd7 espnode/mixer3 3%20Channel%20Mixer
    // node/turn-on 4nd7
    // node/add-inlet 4nd7 nb88 espnode/string ch1 undefined
    // node/add-inlet 4nd7 rmx0 espnode/string ch2 undefined
    // node/add-inlet 4nd7 y0x0 espnode/string ch3 undefined
    // node/add-outlet 4nd7 5jx1 espnode/string Out undefined
    // outlet/connect ss2v nb88 bfzf
    // node/move s44i 452 109
    // node/move 4nd7 848 73"
}


var NodeToJSONDownload = function()
{
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var json = (data),
                blob = new Blob([json], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());
        
    saveData(NodeToPlainNetwork(), "patch.txt"); 
}

var NodeImportCpp = function (code)
{
    var code_import = code;
    var start_tag = "--BEGINESPNODEPATCH--"
    var stop_tag = "--ENDESPNODEPATCH--"

    var start_index = code_import.indexOf(start_tag) + start_tag.length ;
    var last_index = code_import.indexOf(stop_tag);

    var decoded_network = (atob(code_import.substr(start_index,  last_index - start_index)));

    espRoot.close();
    espNodeReset();
    Rpd.import.plain(decoded_network);
}

var NodeToCPPDownload = function()
{
    var saveData = (function () {
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        return function (data, fileName) {
            var json = (data),
                blob = new Blob([json], {type: "octet/stream"}),
                url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = fileName;
            a.click();
            window.URL.revokeObjectURL(url);
        };
    }());
    
    

    saveData(NodeToCPPandNetwork(), "patch.h"); 

}

var NodeToCPPandNetwork = function()
{
    var base64Net = chunk(btoa(NodeToPlainNetwork()), 200).join("\n");
    var nodeCpp = NodeToCpp();

    var code_export = '\n\n/* \n\nThis is espnode86 stuff do not edit\n\n--BEGINESPNODEPATCH--\n' + base64Net + '\n--ENDESPNODEPATCH--\n\n*/\n\n' + "\n\n" + nodeCpp;
    
    code_export = code_export + "\n\n// end of espnode86 generated code //\n\n";
    
    return code_export;
}

function chunk(str, n) {
    var ret = [];
    var i;
    var len;

    for(i = 0, len = str.length; i < len; i += n) {
       ret.push(str.substr(i, n))
    }

    return ret
};

var spec = exportSpec;
var lines = [ Rpd.VERSION ];
var COMMAND_SEPARATOR = '\n';
var ARGS_SEPARATOR = ' ';

var knownEvents = Rpd.events.filter(function(update) { return spec[update.type]; });

var pushCommand = function(update) {
    if (update.type !== 'node/move') {        
        // console.log("update", update)
        lines.push(spec[update.type](update).join(ARGS_SEPARATOR));
    } else {
        // console.log("updatepos", update)
        espUpdateNodePosition(update);         
    }
};

knownEvents.onValue(pushCommand);