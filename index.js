import $ from 'jquery';
import {genCode} from '../../utils';
import bridges from './bridges';

export default class MutableValues {
    constructor() {
        this.mutables = {};
        this.bridges = bridges;

        this.init();
    }

    init(HTMLNode) {
        var mutablesNodes;
        var $htmlNode;
        if(HTMLNode) {
            $htmlNode = $(HTMLNode);
            mutablesNodes = $htmlNode.attr('mutable') ? $htmlNode : $htmlNode.find('[mutable]');
        } else {
            mutablesNodes = $('[mutable]');
        }
        var internal = this;
        var mutables = this.mutables;

        mutablesNodes.map(function () {
            var $this = $(this);
            var mutableName = $this.attr('mutable');
            var mutableType = $this.attr('mutable-type') || 'string';
            var mutableListen = $this.attr('mutable-listen') || '';
            var mutableValue;

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
                mutables[mutableName] = {
                    ID: genCode(20),
                    name: mutableName,
                    type: mutableType,
                    value: mutableValue
                };
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
                var type = mutables[key].type;

                if(type !== 'button' && type !== 'html'){
                    internal.update(key, mutables[key].value);
                }
            });
        }
    }

    get(name) {
        return this.mutables[name].value;
    }

    update(name, newValue) {
        if (!this.mutables[name]) throw new Error(`The mutable value ${name} isn't exist!`);
        var internal = this;
        var mutable = this.mutables[name];
        var $mutableNode = $(`[mutable-id='${mutable.ID}']`);
        var dependencies = $mutableNode.attr('mutable-dependencies') || '';

        switch (mutable.type) {
            case 'string': {
                mutable.value = this.bridges[name] ? this.bridges[name](newValue, internal) : String(newValue || mutable.value);
                break;
            }
            case 'number': {
                var inputNumber = Number(newValue || mutable.value)
                var bridge = this.bridges[name];
                mutable.value = bridge ? Number(bridge(inputNumber, internal)) : inputNumber;
                break;
            }
            case 'button': {
                this.bridges[name] && this.bridges[name](newValue || mutable.value, internal);
                break;
            }
            case 'html': {
                var initializedHTML = internal.init(newValue || mutable.value);
                mutable.value = this.bridges[name] ? this.bridges[name](newValue, this) : initializedHTML;
                // mutable.value = initializedHTML;
                break;
            }
        }

        if ($mutableNode.length) {
            $mutableNode.map(function (index, node) {
                var $node = $(this);

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
            if (dependency) internal.update(dependency, internal.mutables[dependency] ? internal.mutables[dependency].value : '');
        });
    }
}
