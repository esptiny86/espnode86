window.AudioContext = window.AudioContext || window.webkitAudioContext;
var context = new AudioContext();

var project_count = 0;
var project = {};

// var project = {
// 	name: "sounds",
// 	sampleRate: 44100,
// 	normalize: true,
// 	wavetable: []
// };

function objFromId(p_id,id)
{
	for(var i = 0; i < project[p_id].wavetable.length; i++)
		if(project[p_id].wavetable[i].id === id)
			return project[p_id].wavetable[i];
	return null;
}


// function addSound(id, buffer, sounds_div)
// {
//     console.log(sounds_div)
// 	objFromId(id).buffer = buffer;
// 	update(sounds_div);
// }


function playSound(p_id,id)
{
	var obj = objFromId(p_id,id);
	if(obj.bs)
		stopSound(p_id,id);
	obj.bs = context.createBufferSource();
	obj.bs.buffer = obj.buffer;
	obj.bs.connect(context.destination);
	obj.bs.start();
}


function stopSound(p_id,id)
{
	var obj = objFromId(p_id,id);
	if(!obj.bs) return;
	obj.bs.stop();
	obj.bs.disconnect();
	obj.bs = null;
}


function addFile(p_id,file, id, soundsDiv)
{		
    var sound_div = (soundsDiv);

	var obj = {"id": id, "name": file.name, "type": file.type};
	project[p_id].wavetable.push(obj);
	var reader = new FileReader();
	reader.onload = function(e){
		objFromId(p_id,id).source = Array.from(new Uint8Array(e.target.result));
		context.decodeAudioData(e.target.result, 
		function(buffer){
            // console.log(buffer)
            objFromId(p_id,id).buffer = buffer;
            update(p_id,soundsDiv);
        });
	};
	reader.readAsArrayBuffer(file);
}

function addFiles(p_id,event, soundsDiv)
{
    var sound_div = soundsDiv;
    // console.log(event.target.files.length);
	for(var i = 0; i < event.target.files.length; i++)
	{
        var file = event.target.files[i];
        var id = file.name.replace(/[^A-Z0-9]/ig, "_") + Math.floor(Math.random() * 1000000);

        // console.log(sound_div)
        addFile(p_id,file, id, sound_div )

	}
	event.target.value = "";
}


function audioBufferToArray(audioBuffer, normalize, sampleRate)
{
	var buffer = audioBuffer.getChannelData(0);
		
	if(audioBuffer.numberOfChannels > 1)
	{
		for(var c = 1; c < audioBuffer.numberOfChannels; c++)
		{
			var cb = audioBuffer.getChannelData(c);
			for(var i = 0; i < length; i++)
				buffer[i] += cb[i];
		}
	}
	
	if(sampleRate != audioBuffer.sampleRate)
	{
		var scale = audioBuffer.sampleRate / sampleRate;
		var length = Math.floor((buffer.length - 2) / scale); 
		var b = new Float32Array(length);
		for(var i = 0; i < length; i++)
		{
			var s = i * scale;
			var si = Math.floor(s);
			var f = s - si;
			b[i] = buffer[si] * (1 - f) + buffer[si + 1] * f;
		}
		buffer = b;
	}
	
	if(normalize)
	{
		var max = 0;
		for(var i = 0; i < buffer.length; i++)
			max = Math.max(Math.abs(buffer[i]), max);
		if(max != 0)
			for(var i = 0; i < buffer.length; i++)
				buffer[i] /= max;
	}	
	
	return buffer;
}



function newButton(text, cb)
{
	var b = document.createElement("button");
	b.innerHTML = text;
	b.onclick = cb;
	return b;
}


function upSound(p_id,id,soundsDiv)
{
	var wavetable = project[p_id].wavetable;
	for(var i = 1; i < wavetable.length; i++)
		if(wavetable[i].id === id)
		{
			var w = wavetable[i - 1];
			wavetable[i - 1] = wavetable[i];
			wavetable[i] = w;
			update(p_id,soundsDiv);
			return;
		}
}
function downSound(p_id,id,soundsDiv)
{
	var wavetable = project[p_id].wavetable;
	for(var i = 0; i < wavetable.length - 1; i++)
		if(wavetable[i].id === id)
		{
			var w = wavetable[i + 1];
			wavetable[i + 1] = wavetable[i];
			wavetable[i] = w;
			update(p_id,soundsDiv);
			return;
		}
}

function deleteSound(p_id,id,soundsDiv)
{
	var wavetable = project[p_id].wavetable;
	for(var i = 0; i < wavetable.length; i++)
		if(wavetable[i].id === id)
		{
			wavetable.splice(i, 1);
			update(p_id,soundsDiv);
			return;
		}
}


function addListItem(p_id,i, id, name, soundsDiv)
{

	var soundDiv = document.createElement("div");			
	soundDiv.id = id;
	var index = document.createElement("span");
	index.className = "num";
	index.innerHTML = i;
	soundDiv.appendChild(index);
	soundDiv.appendChild(newButton("&#10008;", function(){ deleteSound(p_id,id,soundsDiv)}));
	soundDiv.appendChild(newButton("&#x2B07;", function(){ downSound(p_id,id,soundsDiv); }));
	soundDiv.appendChild(newButton("&#x2B06;", function(){ upSound(p_id,id,soundsDiv); }));
	soundDiv.appendChild(newButton("&#x2BC0;", function(){ stopSound(p_id,id,soundsDiv); }));
	soundDiv.appendChild(newButton("&#x2BC8;", function(){ playSound(p_id,id,soundsDiv); }));
	var span = document.createElement("span");
	span.innerHTML = name;
    soundDiv.appendChild(span);    
	soundsDiv.appendChild(soundDiv);
}


