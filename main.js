const app = new Clarifai.App({ apiKey: 'cfd1f224ea07473a8ba98dfffe07943c' });
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const unsplashKey =
	'ed6aecb09984de2f5a1170ed2c7c8247773472f3a719fd01ef4d220165c21ba0';
const IMAGEDATA = {
	faces: [],
	width: 0,
	height: 0
};

// $(function() {
// 	app.models
// 		.predict(appModel, img)
// 		.then(res => console.log(res))
// 		.catch(err => console.log(err));
// 	fetch(
// 		`https://api.unsplash.com/photos/random?query=face&client_id=${unsplashKey}`
// 	)
// 		.then(res => res.json())
// 		.then(json => console.log(json))
// 		.catch(err => console.log(err));
// 	fetch('https://api.github.com/users/jordanepps')
// 		.then(res => res.json())
// 		.then(json => console.log(json.avatar_url))
// 		.catch(err => console.log(err));
// });

/*
May have to call the function to set facebox on screen resize
May want to add image src to IMAGEDATA and pull from that
*/

//Create Image Tag
function createImgTag(imgSrc) {
	const alt =
		IMAGEDATA.faces[0].length > 1
			? "A picture with people's faces"
			: "A picture with a person's face";
	return `<img class="js-face-img face-img" src=${imgSrc} alt=${alt}>`;
}
//Display image on page
function handleImage(image) {
	console.log('image displayed');
	$('#js-image').html(createImgTag(image));
}
//Save width and height of image to IMAGEDATA
function handleImageLoad() {
	$('.js-face-img').on('load', () => {
		console.log('image loaded');
		IMAGEDATA.width = $('.js-face-img').width();
		IMAGEDATA.height = $('.js-face-img').height();
		loadFaceBox();
	});
}

//Create data to make face box style
function handlefaceboxData({ top, bottom, left, right }) {
	const height = IMAGEDATA.height;
	const width = IMAGEDATA.width;
	const obj = {
		top: top * height,
		bottom: height - bottom * height,
		left: left * width,
		right: width - right * height
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
//Create a facebox for each face
//Display facebox or faceboxes on the page
function loadFaceBox() {
	updateBoundingBox();
	console.log('Load facebox');
	console.log(IMAGEDATA.faces[0]);
}

function handleProbability(value, dataArr) {
	const data = dataArr[0];
	const obj = {
		[value]: data.name,
		probabalility: data.value
	};
	return obj;
}

//Save demographics data as object for each face
function handleFaceData(faceData) {
	console.log('image data saved');
	//Assign object values to constants from json path
	const ageArray = faceData.data.face.age_appearance.concepts;
	const genderArray = faceData.data.face.gender_appearance.concepts;
	const raceArray = faceData.data.face.multicultural_appearance.concepts;
	const boundingBox = faceData.region_info.bounding_box;
	const obj = {
		id: faceData.id,
		ageProbability: handleProbability('age', ageArray),
		genderProbability: handleProbability('gender', genderArray),
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
		const raceObj = { race: race.name, value: race.value };
		obj.raceProbabilities.push(raceObj);
	});
	return obj;
}

function handleDemoData(data) {
	console.log('Valid image');
	const image = data.outputs[0].input.data.image.url;
	const faceData = data.outputs[0].data.regions;
	//Pushing facebox data with age, gender, race appearance data to array as objects
	IMAGEDATA.faces.push(faceData.map(handleFaceData));
	handleImage(image);
	handleImageLoad();
}

function getDemoData(link) {
	//Getting data from Clarifai API
	app.models
		.predict(appModel, link)
		.then(handleDemoData)
		.catch(err => console.log(err));
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
}

$(loadApp);
