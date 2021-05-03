const Tone = require('tone');

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.


window.addEventListener('DOMContentLoaded', async () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }



  // play the buffer with a Tone.Player when it's been generated
  		const player = new Tone.Player().toDestination();

  		const renderingPromise = Tone.Offline( async ({ transport }) => {

  			const reverb = new Tone.Reverb().toDestination();
  			// const pannerA = new Tone.Panner(-1).connect(reverb);
  			// const synthA = new Tone.Synth({
  			// 	envelope: {
  			// 		attack: 0.01,
  			// 		decay: 5,
  			// 		sustain: 0
  			// 	},
  			// 	oscillator: {
  			// 		type: "sawtooth4"
  			// 	}
  			// }).connect(pannerA);
        //
  			// const seqA = new Tone.Sequence(((time, note) => {
  			// 	synthA.triggerAttack(note, time);
  			// }), ["A4", "G4", "G#4", "F#4", "E4"], "8n").start(0);
  			// seqA.loop = false;
        //
  			// const pannerB = new Tone.Panner(1).connect(reverb);

        // const synthB = new Tone.Synth({
  			// 	envelope: {
  			// 		attack: 0.001,
  			// 		decay: 3,
  			// 		sustain: 0
  			// 	},
  			// 	oscillator: {
  			// 		type: "square8"
  			// 	}
  			// }).connect(pannerB);
        //
        // const seqB = new Tone.Sequence(((time, note) => {
  			// 	synthB.triggerAttack(note, time);
  			// }), ["G#4", "A4", "G4", "F4", "C4"], "8n").start("16n");
  			// seqB.loop = false;
        //
  			// const bass = new Tone.MonoSynth({
  			// 	envelope: {
  			// 		attack: 0.01,
  			// 		decay: 3,
  			// 		sustain: 0.1
  			// 	},
  			// }).toDestination();
        //
  			// const bassSeq = new Tone.Sequence(((time, note) => {
  			// 	bass.triggerAttackRelease(note, "1n", time);
  			// }), ["C2", "C2", "F1", "F1"], "4n").start(0);
  			// bassSeq.loop = false;


        const synth1 = new Tone.MembraneSynth().connect(reverb);
        const synth2 = new Tone.MembraneSynth().connect(reverb);



        // const seq1 = new Tone.Sequence((time, note) => {
        // 	synth1.triggerAttackRelease(note, '8n', time);
        // 	// subdivisions are given as subarrays
        // }, [ "C4",  "E4"], "2n").start(0);

        const seq2 = new Tone.Sequence((time, note) => {
        	synth2.triggerAttackRelease(note, '8n', time);
        	// subdivisions are given as subarrays
        }, [ "F4", "F4",["F4","F4"],"F4", ], "4n").start(0);


        //
  			transport.bpm.value = 150;
  			transport.start();

  			// return a promise
  			return reverb.ready;
  		}, 60*4);

  		// set the buffer when it's done
  		renderingPromise.then(async buffer => {

        const blob = await audioBufferToWaveBlob(buffer.get())
        console.log(blob);
        const url = window.URL.createObjectURL(blob);
        document.getElementById("player").src = url;
        document.getElementById("player").play()

        document.getElementById("busy").style.display = "none";
      });
  		//const buffer = await renderingPromise;
  		//renderingPromise.then(() => document.querySelector("tone-play-toggle").disabled = false);

  		// document.querySelector("tone-play-toggle").addEventListener("start", () => player.start());
  		// document.querySelector("tone-play-toggle").addEventListener("stop", () => player.stop());



})






async function audioBufferToWaveBlob(audioBuffer) {

  return new Promise(function(resolve, reject) {

    var worker = new Worker('./waveWorker.js');

    worker.onmessage = function( e ) {
      var blob = new Blob([e.data.buffer], {type:"audio/wav"});
      resolve(blob);
    };

    let pcmArrays = [];
    for(let i = 0; i < audioBuffer.numberOfChannels; i++) {
      pcmArrays.push(audioBuffer.getChannelData(i));
    }

    worker.postMessage({
      pcmArrays,
      config: {sampleRate: audioBuffer.sampleRate}
    });

  });

}
