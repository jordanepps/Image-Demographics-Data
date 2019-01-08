const app = new Clarifai.App({ apiKey: 'cfd1f224ea07473a8ba98dfffe07943c' });
const appModel = 'c0c0ac362b03416da06ab3fa36fb58e3';
const img =
	'https://www.skintour.com/wp-content/uploads/2015/08/atikh-bana-203831-e1494369481993-624x428.jpg';

$(function() {
	app.models
		.predict(appModel, img)
		.then(res => console.log(res))
		.catch(err => console.log(err));
});
