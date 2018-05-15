import TinyDatePicker from 'tiny-date-picker'; 
import ResultChart from './chart-generator.js';
import './style.scss';
import '../node_modules/tiny-date-picker/tiny-date-picker.min.css'

var timestamp = 0; 
var datepickFrom, datepickTo; 

function init() {
	updateTimestamp()
	document.getElementById('paper').focus();
	document.getElementById('post-button').addEventListener('click', post);
	datepickFrom = TinyDatePicker(document.getElementById('datepick-from'), { mode: 'dp-permanent' });
	datepickTo = TinyDatePicker(document.getElementById('datepick-to'), { mode: 'dp-permanent' });
	document.getElementById('analyze-button').addEventListener('click', analyze); 
	datepickTo.setState({
		selectedDate: new Date("2018-04-01"),
		highlightedDate: new Date("2018-04-01")
	});
	datepickFrom.setState({
		selectedDate: new Date("2016-04-01"),
		highlightedDate: new Date("2016-04-01")
	});
}

function updateTimestamp() {
	timestamp = Date.now(); 
	document.getElementById('date').textContent = Date(timestamp).toLocaleString(); 
}

function setAnalysisStatus(msg, color) {
	var statusDiv = document.getElementById('analysis-status');
	statusDiv.textContent = msg; 
	statusDiv.style.color = color || "#a00";
}

var getNumericSetting = function(setting, specialValues){
	var value = document.getElementById(setting).value; 
	console.log("val = " + value);
	if(specialValues && specialValues.indexOf(value) >= 0) {
		return value; 
	} else {
		value = Number(value);
		if(isNaN(value)){
			setAnalysisStatus(`${setting} has to be a number or ${specialValues.join(', ')}`);
			return undefined; 
		} else {
			return value * 24 * 60 * 60 * 1000; //days => millisecs
		}
	}
}

function analyze() {
	setAnalysisStatus('analyzing...', '#00a');
	if(datepickFrom.state.selectedDate == null || datepickTo.state.selectedDate == null) {
		setAnalysisStatus('no dates specified');
		return; 
	}
	var from = datepickFrom.state.selectedDate.getTime();
	var to = datepickTo.state.selectedDate.getTime();
	if(from >= to) {
		setAnalysisStatus('from date must be earlier than to date'); 
		return; 
	}
	var kernelRadius = getNumericSetting('kernel-radius', ['auto']);
	var stepSize = getNumericSetting('step-size', ['auto']);
	if(kernelRadius == 'auto'){
		if(stepSize == 'auto'){
			stepSize = (to - from) / 20; 
		}
		kernelRadius = 5*stepSize;
	} else if(stepSize == 'auto'){
		stepSize = kernelRadius / 5;
	}
	var minFrequencyPeak = getNumericSetting('min-frequency-peak');
	var minOccurences = getNumericSetting('min-occurences');
	var user = document.getElementById('user').value;
	var book = document.getElementById('book').value;

	console.log('analyzing');
	var req = new XMLHttpRequest(); 
	req.addEventListener('load', function() {
		try {
			var results = JSON.parse(this.responseText); 
		} catch(err) {
			console.log(`Failed to parse analyze response: ${err}`); 
			return; 
		};
		displayChart(results, from, to); 
	});
	req.open('POST', '/analyze');
	req.setRequestHeader('Content-Type', 'application/json'); 
	req.send(JSON.stringify({
		user: user, 
		book: book,
		from: from, 
		to: to,
		kernelRadius: kernelRadius,
		stepSize: stepSize
	}));
}

function displayChart(results, from, to){
	var chartContainer = document.getElementById('chartContainer');
	var chart = new ResultChart(results);
	var svg = chart.generateElement(
		from, 
		0,
		to, 
		10,
		chartContainer.clientWidth,
		200)
	document.getElementById('chartContainer').appendChild(svg); 
}

function post() {
	console.log('posting'); 
	var req = new XMLHttpRequest(); 
	req.addEventListener('load', function() {
		console.log("success? " + this.responseText); 
		if(this.responseText == 'success'){
			document.getElementById('paper').textContent = '';
			updateTimestamp();
		} else {
			document.getElementById('post-button').style['background-color'] = '#ff2222'; 
		}
	});
	req.open('POST', '/post'); 
	req.setRequestHeader('Content-Type', 'application/json');
	req.send(JSON.stringify({
		user: 'felixn', 
		book: 'journal', 
		text: document.getElementById('paper').textContent,
		timestamp: timestamp
	})); 
}

init();

if('serviceWorker' in navigator)
{
	console.log('Service worker available');
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then(
			registration => {
				console.log('registration successful. Scope = ' + registration.scope);
			},
			err => {
				console.log('registration failed: ' + err); 
			}
		)}	
	);
} else {
	console.log('Service worker not supported'); 
}