function update(p_id,soundsDiv)
{	
    
    // console.log(soundsDiv.innerHTML)
    // soundsDiv.innerHTML= "";
    for(var i = 0; i < project[p_id].wavetable.length; i++)
    {
        // console.log(objFromId(id).buffer)

		if(!project[p_id].wavetable[i].buffer)
            return;
    }
	// project[p_id].name = document.getElementById("name").value;
	// project[p_id].sampleRate = document.getElementById("samplerate").value;
	// project[p_id].normalize = document.getElementById("normalize").checked;
	soundsDiv.innerHTML = "";

    for(var i = 0; i < project[p_id].wavetable.length; i++)
		addListItem(p_id,i, project[p_id].wavetable[i].id, project[p_id].wavetable[i].name, soundsDiv);

        // document.getElementById("files").className = "hidden";
        // document.getElementById("filearea").innerHTML = "";

    }


function saveProject(p_id,)
{	
    // document.getElementById("filearea").innerHTML = "";
    // var fileArea = document.getElementById("filearea");
    // var file = document.createElement("a");
    // file.className = "block file";
    // file.download = file.innerHTML = document.getElementById("name").value + ".json";
    for(var i = 0; i < project[p_id].wavetable.length; i++)
        if(project[p_id].wavetable[i].bs)
            delete project[p_id].wavetable[i].bs;
    
    return (project[p_id]);
    // file.href = URL.createObjectURL(new Blob([JSON.stringify(project)], {type: "application/json"}));
    // fileArea.appendChild(file);
    // document.getElementById("files").className = "menu";
}

function loadProject(p_id,json_string, soundsDiv)
{
project[p_id] = JSON.parse(json_string);
for(var i = 0; i < project[p_id].wavetable.length; i++)
    context.decodeAudioData((new Uint8Array(project[p_id].wavetable[i].source)).buffer, 
    (function(id){ return function(buffer){
        objFromId(p_id,id).buffer = buffer;
        update(p_id,soundsDiv);
    }})(project[p_id].wavetable[i].id));

}


Rpd.noderenderer('espnode/samplepack', 'html', function(){
    var valInput;
    var divSounds;
    var valBtn;
    var valName;
    var valAdd;
    var valDownload;

    var project_id;
    
    return  {
    first: function(bodyElm) {

        project_count = project_count + 1;
        project_id = project_count;



        project[project_count] = {
            name: "sounds",
            sampleRate: 44100,
            normalize: true,
            wavetable: []
        };

        // <input id="addsounds" type="file" onchange="addFiles(event)" accept="audio/*" multiple hidden>
        divSounds = document.createElement('div');
        divSounds.style.width = "200px";

        valInput = document.createElement('input');
        // valInput.style.width = '150px';
        // valInput.style.height = '100px';
        valInput.type = "file";
        valInput.accept = "audio/*";
        valInput.multiple = true;
        valInput.hidden = true;

        valInput.onchange = function(e){ addFiles(project_id, e, divSounds); };

        valInput.style.color = "#000";
        valInput.style.background = "#CCC";
        valInput.style.fontSize = "1.25em";
        valInput.style.padding = "1em";
        valInput.style.fontFamily = "'PT Mono', 'Andale Mono', 'Fira mono', 'Menlo', sans-serif;";
        valInput.innerHTML = "Open"
        // valInput.type = 'number';
        // valInput.min = 0;
        // valInput.max = 1000;
        divSounds.appendChild(valInput);
        bodyElm.appendChild(divSounds);
        
        valName = document.createElement('input');
        valName.value = "SAMPLE_NAME"

        valBtn = document.createElement('button');
        valBtn.innerHTML = "Save to Patch"

        valAdd = document.createElement('button');
        valAdd.innerHTML = "Add"
        valAdd.onclick = function(){valInput.click()}

        valDownload = document.createElement('button');
        valDownload.innerHTML = "Download"
        valDownload.onclick = function(){}


        bodyElm.appendChild(valName);
        bodyElm.appendChild(valAdd);
        bodyElm.appendChild(valBtn);
        bodyElm.appendChild(valDownload);

          
        return { 
            'sample_name':
            { 
                default: function() { valName.value = 0; return 0; }, valueOut: Kefir.fromEvents(valName, 'change').map(function() { return valName.value; })
            },            
            'comment':
                    { default: function() 
                        { return ""; 
                    },
                      valueOut: Kefir.fromEvents(valBtn, 'click')
                                     .map(function(e) { 
                                         return (JSON.stringify(saveProject(project_id))); 
                                      })
                    }
               };
    },
    always: function(bodyElm, inlets, outlets) {

        var json_string = inlets["comment"];
        if( !_.isUndefined(json_string) && json_string.length > 1)
            loadProject(project_id, inlets["comment"], divSounds)

        // console.log(inlets)
        valName.value = (inlets["sample_name"]);
    },   
}});
