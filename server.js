const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use( express.static(__dirname + '/resources') );
app.use( express.urlencoded({
    extended: true
}) );
app.use( express.json() );

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'resources', 'interface.html'));
});

app.post('/api/action', (req, res) => {
    // example

    // log.debug(`POST '/register' { user: ${req.body.user}, password: ##hashed## } `);

    // // logika rejestrowania gracza
    // const player = playerService.getPlayerByName(db, req.body.user);
    // if (player) {
    //     // gracz istnieje
    //     res.send('fail');
    // } else {
    //     const newPlayer = playerService.registerPlayer(db, req.body.user, req.body.password)
    //     // TODO: dodać strategie wybierania startowego położenia
    //     worldService.foundNewVillage( db, newPlayer, { x: Math.floor(Math.random() * 50), y: Math.floor(Math.random() * 50)} );
    //     const token = authService.getPlayerToken(db, req.body.user, req.body.password);

    //     res.send(token);
    // }
});

app.post('/api/villages', (req, res) => {
    console.log(`POST /api/villages`);
    // get all villages with defined steps
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'theramorphus' &&  password === 'letmein') {
        const goals = require('./database/goals.json');

        res.send(goals.villages);
    } else {
        res.send([]);
    }

    // const jsonString = JSON.stringify(goals, null, 4);
    // fs.writeFileSync('./database/goals.json', jsonString);
});

app.post('/api/villages/:village', (req, res) => {
    const village = req.params.village;
    console.log(`PUT /api/villages/${village}`);
    const username = req.body.username;
    const password = req.body.password;

    if (username === 'theramorphus' &&  password === 'letmein') {
        const goals = require('./database/goals.json');

        goals.villages.push({name: village, steps: []});

        const jsonString = JSON.stringify(goals, null, 4);
        fs.writeFileSync('./database/goals.json', jsonString);

        res.send('done');
    } else {
        res.send('fail');
    }
    // edit or create village
});

app.delete('/api/villages/:village', (req, res) => {
    const village = req.params.village;
    console.log(`DELETE /api/villages/${village}`);
    // delete village
});

app.get('/api/villages/:village/steps', (req, res) => {
    const village = req.params.village;
    console.log(`GET /api/villages/${village}/steps`);
    // get all steps for the village
});

app.post('/api/villages/:village/steps', (req, res) => {
    const village = req.params.village;
    const username = req.body.username;
    const password = req.body.password;
    const type = req.body.type;
    const level = req.body.level;

    console.log(`POST /api/villages/${village}/steps`);

    if (username === 'theramorphus' &&  password === 'letmein') {
        const goals = require('./database/goals.json');

        const vila = goals.villages.find(villa => villa.name === village);

        if (vila) {   
            const validatedLevel = Number(level);
            const validatedType = type; // TODO: validate

            vila.steps.push({type: validatedType, level: validatedLevel, state: 'PENDING'});
    
            const jsonString = JSON.stringify(goals, null, 4);
            fs.writeFileSync('./database/goals.json', jsonString);

            res.send('done');
        } else {
            res.send('fail');
        }
    } else {
        res.send('fail');
    }

    // add new step to the village
});

app.post('/api/villages/:village/steps/delete', (req, res) => {
    const village = req.params.village;
    const username = req.body.username;
    const password = req.body.password;
    console.log(`DELETE /api/villages/${village}/steps`);
    // remove all steps from village
    if (username === 'theramorphus' &&  password === 'letmein') {
        const goals = require('./database/goals.json');

        const vila = goals.villages.find(villa => villa.name === village);

        if (vila) {   
            vila.steps = [];
    
            const jsonString = JSON.stringify(goals, null, 4);
            fs.writeFileSync('./database/goals.json', jsonString);

            res.send('done');
        } else {
            res.send('fail');
        }
    } else {
        res.send('fail');
    }
});

app.listen(port, () => console.log(`App listening on port ${port}!`) );