import utils from '../../utils';

const {throwError, error} = utils.logs;

function updateMutableValue(mutable, newValue, internal){
    const bridge = internal.bridges[mutable.name];

    switch (mutable.type) {
        case 'string': {
            mutable.value = bridge ? String(bridge(newValue, internal)) : String(newValue || '');
            break;
        }
        case 'number': {
            const inputNumber = Number(newValue);
            mutable.value = bridge ? Number(bridge(inputNumber, internal)) : inputNumber;
            break;
        }
        case 'button': {
            bridge && bridge(newValue || mutable.value, internal);
            break;
        }
        default: {
            error($this, 'An error occured on the node above!');
            throwError(
                `The mutable type is incorrect! It's provided "${mutable.type}".\n
                The only mutable types allowed is:\n
                'string'\n
                'number'\n
                'object'\n
                'array'\n
                'button'\n
                'html'\n
                'component'\n`,
                `Please check the value mutable "${mutable.name}.`
            );
        }
    }
}

function updateDOM(mutable){
    const $mutableNode = $(`[mutable-id='${mutable.ID}']`);

    $mutableNode.length && $mutableNode.map(function (_, node) {
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

function runDependencies(internal, updatedMutable){
    const mutables = internal.mutableStore;

    Object.keys(mutables).map(mut=>{
        if(mut !== updatedMutable.name){
            const current = mutables[mut];
            const filteredDependency = current.dependencies.find(dep=>dep === updatedMutable.name);
    
            if(filteredDependency){
                const filteredMutable = internal.mutableStore[filteredDependency];
    
                if (!filteredMutable) throwError(
                    `The mutable "${filteredDependency}" isn't exist!`, 
                    `You're trying to set the value "${filteredMutable.value}" for the mutable name "${filteredDependency}"!`
                );

                internal.update(current.name, current.value);
            }
        }
    });
}

function initUninitialized(internal){
    const $mutables = $(`[mutable]`);

    $mutables.map((_, dom)=>{
        const $this = $(dom);
        const mutableName = $this.attr('mutable');

        if(mutableName){
            const current = internal.mutableStore[mutableName];
            const noID = $this.not('[mutable-id]').length;
            const $DOMMutables = $(`[mutable="${mutableName}"]`);
            const isEqual = ($DOMMutables.length === current.$mutableNodes.length)
            
            if(current){
                if(!current.initialized || noID || !isEqual){
                    internal.init(mutableName);
                    // current.$mutableNodes = $($DOMMutables);
                    current.initialized = true;
                }
            } else {
                internal.init(mutableName);
            }
        }
    });
}

export default {
    updateMutableValue,
    updateDOM,
    runDependencies,
    initUninitialized
}
