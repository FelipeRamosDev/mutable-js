import {tools} from '../utils';

export default class Mutable {
    constructor(setup = {
        ID: '',
        name: '',
        type: '',
        value: '',
        dependencies: []
    }){
        this.ID = setup.ID || tools.genCode(20);
        this.name = setup.name;
        this.type = setup.type;
        this.value = setup.value;
        this.dependencies = setup.dependencies;
    }
}
