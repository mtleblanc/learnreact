const express = require("express");
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const DATA_FILE = path.join(__dirname, 'data.json');

const app = express();

app.listen(4400, ()=> { console.log("Running on port 4400"); });
app.use(bodyParser.json());

app.get("/api/timers", (req, res, next) => {
	fs.readFile(DATA_FILE, (err, data)=>{
		res.setHeader('Cache-Control', 'no-cache');
		res.json(JSON.parse(data));
	});
});

app.post("/api/timers", (req, res, next) => {
	const content = req.body;
	if(!content.id)
	{
		res.status(400).send();
		return;
	}
	fs.readFile(DATA_FILE, (err, data)=> {
		const timers = JSON.parse(data);
		if(timers.some(t=>t.id === content.id)) {
			res.status(409).send();
			return;
		}
		const newTimer = {
			id: content.id,
			title: content.title,
			project: content.project,
			elapsed: 0,
			startTime: null,
		};
		timers.push(newTimer);
		fs.writeFile(DATA_FILE, JSON.stringify(timers), () => {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(newTimer);
		});
	});
});

app.post("/api/timers/start", (req,res,next) => {
	const content = req.body;
	if(!content.id)
	{
		res.status(400).send();
		return;
	}
	fs.readFile(DATA_FILE, (err, data)=> {
		const timers = JSON.parse(data);
		if(!timers.some(t=>t.id === content.id)) {
			res.status(404).send();
			return;
		}
		timers = timers.map(t=>{
			if(t.id === content.id) {
				if(t.startTime === null)
					t.startTime = new Date();
			}
			return t;
		});
		fs.writeFile(DATA_FILE, JSON.stringify(timers), () => {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(timers);
		});
	});
});

app.post("/api/timers/stop", (req,res,next) => {
	const content = req.body;
	if(!content.id)
	{
		res.status(400).send();
		return;
	}
	fs.readFile(DATA_FILE, (err, data)=> {
		const timers = JSON.parse(data);
		if(!timers.some(t=>t.id === content.id)) {
			res.status(404).send();
			return;
		}
		timers = timers.map(t=>{
			if(t.id === content.id) {
				if(t.startTime !== null) {
					t.elapsed += new Date() - t.startTime;
					t.startTime = null;
				}
			}
			return t;
		});
		fs.writeFile(DATA_FILE, JSON.stringify(timers), () => {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(timers);
		});
	});
});

app.put("/api/timers", (req,res,next) => {
	const content = req.body;
	if(!content.id)
	{
		res.status(400).send();
		return;
	}
	fs.readFile(DATA_FILE, (err, data)=> {
		const timers = JSON.parse(data);
		if(!timers.some(t=>t.id === content.id)) {
			res.status(404).send();
			return;
		}
		timers = timers.map(t=>{
			if(t.id === content.id) {
				t.title = content.title;
				t.project = content.project;
			}
			return t;
		});
		fs.writeFile(DATA_FILE, JSON.stringify(timers), () => {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(timers);
		});
	});
});

app.delete("/api/timers", (req,res,next) => {
	const content = req.body;
	if(!content.id)
	{
		res.status(400).send();
		return;
	}
	fs.readFile(DATA_FILE, (err, data)=> {
		const timers = JSON.parse(data);
		if(!timers.some(t=>t.id === content.id)) {
			res.status(404).send();
			return;
		}
		timers = timers.filter(t=>t.id !== content.id);
		fs.writeFile(DATA_FILE, JSON.stringify(timers), () => {
			res.setHeader('Cache-Control', 'no-cache');
			res.json(timers);
		});
	});
});