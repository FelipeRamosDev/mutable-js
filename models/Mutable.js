import utils from '../utils';
import scripts from '../scripts';
import resources from '../resources';

const {
    validation: {isPropExist}
} = scripts;
const {tools, logs} = utils;
const {errorLogs} = resources;

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
        dependencies: [],
        initialized: Boolean(),
        uidsRelated: []
    }){
        // Checking required properties
        if(!isPropExist(setup, ['name'])) errorLogs.mutableModelRequiredPropMissing(this);

        this.ID = setup.ID || tools.genCode(20);
        this.name = setup.name;
        this.type = setup.type || defaults.type;
        this.value = setup.value;
        this.listen = setup.listen || []
        this.dependencies = setup.dependencies || [];
        this.initialized = setup.initialized ? true : false;
        this.uidsRelated = setup.uidsRelated || [];
    }
}

export class MutableListen {
    constructor(setup = {
        evName: '',
        ref: 0,
    }){
        // Checking required props
        if(!isPropExist(setup, ['evName'])) errorLogs.mutableListenModelRequiredPropsMissing();

        this.evName = setup.evName;
        this.ref = setup.ref;
    }
}
