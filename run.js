const goalsService = require('./src/goals.js');
const actionsService = require('./src/actions.js');

const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

const goals = require('./database/goals.json');
const env = require('./env.json');

const screen = {
    width: 640,
    height: 480
};

async function executor(driver) {
    console.log(`Staring executor...`);

    console.log(JSON.stringify(goals));

    for (let i = 0; i < goals.villages.length; i++) {
        const village = goals.villages[i];

        // TODO: uncomment
        // if (!village.enabled) {
        //     console.log(`Skipping village: ${villageName} - it's disabled`);
        //     continue;
        // }

        const villageName = village.name;
        const steps = village.steps;
    
        console.log(`Doing village: ${villageName}`);
    
        const nextStep = steps.filter(step => step.state !== 'DONE')[0];
        if (nextStep) {
            console.log(`Doing the next step: ${JSON.stringify(nextStep)}`);
    
            const result = await doStep(driver, villageName, nextStep);
            if (result !== 'BUSY' && result !== 'UNKNOWN') {
                nextStep.state = result;
            }
        }
    }

    console.log(`Finished executor, saving state to JSON...`);
    const jsonString = JSON.stringify(goals, null, 4);
    fs.writeFileSync('./database/goals.json', jsonString);
}

(async function run() {
    let driver = env.headless ? new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless().windowSize(screen))
    .build()
    :
    new Builder()
    .forBrowser('chrome')
    .build();

  try {
    await actionsService.login(driver);
    
    await executor(driver);


  } finally {
    console.log('Finishing script');
    await actionsService.wait(1000);
    await driver.quit();
  }
})();

async function doStep(driver, villageName, step) {
    let stepResult = 'UNKNOWN';
    try {
        if (step.type === 'MAIN_BUILDING') {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'MAIN_BUILDING', step.level);
        } else if (step.type === 'ALL_RESOURCE_FIELDS') {
            stepResult = await goalsService.allResourceLevelAt(driver, villageName, step.level);
        } else if (step.type === 'WAREHOUSE') {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'WAREHOUSE', step.level);
        } else if (step.type === 'GRANARY') {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'GRANARY', step.level);
        } else if (step.type === 'RESIDENCE' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'RESIDENCE', step.level);
        } else if (step.type === 'MARKETPLACE' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'MARKETPLACE', step.level);
        } else if (step.type === 'RALLY_POINT' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'RALLY_POINT', step.level);
        } else if (step.type === 'BARRACKS' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'BARRACKS', step.level);
        } else if (step.type === 'ACADEMY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'ACADEMY', step.level);
        } else if (step.type === 'CRANNY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'CRANNY', step.level);
        } else if (step.type === 'EMBASSY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'EMBASSY', step.level);
        } else if (step.type === 'SMITHY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'SMITHY', step.level);
        } else if (step.type === 'STABLE' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'STABLE', step.level);
        } else if (step.type === 'TOWN_HALL' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'TOWN_HALL', step.level);
        } else if (step.type === 'BRICKYARD' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'BRICKYARD', step.level);
        } else if (step.type === 'GRAIN_MILL' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'GRAIN_MILL', step.level);
        } else if (step.type === 'SAWMILL' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'SAWMILL', step.level);
        } else if (step.type === 'IRON_FOUNDRY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'IRON_FOUNDRY', step.level);
        } else if (step.type === 'BAKERY' ) {
            stepResult = await goalsService.buildingLevelAt(driver, villageName, 'BAKERY', step.level);
        } else {
            console.log(`Unknown step: ${step}`);
        }
    } catch (er) {
        // TODO: will be impolemented
        // console.log(`Error ${er}, printing page source`)
        // console.log(await driver.getPageSource());
        throw er;
    }
    return stepResult;
}


