import $ from 'jquery';
import {Mutable} from './models';
import {logs} from './utils';
import scripts from './scripts';

const {throwError} = logs;
const {
    validation: {isPropExist}
} = scripts;

export default class MutableJS {
    constructor(setup = {
        name: String(),
        mutableStore: [Mutable.prototype],
        bridges: Object(),
    }) {
        // Checking the required properties
        if(!isPropExist(setup, ['name'])) throwError(`There is a required property missing!`, `Error ocurred in the construction of MutableJS "${setup.name}"`);
      
        // Setting the the properties
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

    init() {
        const mutablesNodes = $('[mutable]');
        const internal = this;
        const mutables = this.mutableStore;

        mutablesNodes.map(function () {
            const $this = $(this);
            const mutableName = $this.attr('mutable');
            const mutableType = $this.attr('mutable-type') || 'string';
            let mutableListen = $this.attr('mutable-listen') || '';
            let mutableValue;

            switch (mutableType) {
                case 'string': {
                    mutableValue = $this.val() || $this.attr('value') || $this.html() || '';
                    break;
                }
                case 'number': {
                    mutableValue = Number($this.val() || $this.attr('value') || $this.html());
                    break;
                }
                case 'button': {
                    mutableListen = 'click';
                    break;
                }
            }

            if (!mutables[mutableName]) {
                mutables[mutableName] = new Mutable({
                    name: mutableName,
                    type: mutableType,
                    value: mutableValue
                });
            } else {
                mutables[mutableName].value = bridges[mutableName] ? bridges[mutableName](mutableValue, internal) : mutableValue;
                // mutables[mutableName].value = mutableValue;
            }

            mutableListen.split(',').map(function (listen) {
                $this.on(listen, function (ev) {
                    internal.update(mutableName, ev.target.value);
                });
            });

            // Setting mutable-id to update the values later
            $this.attr('mutable-id', mutables[mutableName].ID);
        });

        Object.keys(mutables).map(function (key) {
            const type = mutables[key].type;

            if(type !== 'button'){
                internal.update(key, mutables[key].value);
            }
        });
    }

    get(name) {
        return this.mutableStore[name].value;
    }

    update(name, newValue) {
        if (!this.mutableStore[name]) throw new Error(`The mutable value ${name} isn't exist!`);
        const internal = this;
        const mutable = this.mutableStore[name];
        const $mutableNode = $(`[mutable-id='${mutable.ID}']`);
        const dependencies = $mutableNode.attr('mutable-dependencies') || '';

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

        if ($mutableNode.length) {
            $mutableNode.map(function (index, node) {
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

        dependencies.split(',').map(function (dependency) {
            if (dependency) internal.update(dependency, internal.mutableStore[dependency] ? internal.mutableStore[dependency].value : '');
        });
    }
}
