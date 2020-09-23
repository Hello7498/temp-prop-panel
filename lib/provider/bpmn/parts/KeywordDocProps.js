var entryFactory = require('../../../factory/EntryFactory'),
    is = require('bpmn-js/lib/util/ModelUtil').is;


module.exports = function (group, element, translate) {

    if (is(element, "bpmn:Task")) {
        var docKeywordEntry = entryFactory.textBox({
            id: 'Documentation',
            label: translate('Documentation'),
            modelProperty: 'Documentation',
            description : 'Documentation'
        });
        group.entries.push(docKeywordEntry); 
    }

};
