exports.getDate = function () {
	let options = {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
	};
	let today = new Date();

	let day = today.toLocaleDateString('en-US', options);
	return day;
};

exports.getDay = function () {
	let options = {
		weekday: 'long',
	};
	let today = new Date();

	let day = today.toLocaleDateString('en-US', options);
	return day;
};
