import $ from 'jquery';
import {Mutable} from './models';
import utils from './utils';
import scripts from './scripts';

const {throwError} = utils.logs;
const {
    core: {init},
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

    init(){
        const $mutablesNodes = $('[mutable]');
        const internal = this;
        const mutables = this.mutableStore;

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

    set(setup = Mutable.prototype){
        const newMutable = new Mutable(setup);

        if(this.mutableStore[newMutable.name]) throwError(
            `The mutable name "${newMutable.name}" already exists! Please use another one!`,
            `This error occured on the set method of "${this.name}" MutableJS!`
        );

        this.mutableStore[newMutable.name] = newMutable;
        return newMutable;
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
        switch (mutable.type) {
            case 'string': {
                mutable.value = this.bridges[name] ? this.bridges[name](newValue, internal) : String(newValue || mutable.value);
                break;
            }
            case 'number': {
                const inputNumber = Number(newValue || mutable.value)
                const bridge = this.bridges[name];
                mutable.value = bridge ? Number(bridge(inputNumber, internal)) : inputNumber;
                break;
            }
            case 'button': {
                this.bridges[name] && this.bridges[name](newValue || mutable.value, internal);
                break;
            }
        }

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
