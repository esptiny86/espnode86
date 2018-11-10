NodeLibrary.push({
    nodetype: 'espnode/beatbyteplayer',
    nodeclass: "ModuleBeatBytePlayer",
    nodegenerateheader: function(node)
    {
        return "";
    },
    nodegeneratesetup: function(key, node)
    {
        return "";
    },
    rpdnode: {
        title: 'Beatbyte Player',
        inlets:  { 
            'select': { type: 'espnode/string' },            
            'p1': { type: 'espnode/string' } ,
            'p2': { type: 'espnode/string' },
            'p3': { type: 'espnode/string' },
            'p4': { type: 'espnode/string' },
            'p5': { type: 'espnode/string' },
            // 'p6': { type: 'espnode/string' },
            // 'p7': { type: 'espnode/string' },
            // 'p8': { type: 'espnode/string' },            
            'comment': { type: 'espnode/string', default: 0, hidden: true },
            'modulename': { type: 'espnode/string', default: 0, hidden: true }            
        },
        outlets: { 
            'out': { type: 'espnode/string', default: 0, hidden: false }
        },
        process: function(inlets) {
            // return { 'number': inlets['user-value'] };
        }
    }
});



Rpd.noderenderer('espnode/beatbyteplayer', 'html', function(){
    var valInput;
    
    return  {
    first: function(bodyElm) {

        valContainer = document.createElement('div');
        valContainer.style.width = '450px';

        valInput = document.createElement('textarea');
        valInput.className = "val-input beat-textarea"
        valInput.style.width = '450px';
        // valInput.style.display = 'none';
        valInput.style.height = '100px';
        valInput.style.color = "#000";
        valInput.style.background = "#CCC";
        valInput.style.fontSize = "1.25em";
        valInput.style.padding = "1em";
        valInput.style.fontFamily = "'PT Mono', 'Andale Mono', 'Fira mono', 'Menlo', sans-serif;";


        valName = document.createElement('input');
        valName.className = "val-input"        
        valName.style.width = '112px';
        valName.style.color = "#000";
        valName.style.background = "#CCC";
        valName.style.fontFamily = "'PT Mono', 'Andale Mono', 'Fira mono', 'Menlo', sans-serif;";



        valDownload = document.createElement('button');
        valDownload.style.width = '130px';        
        valDownload.innerHTML = "Download Module"
        valDownload.className = "btn_wave btn"
        valDownload.onclick = function(){ console.log("Wew") }

        valToggle = document.createElement('button');
        valToggle.style.width = '130px';        
        valToggle.innerHTML = "Toggle Formula"
        valToggle.className = "btn_wave btn"
        valToggle.onclick = function(){ 
            if (valInput.style.display === 'none' )
            {
               valInput.style.display = 'block'     

                valName.style.display = 'inline'
                valDownload.style.display = 'inline'
                valToggle.style.display = 'inline'
                           
               valContainer.style.width = '450px';
            }
            else
            {
                valInput.style.display = 'none' 
                valName.style.display = 'block'
                valDownload.style.display = 'block'
                valToggle.style.display = 'block'
                valContainer.style.width = '150px';
            }
        }


        // valInput.type = 'number';
        // valInput.min = 0;
        // valInput.max = 1000;
        valContainer.appendChild(valName);
        valContainer.appendChild(valDownload);
        valContainer.appendChild(valToggle);        
        valContainer.appendChild(valInput);

        bodyElm.appendChild(valContainer);

        valToggle.onclick();

        var formula = `(t|(t>>(9+(p1/2))|t>>7))*t&(t>>(11+(p2/2))|t>>9)
(t*9&t>>4|t*5&t>>(7+(p1/2))|t*3&t/(1024-(p2/2)))-1
(t>>6|t|t>>(t>>(16-(p1/2))))*10+((t>>11)&(7+(p2/2))) 
t*(((t>>(11-(p2/2)))&(t>>8))&((123-p1)&(t>>3)))
t*(t^t+(t>>15|1)^(t-(1280-(p1/2))^t)>>(10-(p2/5)))
        `
          
        return { 'comment':
                    { default: function() { valInput.value = 0; return formula; },
                      valueOut: Kefir.fromEvents(valInput, 'change')
                                     .map(function() { return (valInput.value); })
                    },
                'modulename':
                    { default: function() { valName.value = 0; return formula; },
                      valueOut: Kefir.fromEvents(valName, 'change')
                                     .map(function() { return (valName.value); })
                    },

                    

               };
    },
    always: function(bodyElm, inlets, outlets) {
        valInput.value = (inlets["comment"]);
        valName.value = (inlets["modulename"]);

    },   
}});
