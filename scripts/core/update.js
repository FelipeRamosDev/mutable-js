import resources from '../../resources';

const {errorLogs} = resources;

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
            errorLogs.mutableTypeIsIncorrect(mutable, mutable.type, mutable.name);
            mutable.type = 'string';
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
    const mutables = internal.mutables;

    Object.keys(mutables).map(mut=>{
        if(mut !== updatedMutable.name){
            const current = mutables[mut];
            const filteredDependency = current.dependencies.find(dep=>dep === updatedMutable.name);
    
            if(filteredDependency){
                const filteredMutable = internal.mutables[filteredDependency];
                if (!filteredMutable) errorLogs.mutableNameDontExistRunningDependencies(filteredDependency);

                internal.update(current.name, current.value);
            }
        }
    });
}

function initUninitialized(internal, mutations){
    mutations.map(mut=>{
        const $mutables = $(mut.target).find('[mutable]');

        $mutables.map((_, nodeHTML)=>{
            const $this = $(nodeHTML);
            const mutableName = $this.attr('mutable');
            const current = internal.mutables[mutableName];

            if(!current || !nodeHTML.mutableInit){
                internal.init(mutableName);
            }
        });
    });
}

export default {
    updateMutableValue,
    updateDOM,
    runDependencies,
    initUninitialized
}
