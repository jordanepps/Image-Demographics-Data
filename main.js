const app = new Clarifai.App({
	apiKey: 'cfd1f224ea07473a8ba98dfffe07943c'
});
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const IMAGEDATA = {
	faces: [],
	width: 0,
	height: 0,
	src: ''
};

function handleTryAgain() {
	$('#js-results').on('click', '#js-try-again', () => {
		clearData(0);
		loadForm();
	});
}

function loadTryAgainBtn() {
	const div = $('<div>').attr('class', 'try-again-container');
	$(div).append(createTryAgainBtn);
	$('#js-results').append(div);
}

function createTryAgainBtn() {
	const btn = $('<button>Search Again</button>').attr({
		id: 'js-try-again',
		class: 'try-again',
		type: 'button'
	});
	return btn;
}

function successMessage() {
	const h2 = $(
		'<h2 class="success-msg">Click on a face to view demographic information</h2>'
	);
	$('#js-results').append($(h2));
	$('#js-results').fadeIn(500);
}

function errorMessage() {
	const msg =
		IMAGEDATA.src === 'github'
			? 'This user does not have a face in their profile picture'
			: 'Please enter an image with at least one face';
	setTimeout(() => {
		$('#js-results').html(`<h3 class="error-msg">${msg}</h3>`);
		loadTryAgainBtn();
	}, 500);

	$('#js-results').fadeIn(1000);
}

function gitHubErrorMessage() {
	setTimeout(() => {
		$('#js-results').html(
			'<h3 class="error-msg">No GitHub user found. Please try again.</h3>'
		);
		loadTryAgainBtn();
	}, 500);

	$('#js-results').fadeIn(1000);
}

function handleFacesMessage() {
	const h2 = $('<h3>').attr({
		class: 'face-msg box-unclicked-msg',
		id: 'js-face-msg'
	});
	const faceCount = IMAGEDATA.faces[0].length;
	const msg =
		faceCount === 1 ? '1 Face Detected' : `${faceCount} Faces Detected`;
	$(h2).html(msg);
	return h2;
}

//Create Image Tag
function createImgTag(imgSrc) {
	const alt = IMAGEDATA.faces[0]
		? IMAGEDATA.faces[0].length > 1
			? "A picture with people's faces"
			: "A picture with a person's face"
		: 'An image you submitted';
	return `<img id="js-face-img" class="face-img" src=${imgSrc} alt="${alt}">`;
}

//Display image on page
function handleImage(image) {
	const dataContainer = $('<div>').attr({
		class: 'data-container',
		id: 'js-data-container'
	});
	$('#js-results').append($(dataContainer));
	const div = $('<div>').attr({
		class: 'image-container box-unclicked-img ',
		id: 'js-image-container'
	});
	$('#js-data-container').append(handleFacesMessage());
	div.append(createImgTag(image));
	$('#js-data-container').append($(div));
}

//Save width and height of image to IMAGEDATA
function handleLoadImage() {
	$('#js-face-img').on('load', () => {
		IMAGEDATA.width = $('#js-face-img').width();
		IMAGEDATA.height = $('#js-face-img').height();
		loadFaceBox();
	});
}

//Create data to make face box style
function handlefaceboxData({ top, bottom, left, right }) {
	const height = IMAGEDATA.height;
	const width = IMAGEDATA.width;
	const obj = {
		top: `${Math.round(top * height * 100) / 100}px`,
		bottom: `${Math.round((height - bottom * height) * 100) / 100}px`,
		left: `${Math.round(left * width * 100) / 100}px`,
		right: `${Math.round((width - right * width) * 100) / 100}px`
	};
	return obj;
}

//Update boundingbox data based on image width/height
function updateBoundingBox() {
	IMAGEDATA.faces[0].forEach(face => {
		face.boundingBox = handlefaceboxData(face.boundingBox);
	});
}

