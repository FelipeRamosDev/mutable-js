import $ from 'jquery';
import {Mutable} from './models';
import utils from './utils';
import scripts from './scripts';

const {throwError} = utils.logs;
const {
    core: {init, update},
    validation: {isPropExist}
} = scripts;

export default class MutableJS {
    constructor(setup = {
        name: String(),
        mutableStore: [Mutable.prototype],
        bridges: Object(),
    }){
        // Checking the required properties
        if(!isPropExist(setup, ['name'])) throwError(
            `There is a required property missing!`, 
            `Error ocurred in the construction of MutableJS "${setup.name}"`
        );
      
        // Setting the properties
        this.name = setup.name;
        this.bridges = setup.bridges || {};
        this.mutableStore = {};

        // Setting mutables provided as argument in the construction
        if(setup && setup.mutableStore && Array.isArray(setup.mutableStore)) setup.mutableStore.map(set=>{
            this.mutableStore[set.name] = new Mutable(set);
        });

        // Initializing mutables
        this.init();
        window[this.name] = this;
    }

    init(options = {
        mutableName: ''
    }){
        let $mutablesNodes;
        const internal = this;
        const mutables = this.mutableStore;

        if(options && options.mutableName) {
            $mutablesNodes = $(`[mutable="${options.mutableName}"]`);
        } else {
            $mutablesNodes = $('[mutable]');
        }

        $mutablesNodes.map(function () {
            const node = this;
            const $this = $(this);
            const mutableName = $this.attr('mutable');
            const mutableType = $this.attr('mutable-type') || 'string';
            let mutableListen = $this.attr('mutable-listen') || '';
            let mutableValue;

            // Getting values from the DOM and setting some presets depending on what type of mutable is
            mutableValue = init.getDataFromDOM($this, mutableName, mutableType);

            // Setting default listeners
            mutableListen = init.treatListeners(node, mutableType, mutableListen);

            // Setting new mutable if it doesn't exist
            !mutables[mutableName] && internal.set({
                name: mutableName,
                type: mutableType,
                value: mutableValue,
                listen: mutableListen
            });

            // Adding the listeners
            init.addListeners($this, internal, mutables[mutableName]);

            // Setting mutable-id to update the values later
            $this.attr('mutable-id', mutables[mutableName].ID);
        });

        // Refreshing all mutables
        this.refresh();
    }

    refresh(){
        const internal = this;
        const mutables = this.mutableStore;

        Object.keys(mutables).map((key)=>{
            const type = mutables[key].type;

            if(type !== 'button'){
                internal.update(key, mutables[key].value);
            }
        });
    }

    get(name){
        return this.mutableStore[name].value;
    }

    set(setup = Mutable.prototype, bridge){
        const newMutable = new Mutable(setup);

        if(this.mutableStore[newMutable.name]) throwError(
            `The mutable name "${newMutable.name}" already exists! Please use another one!`,
            `This error occured on the set method of "${this.name}" MutableJS!`
        );

        this.mutableStore[newMutable.name] = newMutable;

        if(bridge) this.setBridge(newMutable.name, bridge);
        return newMutable;
    }

    setBridge(mutableName = '', bridge = (input, internal = MutableJS.prototype )=>{}){
        if(!this.mutableStore[mutableName]) throwError(
            `The mutable value "${mutableName}" isn't exist!`, 
            `You need to create a mutable before setting a new bridge!`
        );
        
        this.bridges[mutableName] = bridge;
    }

    update(name, newValue) {
        if (!this.mutableStore[name]) throwError(
            `The mutable value "${name}" isn't exist!`, 
            `You're trying to set the value "${newValue}" for the mutable name "${name}"!`
        );

        const internal = this;
        const mutable = this.mutableStore[name];
        const $mutableNode = $(`[mutable-id='${mutable.ID}']`);
        const dependencies = $mutableNode.attr('mutable-dependencies') || '';

        // Updating the mutable value
        update.updateMutableValue(mutable, newValue, this);

        // Updating the DOM
        if ($mutableNode.length) {
            $mutableNode.map(function (_, node) {
                const $node = $(this);

                switch (node.nodeName) {
                    case 'INPUT':
                    case 'SELECT': {
                        $node.val(mutable.value);
                        break;
                    }
                    case 'BUTTON': {
                        break;
                    }
                    default: {
                        switch(mutable.type){
                            case 'button': {
                                break;
                            }
                            default: {
                                $node.html(mutable.value);
                            }
                        }
                    }
                }
            });
        }

        // Updating dependencies
        dependencies.split(',').map(function (dependency) {
            if (dependency) internal.update(dependency, internal.mutableStore[dependency] ? internal.mutableStore[dependency].value : '');
        });
    }
}
