var NodeLibrary = [];

NodeLibrary.push({
    nodetype: 'espnode/mixer3',
    nodeclass: "ModuleMixer3",
    rpdnode : {
        title: "3 Channel Mixer",    
        inlets: { 
            'ch1': { type: 'espnode/string', default: ""} ,
            'ch2': { type: 'espnode/string', default: ""} ,
            'ch3': { type: 'espnode/string'} 
        },
        outlets: { 
            'Out': { type: 'espnode/string'} 
        }
    }
});


NodeLibrary.push({
    nodetype: 'espnode/oscillator',
    nodeclass: "ModuleOscillator",
    rpdnode : {
        title: "Oscillator",    
        inlets: { 
            'Frequency': { type: 'espnode/string' } ,
            'Wavetable': { type: 'espnode/string' } ,
        },
        outlets: { 
            'Out': { type: 'espnode/string' } 
        }
    }
});

NodeLibrary.push({
    nodetype: 'espnode/lfo',
    nodeclass: "ModuleLFO",
    rpdnode : {
        title: "LF Oscillator",    
        inlets: { 
            'frequency_input': { type: 'espnode/string' } ,
            'wavetable_input': { type: 'espnode/string' } ,
        },
        outlets: { 
            'Out': { type: 'espnode/string' } 
        }
    }
});


NodeLibrary.push({
    nodetype: 'espnode/delay',
    nodeclass: "ModuleDelay",
    rpdnode : {
        title: "Audio Delay",
        inlets: { 
            'audio_input': { type: 'espnode/string' }, 
            'mix_input': { type: 'espnode/string' }, 
            'feedback_input': { type: 'espnode/string' }, 
            'length_input': { type: 'espnode/string' }, 
        },
        outlets: { 'out': { type: 'espnode/string' } }
    }
});



NodeLibrary.push({
    nodetype: 'espnode/delay',
    nodeclass: "ModuleDelay",
    rpdnode : {
        title: "Audio Delay",
        inlets: { 
            'audio_input': { type: 'espnode/string' }, 
            'mix_input': { type: 'espnode/string' }, 
            'feedback_input': { type: 'espnode/string' }, 
            'length_input': { type: 'espnode/string' }, 
        },
        outlets: { 'out': { type: 'espnode/string' } }
    }
});

NodeLibrary.push({
    nodetype: 'espnode/dac',
    nodeclass: "DAC",
    rpdnode : {
        title: "Audio DAC",
        inlets: { 
            'audio_input': { type: 'espnode/string' } 
        },
        outlets: { 
            // 'out': { type: 'espnode/string' } 
        }
    }
});


NodeLibrary.push({
    nodetype: 'espnode/constant',
    nodeclass: "ModuleConstant",
    rpdnode: {
        title: 'Constant',
        inlets:  { 'user-value': { type: 'espnode/string', default: 0, hidden: true } },
        outlets: { 'number':     { type: 'espnode/string' } },
        process: function(inlets) {
            return { 'number': inlets['user-value'] };
        }
    }
});


var d3 = d3 || d3_tiny;
var NodeList = RpdUtils.NodeList;
var getNodeTypesByToolkit = RpdUtils.getNodeTypesByToolkit;

Rpd.nodedescription('espnode/nodelist', 'Add any node to active patch by type');
// Rpd.nodetype('espnode/nodelist', { title: 'Node Pallete' });

NodeLibrary.push({
    nodetype: 'espnode/nodelist',
    nodeclass: "NodeList",
    rpdnode: {
        title: 'Node Pallete'
    }
});

