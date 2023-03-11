const env = require('../env.json');

const {By} = require('selenium-webdriver');

const buildUrl = 'build.php?id=';

module.exports = {
    goToVillage,
    checkBuildQueue,
    goToResourceField,
    goToBuilding,
    checkBuildingLevel,
    checkRequiredResources,
    checkResources,
    hasEnoughResources,
    levelUpBuilding,
    login,
    wait
}

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

async function checkIncomingTroops(driver) {
    // TODO: implement
    return undefined;
}

async function checkIsNewBuildingSelection(driver) {
    // TODO: implement
    return true;
}

// MOVING (actions executed to move from page to other page)
async function goToVillage(driver, villageName) { // string
    console.log(`[MOVING] goToVillage(${villageName})`);
    await wait(1000);
    await driver.findElement(By.xpath(`//span[contains (text(), '${villageName}')]`)).click();
}

async function goToResourceField(driver, resourceField) { // 1-18
    console.log(`[MOVING] goToResourceField(${resourceField})`);
    await wait(100);
    await driver.get(`${env.url}${buildUrl}${resourceField}`);
}

async function goToBuilding(driver, buildingPlace) { // 19-??
    console.log(`[MOVING] goToBuilding(${buildingPlace})`);
    await wait(100);
    await driver.get(`${env.url}${buildUrl}${buildingPlace}`);
}

// EXECUTING (actions that actually executes something)
async function createNewBuilding(buildingType) {
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
    
    await driver.get(env.url);
    await wait(500);

    await driver.findElement(By.css('[id="cmpbntyestxt"]')).click();
    await wait(500);


    await driver.findElement(By.css('[name="name"]')).sendKeys(env.username);
    await wait(500);

    await driver.findElement(By.css('[name="password"]')).sendKeys(env.password);
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