//Create facebox template and add styles from boundingbox
function createBoundingBoxTag(face, tabIndex) {
	const css = face.boundingBox;
	const attr = {
		id: face.id,
		class: 'bounding-box',
		tabIndex,
		css
	};
	return $('<div>', attr);
}

//Display a box for each face
function displayBoundingBox() {
	let tabIndex = 1;
	IMAGEDATA.faces[0].forEach(face => {
		tabIndex++;
		$('#js-image-container').append(createBoundingBoxTag(face, tabIndex));
	});
}

//Display facebox or faceboxes on the page
function loadFaceBox() {
	updateBoundingBox();
	displayBoundingBox();
}

function createDataRowHead(string) {
	const tableRowHead = $('<tr>');
	tableRowHead.append(`<th>${string}</th><th>Probability</th>`);
	return tableRowHead;
}

function createTableRowData(probability) {
	const tableRow = $('<tr>');
	tableRow.html(`<td>${probability.key1}</td><td>${probability.key2}</td>`);
	return tableRow;
}

//create table based on face selected
function createDataTable(face) {
	const table = $('<table>', {
		class: 'data-table'
	});
	table.append(createDataRowHead('Gender'));
	table.append(createTableRowData(face.genderProbability));
	table.append(createDataRowHead('Age'));
	table.append(createTableRowData(face.ageProbability));
	table.append(createDataRowHead('Multicultural Appearance'));
	face.raceProbabilities.forEach(prob => {
		table.append(createTableRowData(prob));
	});

	$('#js-table-container').html(table);
}

function loadDataCallback(e) {
	$('#js-image-container').removeClass('box-unclicked-img');
	$('#js-face-msg').removeClass('box-unclicked-msg');
	$('#js-data-container').append(
		$('<div>').attr({ class: 'table-container', id: 'js-table-container' })
	);
	const selectedFaceData = IMAGEDATA.faces[0].find(
		face => face.id === e.target.id
	);
	createDataTable(selectedFaceData);
	loadFaceBox();
}

//Determine what data to show based on what face was clicked on
function handleLoadData() {
	$('#js-results').on('click', '.bounding-box', loadDataCallback);

	$('#js-results').on('keypress', '.bounding-box', function(e) {
		if (e.which === 13) loadDataCallback(e);
	});
}

//Handle gender and age data
function handleProbability(dataArr) {
	const data = dataArr[0];
	const probability = data.value;
	const obj = {
		key1: data.name,
		key2: `${(probability.toFixed(3) * 100).toFixed(1)}%`
	};
	return obj;
}

//Save demographics data as object for each face
function handleFaceData(faceData) {
	//Assign object values to constants from json path
	const ageArray = faceData.data.face.age_appearance.concepts;
	const genderArray = faceData.data.face.gender_appearance.concepts;
	const raceArray = faceData.data.face.multicultural_appearance.concepts;
	const boundingBox = faceData.region_info.bounding_box;
	const obj = {
		id: faceData.id,
		ageProbability: handleProbability(ageArray),
		genderProbability: handleProbability(genderArray),
		raceProbabilities: [],
		boundingBox: {
			bottom: boundingBox.bottom_row,
			left: boundingBox.left_col,
			right: boundingBox.right_col,
			top: boundingBox.top_row
		}
	};
	//Push each race object to larger face object
	raceArray.forEach(race => {
		const value = race.value;
		const raceObj = {
			key1: race.name,
			key2: `${(value.toFixed(4) * 100).toFixed(2)}%`
		};
		obj.raceProbabilities.push(raceObj);
	});
	return obj;
}

function handleValidImage(data, image) {
	loadTryAgainBtn();
	successMessage();
	const faceData = data.regions;
	//Clear data in IMAGEDATA object
	IMAGEDATA.faces = [];
	IMAGEDATA.width = IMAGEDATA.height = 0;
	//Pushing facebox data with age, gender, race appearance data to array as objects
	IMAGEDATA.faces.push(faceData.map(handleFaceData));
	handleImage(image);
	handleLoadImage();
}

