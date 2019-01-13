const app = new Clarifai.App({ apiKey: 'cfd1f224ea07473a8ba98dfffe07943c' });
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const unsplashKey =
	'ed6aecb09984de2f5a1170ed2c7c8247773472f3a719fd01ef4d220165c21ba0';
const IMAGEDATA = {
	faces: [],
	width: 0,
	height: 0
};

//Create Image Tag
function successMsg() {
	$('#js-message').html('Click on a face to view data');
}

function createImgTag(imgSrc) {
	const alt =
		IMAGEDATA.faces[0].length > 1
			? "A picture with people's faces"
			: "A picture with a person's face";
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
	const table = $('<table>', { id: 'data-table' });
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
		key2: probability.toFixed(3)
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
		const raceObj = { key1: race.name, key2: value.toFixed(3) };
		obj.raceProbabilities.push(raceObj);
	});
	return obj;
}

function handleDemoData(data) {
	successMsg();
	const image = data.outputs[0].input.data.image.url;
	const faceData = data.outputs[0].data.regions;
	//Clear data in IMAGEDATA object
	IMAGEDATA.faces = [];
	IMAGEDATA.width = IMAGEDATA.height = 0;
	//Pushing facebox data with age, gender, race appearance data to array as objects
	IMAGEDATA.faces.push(faceData.map(handleFaceData));
	handleImage(image);
	handleLoadImage();
}

function getDemoData(link) {
	//clear old data from previous search
	clearData();
	//Getting data from Clarifai API
	app.models
		.predict(appModel, link)
		.then(handleDemoData)
		.catch(err => console.log(err));
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

function handleGithubUser(user) {
	fetch(`https://api.github.com/users/${user}`)
		.then(res => res.json())
		.then(json => getDemoData(json.avatar_url))
		.catch(err => console.log(err));
}

function getGitHubUser() {
	$('#js-github-form').submit(e => {
		e.preventDefault();
		const input = $('#github-input').val();
		handleGithubUser(input);
	});
}

function clearData() {
	$('#js-image-data').empty();
	$('#js-message').empty();
}

function watchForm() {
	$('#js-user-input-form').submit(e => {
		e.preventDefault();
		// Image link submitted by user
		const input = $('#image-input').val();
		getDemoData(input);
	});
}

function loadApp() {
	watchForm();
	getRandomFace();
	getGitHubUser();
	handleLoadData();
}

$(loadApp);
