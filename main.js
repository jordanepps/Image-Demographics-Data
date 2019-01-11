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

function handleProbability(value, dataArr) {
	console.log(dataArr);
	const data = dataArr[0];
	const obj = {
		[value]: data.name,
		probabalility: data.value
	};
	return obj;
}

//Save demographics data as object for each face
function handleFaceData(faceData) {
	// console.log(faceData.data);
	//Assign age array values to constant from json path
	const ageArray = faceData.data.face.age_appearance.concepts;
	const genderArray = faceData.data.face.gender_appearance.concepts;
	const obj = {
		id: faceData.id,
		ageProbability: handleProbability('age', ageArray),
		genderProbability: handleProbability('gender', genderArray),
		raceProbabilities: 0,
		boundingBox: {
			bottomRow: faceData.region_info.bounding_box.bottom_row,
			leftCol: faceData.region_info.bounding_box.left_col,
			rightCol: faceData.region_info.bounding_box.right_col,
			topRow: faceData.region_info.bounding_box.top_row
		}
	};
	return obj;
}

function handleDemoData(data) {
	// console.log(data);
	// console.log(data.outputs[0].data.regions);
	//Pushing facebox data with age, gender, race appearance data to array as objects
	FACES.push(data.outputs[0].data.regions.map(handleFaceData));
	console.log(FACES);
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
