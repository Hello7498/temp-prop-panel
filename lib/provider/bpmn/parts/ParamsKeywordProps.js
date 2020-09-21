var entryFactory = require('../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is;


module.exports = function (group, element, translate) {

    if (is(element, "bpmn:Task")) {
        var parameterKeywordEntry = entryFactory.textBox({
            id: 'Parameter',
            label: translate('Parameter'),
            modelProperty: 'Parameter',
            description : 'Parameter'
        });
        group.entries.push(parameterKeywordEntry); 
    }

};