Rpd.noderenderer('espnode/nodelist', 'html', {
    first: function(bodyElm) {

        var patch = this.patch;

        var nodeTypes = Rpd.allNodeTypes,
            nodeDescriptions = Rpd.allNodeDescriptions,
            toolkitIcons = Rpd.allToolkitIcons,
            nodeTypeIcons = Rpd.allNodeTypeIcons;


        // nodeTypes = ( _.filter(nodeTypes,function(key,obj){
        //     if (obj.includes("espnode")) 
        //         return true
        //     else
        //         return false
        // }));

        var nodeEsp = {}

        for (var key in nodeTypes) {
            if (key.includes("espnode") && ! key.includes("nodelist")) 
                nodeEsp[key] = nodeTypes[key]
        }

        var nodeTypesByToolkit = getNodeTypesByToolkit(nodeEsp);

        var nodeList = new NodeList({
            getPatch: function() { return patch; },
            buildList: function() {
                var listElements = [];

                // build the list html structure
                d3.select(bodyElm)
                  .append('dl')
                  .call(function(dl) {
                      Object.keys(nodeTypesByToolkit).forEach(function(toolkit) {

                          dl.append('dt')
                            .call(function(dt) {
                                if (toolkitIcons[toolkit]) dt.append('span').attr('class', 'rpd-nodelist-toolkit-icon').text(toolkitIcons[toolkit]);
                                dt.append('span').attr('class', 'rpd-nodelist-toolkit-name').text(toolkit)
                            });

                          dl.append('dd')
                            .append('ul')
                            .call(function(ul) {
                                nodeTypesByToolkit[toolkit].types.forEach(function(nodeTypeDef) {
                                    var nodeType = nodeTypeDef.fullName;
                                    ul.append('li')
                                      .call(function(li) {

                                          var elmData = { def: nodeTypeDef,
                                                          element: li };

                                          li.data(elmData);

                                          li.append('span').attr('class', 'rpd-nodelist-icon').text(nodeTypeIcons[nodeType] || String.fromCharCode(160));
                                          li.append('span').attr('class', 'rpd-nodelist-fulltypename')
                                            .call(function(span) {
                                                span.append('span').attr('class', 'rpd-nodelist-toolkit').text(nodeTypeDef.toolkit);
                                                span.append('span').attr('class', 'rpd-nodelist-separator').text('/');
                                                span.append('span').attr('class', 'rpd-nodelist-typename').text(nodeTypeDef.name);
                                            })
                                          if (nodeDescriptions[nodeType]) {
                                              li.append('span').attr('class', 'rpd-nodelist-description')
                                                               .attr('title', nodeDescriptions[nodeType])
                                                               .text(nodeDescriptions[nodeType]);
                                          }

                                          listElements.push(elmData);

                                      })
                                });
                            });

                      });
                  });

                return listElements;
            },
            createSearchInput: function() {
                return d3.select(bodyElm).append('input').attr('type', 'text');
            },
            createClearSearchButton: function() {
                return d3.select(bodyElm).append('a').attr('href', '#').text('x');
            },
            clearSearchInput: function(searchInput) { searchInput.node().value = ''; },
            recalculateSize: function() {},
            markSelected: function(elmData) { elmData.element.classed('rpd-nodelist-selected', true); },
            markDeselected: function(elmData) { elmData.element.classed('rpd-nodelist-selected', false); },
            markAdding: function(elmData) { elmData.element.classed('rpd-nodelist-add-effect', true); },
            markAdded: function(elmData) { elmData.element.classed('rpd-nodelist-add-effect', false); },
            setVisible: function(elmData) { elmData.element.style('display', 'list-item'); },
            setInvisible: function(elmData) { elmData.element.style('display', 'none'); }
        });

        nodeList.addOnClick();
        nodeList.addSearch();
        nodeList.addCtrlSpaceAndArrows();

    }
});


Rpd.noderenderer('espnode/constant', 'html', {
    first: function(bodyElm) {
        var valInput = document.createElement('input');
        valInput.style.display = 'block';
        valInput.type = 'number';
        valInput.min = 0;
        valInput.max = 1000;
        bodyElm.appendChild(valInput);
        return { 'user-value':
                    { default: function() { valInput.value = 0; return 0; },
                      valueOut: Kefir.fromEvents(valInput, 'change')
                                     .map(function() { return valInput.value; })
                    }
               };
    }
});


Rpd.channelrenderer('espnode/constant', 'html', {
    /* show: function(target, value) { }, */
    edit: function(target, inlet, valueIn) {
        var valInput = document.createElement('input');
        valInput.type = 'number';
        valueIn.onValue(function(val) {
            valInput.value = val;
        });
        target.appendChild(valInput);
        return Kefir.fromEvents(valInput, 'change')
                    .map(function() { return valInput.value; });
    }
});

// Rpd.channeltype('espnode/string', {
//     allow: [ 'util/number' ]
// });

Rpd.channeltype('espnode/string', {
    default: 0,
    readonly: false,
    accept: function(val) {
        // if (val === Infinity) return true;
        // var parsed = parseFloat(val);
        // return !isNaN(parsed) && isFinite(parsed);
        return true;
    },
    adapt: function(val) { 
        // if (val !== "") 
            return (val); 
        // else
            // return "default"
    }
});

Rpd.channelrenderer('espnode/string', 'html', {
    /* show: function(target, value) { }, */

});

//Register all node
NodeLibrary.forEach(function(element){
    Rpd.nodetype(element.nodetype, element.rpdnode)
})
