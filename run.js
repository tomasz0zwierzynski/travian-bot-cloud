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

// TODO: config file like "user" "pass" "headless" etc.

async function executor(driver) {
    console.log(`Staring executor...`);

    console.log(JSON.stringify(goals));

    for (let i = 0; i < goals.villages.length; i++) {
        const village = goals.villages[i];

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


