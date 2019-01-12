const app = new Clarifai.App({ apiKey: 'cfd1f224ea07473a8ba98dfffe07943c' });
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const unsplashKey =
	'ed6aecb09984de2f5a1170ed2c7c8247773472f3a719fd01ef4d220165c21ba0';
const FACES = [];
// const img =
// 	'https://www.skintour.com/wp-content/uploads/2015/08/atikh-bana-203831-e1494369481993-624x428.jpg';

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

//Display image on page
function displayImage(image) {
	console.log('image displayed');
	const alt =
		FACES[0].length > 1
			? "A picture with people's faces"
			: "A picture with a person's face";
	const imgTag = `<img class="face-img" src=${image} alt="${alt}">`;
	$('#js-image').html(imgTag);
}
//Create function to adjust boundingbox data to fit box style
//Create fucntion to display boxes over image on faces

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
			bottomRow: boundingBox.bottom_row,
			leftCol: boundingBox.left_col,
			rightCol: boundingBox.right_col,
			topRow: boundingBox.top_row
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
	FACES.push(faceData.map(handleFaceData));
	displayImage(image);
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
