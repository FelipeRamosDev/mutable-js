import {utilTools, logs} from '../utils';
import scripts from '../scripts';

const {
    validation: {isPropExist}
} = scripts;

// Defaults values
const defaults = {
    type: 'string'
}
export default class MutableModel {
    constructor(setup = {
        ID: '',
        name: '',
        type: '',
        value: '',
        dependencies: []
    }){
        // Checking required properties
        if(!isPropExist(setup, ['name'])) logs.throwError(
            `There is a required property missing!`, 
            `Error ocurred in the construction of MutableModel model "${this.name}"`
        );

        this.ID = setup.ID || utilTools.genCode(20);
        this.name = setup.name;
        this.type = setup.type || defaults.type;
        this.value = setup.value;
        this.dependencies = setup.dependencies || [];
    }
}
