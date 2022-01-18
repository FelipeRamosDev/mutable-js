import $ from 'jquery';
import {Mutable} from './models';
import utils from './utils';
import scripts from './scripts';
import resources from './resources';

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
        const internal = this;
        const requiredProps = ['name'];

        // Checking the required properties
        if(!isPropExist(setup, requiredProps)) resources.errorLogs.global.requiredProps('MutableJS', requiredProps);
      
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
        window.MutableJSResources = resources;

        // Declaring the MutationObserver
        this.mutation = new window.MutationObserver(()=>{
            internal.scanUninitialized();
        });
        this.mutation.observe(document, { attributes: true, childList: true, subtree: true });
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
            mutableValue = init.getDataFromDOM(internal, $this, mutableName, mutableType);

            // Setting default listeners
            mutableListen = init.treatListeners(node, mutableType, mutableListen);

            // Setting new mutable if it doesn't exist
            !mutables[mutableName] && internal.set({
                name: mutableName,
                type: mutableType,
                value: mutableValue,
                listen: mutableListen,
                initialized: true
            });

            // Adding the listeners
            init.addListeners($this, internal, mutables[mutableName]);

            // Initializing dependencies
            init.initDependencies($this, mutables[mutableName]);

            // Setting mutable-id to update the values later
            $this.attr('mutable-id', mutables[mutableName].ID);

            // Setting the mutable as initialized
            mutables[mutableName].initialized = true;
            mutables[mutableName].$mutableNodes = $(`[mutable="${mutableName}"]`);
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

    scanUninitialized(){
        update.initUninitialized(this);
    }

    get(name){
        return this.mutableStore[name] && this.mutableStore[name].value;
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

    runBridge(mutableName, input){
        if(!this.bridges[mutableName]) throwError(
            `The mutable bridge "${mutableName}" isn't exist!`
        );

        return this.bridges[mutableName](input, this);
    }

    setBridge(mutableName = '', bridge = (input, internal = MutableJS.prototype )=>{}){
        if(!this.mutableStore[mutableName]) throwError(
            `The mutable "${mutableName}" isn't exist!`, 
            `You need to create a mutable before setting a new bridge!`
        );
        
        this.bridges[mutableName] = bridge;
    }

    update(name, newValue) {
        if (!this.mutableStore[name]) throwError(
            `The mutable "${name}" isn't exist!`, 
            `You're trying to set the value "${newValue}" for the mutable name "${name}"!`
        );

        const internal = this;
        const mutable = this.mutableStore[name];

        // Updating the mutable object value
        update.updateMutableValue(mutable, newValue, this);

        // Updating the DOM
        update.updateDOM(mutable);

        // Updating dependencies
        update.runDependencies(internal, mutable);
    }
}
