import utils from '../utils';
import scripts from '../scripts';

const {
    validation: {isPropExist}
} = scripts;
const {tools, logs} = utils;

// Defaults values
const defaults = {
    type: 'string'
}
export default class Mutable {
    constructor(setup = {
        ID: '',
        name: '',
        type: '',
        value: '',
        listen: [MutableListen.prototype],
        dependencies: []
    }){
        // Checking required properties
        if(!isPropExist(setup, ['name'])) logs.throwError(
            `There is a required property missing!`, 
            `Error ocurred in the construction of Mutable model "${this.name}"`
        );

        this.ID = setup.ID || tools.genCode(20);
        this.name = setup.name;
        this.type = setup.type || defaults.type;
        this.value = setup.value;
        this.listen = setup.listen || []
        this.dependencies = setup.dependencies || [];
    }
}

export class MutableListen {
    constructor(setup = {
        evName: '',
        ref: 0,
    }){
        if(!isPropExist(setup, ['evName'])) logs.throwError(
            `The evName property is required to construct a MutableListen!`
        );

        this.evName = setup.evName;
        this.ref = setup.ref;
    }
}
