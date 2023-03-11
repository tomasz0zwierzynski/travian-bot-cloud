const actionsService = require('./actions.js');

module.exports = { allResourceLevelAt, buildingLevelAt };

const RESOURCE_FIELDS_ORDER = [
    {id: 2}, {id: 15}, {id: 9}, {id: 13}, {id: 5}, {id: 1}, 
    {id: 10}, {id: 8}, {id: 6}, {id: 3}, {id: 7}, {id: 12},
    {id: 16}, {id: 14}, {id: 11}, {id: 18}, {id: 17}, {id: 4}
];

// const RESOURCE_FIELDS_ORDER = [ // TODO: ustawić równomiernie
//     {id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}, {id: 7}, {id: 8}, {id: 9},
//     {id: 10}, {id: 11}, {id: 12}, {id: 13}, {id: 14}, {id: 15}, {id: 16}, {id: 17}, {id: 18}
// ]

const BUILDINGS_TYPES = [ // TODO: dokończyć implementpwanie - i zaimplementowac mapowanie per village
    {type: 'MAIN_BUILDING', id: 26}, {type: 'WAREHOUSE', id: 20}, {type: 'GRANARY', id: 19} // etc. TODO
];

// TRAVIAN - GOALS
async function allResourceLevelAt(driver, villageName,targetLevel) {
    console.log(`[TARGET] allResourceLevelAt(${villageName}, ${targetLevel})`);
    
    // assuming is logged in
    await actionsService.goToVillage(driver, villageName);
    
    if (await actionsService.checkBuildQueue(driver)) {
        console.log('Something already building...');

        console.log(`[TARGET] allResourceLevelAt(...) = BUSY`);
        return 'BUSY';
    }
    
    let fieldsAlreadyAtTargetLevel = 0;
    for (let i = 0; i < RESOURCE_FIELDS_ORDER.length; i++) {
        const field = RESOURCE_FIELDS_ORDER[i];
    
        await actionsService.goToResourceField(driver, field.id);
        
        if (await actionsService.checkBuildingLevel(driver) >= targetLevel) {
            console.log('Field already leveled up');
            fieldsAlreadyAtTargetLevel++;
            continue;
        }
        
        const requiredResources = await actionsService.checkRequiredResources(driver);
        const ownedResources = await actionsService.checkResources(driver);
        // console.log(`required = ${JSON.stringify(requiredResources)}`);
        // console.log(`owned = ${JSON.stringify(ownedResources)}`);
        console.log(`has enough resources? = ${actionsService.hasEnoughResources(requiredResources, ownedResources)}`)
    
        
        if (!actionsService.hasEnoughResources(requiredResources, ownedResources)) {
            console.log('Not enough resources to build field');
            continue;
        }
        
        await actionsService.levelUpBuilding(driver);
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
    
    await actionsService.goToVillage(driver, villageName);
    
    if (await actionsService.checkBuildQueue(driver)) {
        console.log('Something already building...');

        console.log(`[TARGET] buildingLevelAt(...) = BUSY`);
        return 'BUSY';
    }
    
    const building = BUILDINGS_TYPES.find(building => building.type === buildingType);
    if (!building) {
        console.log(`[TARGET] buildingLevelAt(...) = ERROR`);
        return 'ERROR';
    }
    
    await actionsService.goToBuilding(driver, building.id);
    
    // TODO: will be implemented later
    // if (checkIsNewBuildingSelection()) {
    //     if (actionsService.checkRequiredResources() > actionsService.checkResources()) {
    //         console.log('Not enough resources to build field');
    //         return 'IN_PROGRESS';
    //     }
        
    //     createNewBuilding(building.type);
    // }
    
    // TODO: check building type - ignore right now
    
    if (await actionsService.checkBuildingLevel(driver) >= targetLevel) {
        console.log('Building already leveled up');

        console.log(`[TARGET] buildingLevelAt(...) = DONE`);
        return 'DONE';
    }
    
    const requiredResources = await actionsService.checkRequiredResources(driver);
    const ownedResources = await actionsService.checkResources(driver);
    // console.log(`required = ${JSON.stringify(requiredResources)}`);
    // console.log(`owned = ${JSON.stringify(ownedResources)}`);

    if (!actionsService.hasEnoughResources(requiredResources, ownedResources)) {
        console.log('Not enough resources to build building');

        console.log(`[TARGET] buildingLevelAt(...) = IN_PROGRESS`);
        return 'IN_PROGRESS';
    }

    await actionsService.levelUpBuilding(driver);
    
    console.log(`[TARGET] buildingLevelAt(...) = IN_PROGRESS`);
    return 'IN_PROGRESS';
}
