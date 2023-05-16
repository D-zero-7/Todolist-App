const express = require('express');
const bodyParser = require('body-parser');
const Date = require(__dirname + '/date.js');
const mongoose = require('mongoose');
const _ = require('lodash');
const dotenv = require('dotenv').config({ path: './.env' });
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
const PORT = 3000;

app.use(express.static('public'));

async function main() {
	try {
		await mongoose
			.connect(
				'mongodb+srv://dheeraj:' +
					process.env.password +
					'@clusterdhee.g5dgcev.mongodb.net/todolistDB?retryWrites=true&w=majority'
			)
			.then(function () {
				console.log('Mongoose connected Successully');
			})
			.catch(function (error) {
				console.log(error);
			});

		const itemsSchema = new mongoose.Schema({
			name: String,
		});

		const listSchema = new mongoose.Schema({
			name: String,
			items: [itemsSchema],
		});

		const CustomList = new mongoose.model('CustomList', listSchema);
		const Item = new mongoose.model('Item', itemsSchema);

		const item1 = new Item({
			name: 'Welcome to Todoist',
		});

		const item2 = new Item({
			name: 'Click the + or press Enter to add a Task',
		});

		const item3 = new Item({
			name: '<------ Click this Checkbox to clear a task',
		});

		const defaultItems = [item1, item2, item3];

		app.get('/', async (req, res) => {
			// let day = Date.getDate();
			try {
				var items = await Item.find({});

				if (items.length === 0) {
					await Item.insertMany(defaultItems)
						.then(function (docs) {})
						.catch(function (error) {
							console.log(error);
						});
					res.redirect('/');
				} else {
					res.render('list', { listType: 'Today', newItem: items });
				}
			} catch (error) {
				console.log(error);
				res.status(500).send('Internal Server Error');
			}
		});

		app.get('/:customListName', async (req, res) => {
			const customListName = _.capitalize(req.params.customListName);
			try {
				const foundList = await CustomList.findOne({ name: customListName });

				if (foundList) {
					res.render('list', {
						listType: foundList.name,
						newItem: foundList.items,
					});
				} else {
					const List = new CustomList({
						name: customListName,
						items: defaultItems,
					});

					await List.save();

					res.redirect('/' + customListName);
				}
			} catch (error) {
				console.log(error);
			}
		});

		app.post('/', async (req, res) => {
			const listName = req.body.list;
			const itemName = new Item({
				name: req.body.newItem,
			});
			if (listName === 'Today') {
				await itemName.save();
				res.redirect('/');
			} else {
				const foundList = await CustomList.findOne({ name: listName });
				foundList.items.push(itemName);
				await foundList.save();
				res.redirect('/' + listName);
			}
		});

		app.post('/delete', async (req, res) => {
			const checkedItemID = req.body.checkbox;
			const listName = req.body.listName;

			if (listName === 'Today') {
				await Item.findByIdAndDelete(checkedItemID);
				res.redirect('/');
			} else {
				try {
					await CustomList.findOneAndUpdate(
						{ name: listName },
						{
							$pull: { items: { _id: checkedItemID } },
						}
					);
					res.redirect('/' + listName);
				} catch (error) {
					console.log(error);
				}
			}
		});

		app.get('/about', (req, res) => {
			res.render('about');
		});

		app.listen(PORT, () => {
			console.log('App is listening on port: ' + PORT);
		});
	} catch (e) {
		console.log(e);
	}
}

main().catch((err) => console.log(err));
