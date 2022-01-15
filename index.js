import $ from 'jquery';
import {Mutable} from './models';

export default class MutableValues {
    constructor(setup = {
        store: [Mutable.prototype],
        bridges: Object(),
    }) {
        this.bridges = setup.bridges || {};
        this.store = {};

        if(setup && setup.store && Array.isArray(setup.store)) setup.store.map(set=>{
            if(!set.name) throw new Error(`MutableJS: The mutable 'name' property is required!`);
            this.store[set.name] = new Mutable(set);
        });

        this.init();
    }

    init(HTMLNode) {
        let mutablesNodes;
        let $htmlNode;
        if(HTMLNode) {
            $htmlNode = $(HTMLNode);
            mutablesNodes = $htmlNode.attr('mutable') ? $htmlNode : $htmlNode.find('[mutable]');
        } else {
            mutablesNodes = $('[mutable]');
        }
        const internal = this;
        const mutables = this.store;

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
                case 'html': {
                    mutableValue = $this.html();
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

        
        if(HTMLNode) {
            return $htmlNode;
        } else {
            Object.keys(mutables).map(function (key) {
                const type = mutables[key].type;

                if(type !== 'button' && type !== 'html'){
                    internal.update(key, mutables[key].value);
                }
            });
        }
    }

    get(name) {
        return this.store[name].value;
    }

    update(name, newValue) {
        if (!this.store[name]) throw new Error(`The mutable value ${name} isn't exist!`);
        const internal = this;
        const mutable = this.store[name];
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
            case 'html': {
                const initializedHTML = internal.init(newValue || mutable.value);
                mutable.value = this.bridges[name] ? this.bridges[name](newValue, this) : initializedHTML;
                // mutable.value = initializedHTML;
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
                            case 'html': {
                                $node.html(mutable.value);
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
            if (dependency) internal.update(dependency, internal.store[dependency] ? internal.store[dependency].value : '');
        });
    }
}