function handleInvalidImage() {
	errorMessage();
}

function handleDemoData(data) {
	const demoData = data.outputs[0].data;
	const image = IMAGEDATA.src;
	demoData.regions ? handleValidImage(demoData, image) : handleInvalidImage();
}

function getDemoData(link, isGitHub = true) {
	if (!isGitHub) {
		IMAGEDATA.src = link;
	}
	//clear old data from previous search
	clearData(50);
	//Getting data from Clarifai API
	getClarifaiData(link);
}

function handleGitHubUser(user) {
	IMAGEDATA.src = user.avatar_url || '';
	user.message ? gitHubErrorMessage() : getDemoData(IMAGEDATA.src);
}

//Prevent user from typing spaces in input
function preventSpaces() {
	$('#js-search').on('keypress', '#input', e => {
		const key = e ? event.which : window.event.keyCode;
		if (key == 32) return false;
	});
}

function getGitHubUser(input) {
	clearData();
	fetch(`https://api.github.com/users/${input}`)
		.then(res => res.json())
		.then(handleGitHubUser)
		.catch(err => console.log(err));
}

function clearData(time = 300) {
	setTimeout(() => {
		$('#js-image').empty();
		$('#js-image-data').empty();
		$('#js-message').empty();
		$('#js-search').empty();
		$('#js-results').empty();
	}, time);
}

function watchForm() {
	preventSpaces();
	$('#js-search').on('submit', '#js-search-form', e => {
		e.preventDefault();
		const radio = $("input[name='user-choice']:checked")
			.val()
			.toLowerCase();
		IMAGEDATA.src = radio;
		// Image link or username submitted by user
		const input = $('#input')
			.val()
			.replace(/\s+/g, '');
		$('#js-search').fadeOut(300);
		radio === 'image' ? getDemoData(input, false) : getGitHubUser(input);
	});
}

function loadForm() {
	setTimeout(() => {
		$('#js-search').append(createSearchForm);
		$('#js-search-form').append(createRadios);
		$('#js-search-form').append(
			$('<div>').attr({
				id: 'js-input-container',
				class: 'input-container'
			})
		);
		$('#js-search').show(0);
		handleRadioCheck();
	}, 1000);
}

function createSearchForm() {
	const attr = {
		id: 'js-search-form',
		class: 'search-form fadein'
	};
	return $('<form>', attr);
}

function createRadioInput(string) {
	const attr = {
		id: string,
		class: 'radio transition',
		type: 'radio',
		name: 'user-choice',
		value: string
	};
	return $('<input>', attr);
}

function createRadioLabel(string) {
	const attr = {
		class: 'transition radio-label',
		for: string,
		tabindex: 1
	};
	return $(`<label>${string}</label>`).attr(attr);
}

function createRadios() {
	const fieldset = $('<fieldset>').attr('class', 'radio-container');
	fieldset.append(
		'<legend class="src-legend">What source are you using?</legend>'
	);
	fieldset.append(createRadioInput('Image'));
	fieldset.append(createRadioLabel('Image'));
	fieldset.append(createRadioInput('GitHub'));
	fieldset.append(createRadioLabel('GitHub'));
	return fieldset;
}

//Clear app description text ferom page
function clearAppDescriptionAnimation() {
	$('#js-title').animate({ margin: '10px 0', fontSize: '35px' }, 1000);
	$('#js-title-section .title')
		.nextAll()
		.fadeOut(300);
	$('#js-search').empty();
}

function createSearchInput() {
	const searchBox = $('<div>').attr('class', 'search-box');
	$(searchBox).append(
		$('<input>').attr({ type: 'text', name: 'input', id: 'input' })
	);
	$(searchBox).append(
		$('<button>Search</button>').attr({ class: 'submit-btn', type: 'submit' })
	);
	$('#js-input-container').append($(searchBox));
	$('#js-input-container').fadeIn(300);
}

