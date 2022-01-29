import $ from 'jquery';
import {Mutable} from './models';
import scripts from './scripts';
import utils from './utils';
import resources from './resources';
import errorLogs from './resources/console/errors';

const {
    core: {init, update},
    validation: {isPropExist}
} = scripts;
const {tools} = utils;

export default class MutableJS {
    constructor(setup = {
        name: String(),
        mutables: [Mutable.prototype],
        bridges: Object(),
    }){
        const internal = this;
        const requiredProps = ['name'];

        // Checking the required properties
        if(!isPropExist(setup, requiredProps)) resources.errorLogs.requiredProps('MutableJS', requiredProps);

        // Setting the properties
        this.name = setup.name;
        this.bridges = setup.bridges || {};
        this.mutables = {};

        // Setting mutables provided as argument in the construction
        if(setup && setup.mutables && Array.isArray(setup.mutables)) setup.mutables.map(set=>{
            this.mutables[set.name] = new Mutable(set);
        });

        // Initializing mutables
        this.init();
        window[this.name] = this;
        window.MutableJSResources = resources;

        // Declaring the MutationObserver
        if(window.MutationObserver){
            this.mutation = new window.MutationObserver((lastMutations)=>{
                internal.scanUninitialized(lastMutations);
            });
            this.mutation.observe(document, { attributes: true, childList: true, subtree: true });
        }
    }

    init(options = {
        mutableName: ''
    }){
        let $mutablesNodes;
        const internal = this;
        const mutables = this.mutables;

        if(options && options.mutableName) {
            $mutablesNodes = $(`[mutable="${options.mutableName}"]`);
        } else {
            $mutablesNodes = $('[mutable]');
        }

        $mutablesNodes.map(function () {
            const node = this;

            if(!node.mutableInit){
                const $this = $(this);
                const nodeUID = tools.genCode(20);
                const mutableName = $this.attr('mutable');
                const mutableType = $this.attr('mutable-type') || 'string';
                let mutableListen = $this.attr('mutable-listen') || '';
                let mutableValue;
    
                // Getting values from the DOM and setting some presets depending on what type of mutable is
                mutableValue = init.getDataFromDOM(internal, $this, mutableName, mutableType);
    
                // Setting default listeners
                mutableListen = init.treatListeners(node, mutableType, mutableListen);
    
                // Setting new mutable if it doesn't exist
                if(!mutables[mutableName]){
                    internal.set({
                        name: mutableName,
                        type: mutableType,
                        value: mutableValue,
                        listen: mutableListen,
                        initialized: true,
                    });
                }
    
                let mutable = mutables[mutableName];
    
                // Adding the listeners
                init.addListeners($this, internal, mutable);
    
                // Initializing dependencies
                init.initDependencies($this, mutable);
    
                // Setting mutable-id to update the values later
                $this.attr('mutable-id', mutable.ID);
                $this.attr('mutable-uid', nodeUID);
                
                // Setting the mutable as initialized
                mutable.initialized = true;
                mutable.uidsRelated = [...mutable.uidsRelated, nodeUID];
                node.mutableInit = true;
            }
        });

        // Refreshing all mutables
        this.refresh();
    }

    refresh(){
        const internal = this;
        const mutables = this.mutables;

        Object.keys(mutables).map((key)=>{
            const type = mutables[key].type;

            if(type !== 'button'){
                internal.update(key, mutables[key].value);
            }
        });
    }

    scanUninitialized(mutations){
        update.initUninitialized(this, mutations);
    }

    get(name){
        if(!this.mutables[name]) errorLogs.getMutableNameDontExist(name);
        return this.mutables[name];
    }

    set(setup = Mutable.prototype, bridge){
        const newMutable = new Mutable(setup);
        if(this.mutables[newMutable.name]) errorLogs.setMutableNameDuplicated(this, newMutable);

        // Setting the new mutable value into mutable core and running the bridge
        this.mutables[newMutable.name] = newMutable;
        if(bridge) this.setBridge(newMutable.name, bridge);

        return newMutable;
    }

    runBridge(mutableName, input){
        if(!this.bridges[mutableName]) errorLogs.runBridgeNameDontExist(mutableName)

        return this.bridges[mutableName](input, this);
    }

    setBridge(mutableName = '', bridge = ()=>{}){
        if(!this.mutables[mutableName]) errorLogs.setBridgeMutableNameDontExist(mutableName);
        
        this.bridges[mutableName] = bridge;
    }

    update(name, newValue) {
        if (!this.mutables[name]) errorLogs.updateMutableNameDontExist(name, newValue)

        const internal = this;
        const mutable = this.mutables[name];

        // Updating the mutable object value
        update.updateMutableValue(mutable, newValue, this);

        // Updating the DOM
        update.updateDOM(mutable);

        // Updating dependencies
        update.runDependencies(internal, mutable);
    }
}
