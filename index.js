const {Builder, Browser, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

const tasks = require('./database/tasks.json');
const fs = require('fs');

// TRAVIAN - CONSTS
// const url = 'https://ts21.x2.europe.travian.com/';
const url = 'https://ts7.x1.international.travian.com/';
const buildUrl = 'build.php?id=';

const username = 'placeholder';
const password = 'placeholder';

const RESOURCE_FIELDS_ORDER = [
    {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9},
    {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}
]

const BUILDINGS_TYPES = [
    {type: 'MAIN_BUILDING', id: 26}, {type: 'WAREHOUSE', id: 20}, {type: 'GRANARY', id: 19} // etc. TODO
]

async function executor(driver) {
    console.log(`Staring executor...`);

    console.log(JSON.stringify(tasks));

    for (let i = 0; i < tasks.villages.length; i++) {
        const village = tasks.villages[i];

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
    const jsonString = JSON.stringify(tasks, null, 4);
    fs.writeFileSync('./tasks.json', jsonString);
}

(async function run() {
    let driver = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(new chrome.Options().headless().windowSize(screen))
    .build();
  try {
    await login(driver);

    // const res = await checkResources(driver);
    // console.log(res);
    
    await executor(driver);


  } finally {
    console.log('Finishing script');
    await wait(1000);
    await driver.quit();
  }
})();

async function doStep(driver, villageName, step) {
    let stepResult = 'UNKNOWN';
    if (step.type === 'MAIN_BUILDING') {
        stepResult = await buildingLevelAt(driver, villageName, 'MAIN_BUILDING', step.level);
    } else if (step.type === 'ALL_RESOURCE_FIELDS') {
        stepResult = await allResourceLevelAt(driver, villageName, step.level);
    } else if (step.type === 'WAREHOUSE') {
        stepResult = await buildingLevelAt(driver, villageName, 'WAREHOUSE', step.level);
    } else if (step.type === 'GRANARY') {
        stepResult = await buildingLevelAt(driver, villageName, 'GRANARY', step.level);
    } else {
        console.log(`Unknown step: ${step}`);
    }
    return stepResult;
}

// TRAVIAN - TARGETS
async function allResourceLevelAt(driver, villageName,targetLevel) {
    console.log(`[TARGET] allResourceLevelAt(${villageName}, ${targetLevel})`);
    
    // assuming is logged in
    await goToVillage(driver, villageName);
    
    if (await checkBuildQueue(driver)) {
        console.log('Something already building...');

        console.log(`[TARGET] allResourceLevelAt(...) = BUSY`);
        return 'BUSY';
    }
    
    let fieldsAlreadyAtTargetLevel = 0;
    for (let i = 0; i < RESOURCE_FIELDS_ORDER.length; i++) {
        const field = RESOURCE_FIELDS_ORDER[i];
    
        await goToResourceField(driver, field.id);
        
        if (await checkBuildingLevel(driver) >= targetLevel) {
            console.log('Field already leveled up');
            fieldsAlreadyAtTargetLevel++;
            continue;
        }
        
        const requiredResources = await checkRequiredResources(driver);
        const ownedResources = await checkResources(driver);
        // console.log(`required = ${JSON.stringify(requiredResources)}`);
        // console.log(`owned = ${JSON.stringify(ownedResources)}`);
        console.log(`has enough resources? = ${hasEnoughResources(requiredResources, ownedResources)}`)
    
        
        if (!hasEnoughResources(requiredResources, ownedResources)) {
            console.log('Not enough resources to build field');
            continue;
        }
        
        await levelUpBuilding(driver);
        break;
    }

    if (fieldsAlreadyAtTargetLevel >= RESOURCE_FIELDS_ORDER.length) {

        console.log(`[TARGET] allResourceLevelAt(...) = DONE`);
        return 'DONE';
    }

    console.log(`[TARGET] allResourceLevelAt(...) = IN_PROGRESS`);
    return 'IN_PROGRESS';
}

async function buildingLevelAt(driver, villageName, buildingType, targetLevel) {
    console.log(`[TARGET] buildingLevelAt(${villageName}, ${buildingType}, ${targetLevel})`);
    
    await goToVillage(driver, villageName);
    
    if (await checkBuildQueue(driver)) {
        console.log('Something already building...');

        console.log(`[TARGET] buildingLevelAt(...) = BUSY`);
        return 'BUSY';
    }
    
    const building = BUILDINGS_TYPES.find(building => building.type === buildingType);
    if (!building) {
        console.log(`[TARGET] buildingLevelAt(...) = ERROR`);
        return 'ERROR';
    }
    
    await goToBuilding(driver, building.id);
    
    // TODO: will be implemented later
    // if (checkIsNewBuildingSelection()) {
    //     if (checkRequiredResources() > checkResources()) {
    //         console.log('Not enough resources to build field');
    //         return 'IN_PROGRESS';
    //     }
        
    //     createNewBuilding(building.type);
    // }
    
    // TODO: check building type - ignore right now
    
    if (await checkBuildingLevel(driver) >= targetLevel) {
        console.log('Building already leveled up');

        console.log(`[TARGET] buildingLevelAt(...) = DONE`);
        return 'DONE';
    }
    
    const requiredResources = await checkRequiredResources(driver);
    const ownedResources = await checkResources(driver);
    // console.log(`required = ${JSON.stringify(requiredResources)}`);
    // console.log(`owned = ${JSON.stringify(ownedResources)}`);

    if (!hasEnoughResources(requiredResources, ownedResources)) {
        console.log('Not enough resources to build building');

        console.log(`[TARGET] buildingLevelAt(...) = IN_PROGRESS`);
        return 'IN_PROGRESS';
    }

    await levelUpBuilding(driver);
    
    console.log(`[TARGET] buildingLevelAt(...) = IN_PROGRESS`);
    return 'IN_PROGRESS';
}




// TRAVIAN - ACTIONS (low level building blocks)

// CHECKING (small checking actions executed on current page)
async function checkBuildingLevel(driver) {
    console.log(`[CHECKING] checkBuildingLevel()`);
    await wait(100);

    const level = await driver.findElement(By.css('.level')).getText()
    console.log(level);
    const levelString = `${level}`.substring(5);

    console.log(`[CHECKING] checkBuildingLevel() = ${levelString}`);
    return levelString;
}

async function checkResources(driver) {
    console.log(`[CHECKING] checkResources()`);
    await wait(100);

    const lumber = await driver.findElement(By.css('.lumber_small ~ div')).getText();
    const clay = await driver.findElement(By.css('.clay_small ~ div')).getText();
    const iron = await driver.findElement(By.css('.iron_small ~ div')).getText();
    const crop = await driver.findElement(By.css('.crop_small ~ div')).getText();

    const lumberNumber = Number(`${lumber}`.replace(',', ''));
    const clayNumber = Number(`${clay}`.replace(',', ''));
    const ironNumber = Number(`${iron}`.replace(',', ''));
    const cropNumber = Number(`${crop}`.replace(',', ''));

    console.log(`[CHECKING] checkResources() = {${lumberNumber}, ${clayNumber}, ${ironNumber}, ${cropNumber}}`);
    return {lumber: lumberNumber, clay: clayNumber, iron: ironNumber, crop: cropNumber};
}

async function checkRequiredResources(driver) {
    console.log(`[CHECKING] checkRequiredResources()`);
    await wait(100);
   
    const lumber = await driver.findElement(By.css('.upgradeBuilding .r1Big + span')).getText();
    const clay = await driver.findElement(By.css('.upgradeBuilding .r2Big + span')).getText();
    const iron = await driver.findElement(By.css('.upgradeBuilding .r3Big + span')).getText();
    const crop = await driver.findElement(By.css('.upgradeBuilding .r4Big + span')).getText(); 

    const lumberNumber = Number(`${lumber}`.replace(',', ''));
    const clayNumber = Number(`${clay}`.replace(',', ''));
    const ironNumber = Number(`${iron}`.replace(',', ''));
    const cropNumber = Number(`${crop}`.replace(',', ''));

    console.log(`[CHECKING] checkRequiredResources() = {${lumberNumber}, ${clayNumber}, ${ironNumber}, ${cropNumber}}`);
    return {lumber: lumberNumber, clay: clayNumber, iron: ironNumber, crop: cropNumber};
}

async function checkBuildQueue(driver) {
    console.log(`[CHECKING] checkBuildQueue()`);
    await wait(100);

    let somethingIsConstructed;
    try {
        await driver.findElement(By.css('.buildingList'));
        somethingIsConstructed = true;
    } catch (error) { // error thrown is: "NoSuchElementError: no such element"
        somethingIsConstructed = false;
    }
    
    // await driver.findElement(By.css('.buildingList')).then(found => {
    //     somethingIsConstructed = true;
    // }, error => {
    //     somethingIsConstructed = false;
    //     // if (error instanceof webdriver.error.NoSuchElementError) {
    //     //     console.log('Element not found.');
    //     // }
    // });

    console.log(`[CHECKING] checkBuildQueue() = ${somethingIsConstructed}`);
    return somethingIsConstructed;
}

function checkIncomingTroops(driver) {
    // TODO: implement
    return undefined;
}

function checkIsNewBuildingSelection(driver) {
    // TODO: implement
    return true;
}

// MOVING (actions executed to move from page to other page)
async function goToVillage(driver, villageName) { // string
    console.log(`[MOVING] goToVillage(${villageName})`);
    await wait(100);
    await driver.findElement(By.xpath(`//span[contains (text(), '${villageName}')]`)).click();
}

async function goToResourceField(driver, resourceField) { // 1-18
    console.log(`[MOVING] goToResourceField(${resourceField})`);
    await wait(100);
    await driver.get(`${url}${buildUrl}${resourceField}`);
}

async function goToBuilding(driver, buildingPlace) { // 19-??
    console.log(`[MOVING] goToBuilding(${buildingPlace})`);
    await wait(100);
    await driver.get(`${url}${buildUrl}${buildingPlace}`);
}

// EXECUTING (actions that actually executes something)
function createNewBuilding(buildingType) {
    // TODO: implement
}

async function levelUpBuilding(driver, level) { // maybe it can be done without level
    console.log(`[EXECUTING] levelUpBuilding(${level})`);
    await wait(100);
    await driver.findElement(By.xpath(`//button[contains (text(), 'Upgrade to level')]`)).click();
}

async function wait(ms, v) {
    return new Promise(resolve => setTimeout(resolve, ms, v));
}

async function login(driver) {
    console.log(`Logging in Travian`);
    
    await driver.get(url);
    await wait(500);

    await driver.findElement(By.css('[id="cmpbntyestxt"]')).click();
    await wait(500);


    await driver.findElement(By.css('[name="name"]')).sendKeys(username);
    await wait(500);

    await driver.findElement(By.css('[name="password"]')).sendKeys(password);
    await wait(500);

    await driver.findElement(By.css('[type="submit"]')).click();
    await wait(500);
}

function hasEnoughResources(required, owning) {
    return required.lumber < owning.lumber &&
        required.clay < owning.clay &&
        required.iron < owning.iron &&
        required.crop < owning.crop;
}