//Create the proper file input with container
function createFileInput() {
	const div = $('<div>').attr({
		id: 'js-file-input-container',
		class: 'file-input-container'
	});
	div.append(
		'<div class="input-box"><input type="file" name="file" id="file"/><label for="file" class="file-label"><strong>Choose a file</strong><span class="box-dragndrop"> or drag it here</span>.</label></div>'
	);
	div.append('<div class="box-uploading">Uploading</div>');
	div.append('<div class="box-success">Done!</div>');
	div.append('<div class="box-error">Error!</div>');
	$('#js-input-container').append(div);
	checkBrowserDragnDrop();
}

//Check if user's browswer can dragndrop files
function checkBrowserDragnDrop() {
	const isAdvancedUpload = function() {
		const div = document.createElement('div');
		return (
			('draggable' in div || ('ondragstart' in div && 'ondrop' in div)) &&
			'FormData' in window &&
			'FileReader' in window
		);
	};
	if (isAdvancedUpload) {
		let droppedFile = false;
		$('#js-file-input-container').addClass('has-advanced-upload');
		$('#js-file-input-container')
			.on('drag dragstart dragend dragover dragenter dragleave drop', function(
				e
			) {
				e.preventDefault();
				e.stopPropagation();
			})
			.on('dragover dragenter', function() {
				$('#js-file-input-container').addClass('is-dragover');
			})
			.on('dragleave dragend drop', function() {
				$('#js-file-input-container').removeClass('is-dragover');
			})
			.on('drop', function(e) {
				droppedFile = e.originalEvent.dataTransfer.files[0];
				handleReaderOnLoad(droppedFile);
			});
	}
}

function handleFileInput() {
	$('#js-search').on('change', '#file', function() {
		if (this.files && this.files[0]) {
			const file = $('#file')[0].files[0];
			handleReaderOnLoad(file);
		}
	});
}

function handleReaderOnLoad(file) {
	const reader = new FileReader();
	reader.onload = function(img) {
		IMAGEDATA.src = img.target.result;
		clearData(50);
		const imgBase64 = { base64: reader.result.split('base64,')[1] };
		getClarifaiData(imgBase64);
	};
	reader.readAsDataURL(file);
}

function getClarifaiData(input) {
	app.models
		.predict(appModel, input)
		.then(handleDemoData)
		.catch(errorMessage);
}

function handleImageChecked() {
	$('label[for="Image"]').addClass('checked');
	$('label[for="GitHub"]').removeClass('checked');
	$('#js-input-container')
		.empty()
		.hide();
	$('#js-input-container').append(
		$('<label>Paste link below</label>').attr({
			for: 'input',
			class: 'input-label'
		})
	);
	createSearchInput();
	createFileInput();
}

function handleGitHubChecked() {
	$('label[for="GitHub"]').addClass('checked');
	$('label[for="Image"]').removeClass('checked');
	$('#js-input-container')
		.empty()
		.hide();
	$('#js-input-container').append(
		$('<label>Enter GitHub username</label>').attr({
			for: 'input',
			class: 'input-label'
		})
	);
	createSearchInput();
}

//Display certain input container based on which input was clicked
function handleRadioCheck() {
	$('#js-search').on('change', 'input[name=user-choice]:radio', () => {
		$('#GitHub').is(':checked') ? handleGitHubChecked() : handleImageChecked();
	});
}

//Begin to load form after button press
function handleStartClick() {
	$('#js-start-btn').click(() => {
		clearAppDescriptionAnimation();
		loadForm();
	});
}

function handleScreenResize() {
	$(window).resize(() => {
		if (IMAGEDATA.width || IMAGEDATA.height) loadFaceBox();
	});
}

function loadApp() {
	// checkBrowserDragnDrop();
	handleStartClick();
	handleTryAgain();
	handleFileInput();
	watchForm();
	handleLoadData();
	handleScreenResize();
}

$(loadApp);
