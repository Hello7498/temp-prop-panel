'use strict';

var entryFactory = require('../../../factory/EntryFactory'),
    cmdHelper = require('../../../helper/CmdHelper');

var ModelUtil = require('bpmn-js/lib/util/ModelUtil'),
    is = ModelUtil.is,
    getBusinessObject = ModelUtil.getBusinessObject;


module.exports = function(group, element, bpmnFactory, translate) {

  var getValue = function(businessObject) {
    return function(element) {
      var historics = businessObject && businessObject.get('historic'),
          text = (historics && historics.length > 0) ? historics[0].text : '';

      return { historic: text };
    };
  };

  var setValue = function(businessObject) {
    return function(element, values) {
      var newObjectList = [];

      if (typeof values.historic !== 'undefined' && values.historic !== '') {
        newObjectList.push(bpmnFactory.create('bpmn:Historic', {
          text: values.historic
        }));
      }

      return cmdHelper.setList(element, businessObject, 'historic', newObjectList);
    };
  };

  // Element Historic
  var elementDocuEntry = entryFactory.selectBox({
    id: 'historic',
    label: translate('Element History'),
    modelProperty: 'historic'
  });


  elementDocuEntry.set = setValue(getBusinessObject(element));

  elementDocuEntry.get = getValue(getBusinessObject(element));

  group.entries.push(elementDocuEntry);


  var processRef;

  // Process Historic when having a Collaboration Diagram
  if (is(element, 'bpmn:Participant')) {

    processRef = getBusinessObject(element).processRef;

    // do not show for collapsed Pools/Participants
    if (processRef) {
      var processDocuEntry = entryFactory.textBox({
        id: 'process-historic',
        label: translate('Process Historic'),
        modelProperty: 'historic'
      });

      processDocuEntry.set = setValue(processRef);

      processDocuEntry.get = getValue(processRef);

      group.entries.push(processDocuEntry);
    }
  }

};
