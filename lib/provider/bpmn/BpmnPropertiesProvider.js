'use strict';


var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var processProps = require('./parts/ProcessProps'),
  eventProps = require('./parts/EventProps'),
  linkProps = require('./parts/LinkProps'),
  documentationProps = require('./parts/DocumentationProps'),
  historicProps = require('./parts/HistoricProps'),
  idProps = require('./parts/IdProps'),
  nameProps = require('./parts/NameProps'),
  executableProps = require('./parts/ExecutableProps');
var priorityProps = require("./parts/PriorityProps");
var spellProps = require("../bpmn/parts/SpellProps")
var detailsProps = require("../bpmn/parts/DescriptionDetails")
var expectedResultsProps = require("../bpmn/parts/ExpectedresultsProps")

function createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate) {

  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, translate);
  processProps(generalGroup, element, translate);
  executableProps(generalGroup, element, translate);

  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);

  var documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);

  var historicGroup = {
    id: 'historic',
    label: translate('Historic'),
    entries: []
  };

  historicProps(historicGroup, element, bpmnFactory, translate);



  return [
    generalGroup,
    detailsGroup,
    documentationGroup,
    historicGroup,
  ];

}



function createDetailsTabGroups(element, bpmnFactory, elementRegistry, elementTemplates, translate) {

  var desciritionGroupDetail = {
    id: 'descriptionDetails',
    label: translate('Task Description'),
    entries: []
  };
  detailsProps(desciritionGroupDetail,element,translate)

  var expectedResultGroup = {
    id: 'expectedResults',
    label: translate('Expected results'),
    entries: []
  };
  expectedResultsProps(expectedResultGroup,element,translate)

  var priorityGroup = {
    id: 'priority',
    label: translate('Task Priority'),
    entries: []
  };
  priorityProps(priorityGroup,element,translate)



priorityProps(priorityGroup,element,translate);
  return [
    desciritionGroupDetail,
    expectedResultGroup,
    priorityGroup
  ];


}

function BpmnPropertiesProvider(eventBus, bpmnFactory, elementRegistry, translate) {
  priorityProps(priorityGroup,element,translate);

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {

    var generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate)
    };
    var detailsTab = {
      id:  'details',
      label: translate('Details'),
      groups: createDetailsTabGroups(
        element, bpmnFactory, 
         elementRegistry,elementTemplates, translate)
    };


    return [
      generalTab,
      detailsTab
    ];
  };
}

BpmnPropertiesProvider.$inject = ['eventBus', 'bpmnFactory', 'elementRegistry', 'translate'];

inherits(BpmnPropertiesProvider, PropertiesActivator);

module.exports = BpmnPropertiesProvider;