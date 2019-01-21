const app = new Clarifai.App({
	apiKey: 'cfd1f224ea07473a8ba98dfffe07943c'
});
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const unsplashKey =
	'ed6aecb09984de2f5a1170ed2c7c8247773472f3a719fd01ef4d220165c21ba0';
const IMAGEDATA = {
	faces: [],
	width: 0,
	height: 0
};

function handleTryAgain() {
	$('#js-results').on('click', '#js-try-again', () => {
		clearData();
		loadForm();
	});
}

function loadTryAgainBtn() {
	const div = $('<div>').attr('class', 'try-again-container');
	$(div).append(createTryAgainBtn);
	$('#js-results').append(div);
	$('#js-search').fadeIn(500);
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
	$('#js-message').html('Click on a face to view data');
}

function errorMessage() {
	console.log('error');
	$('#js-message').html('Please enter a valid image with a face/faces');
}

function gitHubErrorMessage() {
	setTimeout(() => {
		$('#js-results').html(
			'<h3 class="no-github-msg">No GitHub user found. Please try again.</h3>'
		);
		loadTryAgainBtn();
	}, 500);

	$('#js-results').fadeIn(1000);
}

//Create Image Tag
function createImgTag(imgSrc) {
	const alt = IMAGEDATA.faces[0]
		? IMAGEDATA.faces[0].length > 1
			? "A picture with people's faces"
			: "A picture with a person's face"
		: 'An image you submitted';
	return `<img class="js-face-img face-img" src=${imgSrc} alt="${alt}">`;
}
//Display image on page
function handleImage(image) {
	console.log('image displayed');
	$('#js-image').html(createImgTag(image));
}
//Save width and height of image to IMAGEDATA
function handleLoadImage() {
	$('.js-face-img').on('load', () => {
		console.log('image loaded');
		IMAGEDATA.width = $('.js-face-img').width();
		IMAGEDATA.height = $('.js-face-img').height();
		loadFaceBox();
	});
}

//Create data to make face box style
function handlefaceboxData({ top, bottom, left, right }) {
	console.log('Calculating box style');
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
	console.log('Saving new box data');
	IMAGEDATA.faces[0].forEach(face => {
		face.boundingBox = handlefaceboxData(face.boundingBox);
	});
}

//Create facebox template and add styles from boundingbox
function createBoundingBoxTag(face) {
	const css = face.boundingBox;
	const attr = {
		id: face.id,
		class: 'bounding-box',
		css
	};
	return $('<div>', attr);
}

//Display a box for each face
function displayBoundingBox() {
	console.log('Displaying face box');
	IMAGEDATA.faces[0].forEach(face => {
		$('#js-image').append(createBoundingBoxTag(face));
	});
}

//Display facebox or faceboxes on the page
function loadFaceBox() {
	console.log('Loading facebox');
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
		id: 'data-table'
	});
	table.append(createDataRowHead('Gender'));
	table.append(createTableRowData(face.genderProbability));
	table.append(createDataRowHead('Age'));
	table.append(createTableRowData(face.ageProbability));
	table.append(createDataRowHead('Multicultural Appearance'));
	face.raceProbabilities.forEach(prob => {
		table.append(createTableRowData(prob));
	});
	$('#js-image-data').html(table);
}

//Determine what data to show based on what face was clicked on
function handleLoadData() {
	$('#js-image').on('click', '.bounding-box', e => {
		//MDN SHOWS FIND METHOD MAY NOT WORK IN IE!!
		const selectedFaceData = IMAGEDATA.faces[0].find(
			face => face.id === e.target.id
		);
		createDataTable(selectedFaceData);
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
	console.log('Saving image data');
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

function handleInvalidImage(image) {
	handleImage(image);
	errorMessage();
}

function handleDemoData(data) {
	const demoData = data.outputs[0].data;
	const image = data.outputs[0].input.data.image.url;
	$('#js-results').css('display', 'grid');
	demoData.regions
		? handleValidImage(demoData, image)
		: handleInvalidImage(image);
}

function getDemoData(link) {
	//clear old data from previous search
	clearData();
	//Getting data from Clarifai API
	app.models
		.predict(appModel, link)
		.then(handleDemoData)
		.catch(errorMessage);
}

function handleRandomFace(data) {
	const randomImg = data.urls.regular;
	getDemoData(randomImg);
}

//Get random face from unsplash api
function getRandomFace() {
	$('#js-search').on('click', '#js-random', () => {
		fetch(
			`https://api.unsplash.com/photos/random?query=face&client_id=${unsplashKey}`
		)
			.then(res => res.json())
			.then(handleRandomFace)
			.catch(err => console.log(err));
	});
}

function handleGitHubUser(user) {
	user.message ? gitHubErrorMessage() : getDemoData(user.avatar_url);
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

function clearData() {
	setTimeout(() => {
		$('#js-image').empty();
		$('#js-image-data').empty();
		$('#js-message').empty();
		$('#js-search').empty();
		$('#js-results').empty();
	}, 300);
}

function watchForm() {
	preventSpaces();
	$('#js-search').on('submit', '#js-search-form', e => {
		e.preventDefault();
		const radio = $("input[name='user-choice']:checked")
			.val()
			.toLowerCase();
		// Image link or username submitted by user
		const input = $('#input')
			.val()
			.replace(/\s+/g, '');
		$('#js-search').fadeOut(300);
		radio === 'image' ? getDemoData(input) : getGitHubUser(input);
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
	$('#js-title-section .title')
		.nextAll()
		.fadeOut(300);
	$('#js-search').empty();
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
	$('#js-input-container').append(
		$('<input>').attr({ type: 'text', name: 'input', id: 'input' })
	);
	$('#js-input-container').append(
		$('<button>Search</button>').attr({ class: 'submit-btn', type: 'submit' })
	);
	$('#js-input-container').fadeIn(300);
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
	$('#js-input-container').append(
		$('<input>').attr({ type: 'text', name: 'input', id: 'input' })
	);
	$('#js-input-container').append(
		$('<button>Search</button>').attr({ class: 'submit-btn', type: 'submit' })
	);
	$('#js-input-container').fadeIn(300);
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

function loadApp() {
	handleStartClick();
	handleTryAgain();
	watchForm();
	getRandomFace();
	handleLoadData();
}

$(loadApp);
