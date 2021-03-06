'use strict';

var inherits = require('inherits');

var PropertiesActivator = require('../../PropertiesActivator');

var asyncCapableHelper = require('../../helper/AsyncCapableHelper'),
  ImplementationTypeHelper = require('../../helper/ImplementationTypeHelper');

var is = require('bpmn-js/lib/util/ModelUtil').is;

// bpmn properties
var processProps = require('../bpmn/parts/ProcessProps'),
  eventProps = require('../bpmn/parts/EventProps'),
  linkProps = require('../bpmn/parts/LinkProps'),
  documentationProps = require('../bpmn/parts/DocumentationProps'),
  historicProps = require('../bpmn/parts/HistoricProps'),
  idProps = require('../bpmn/parts/IdProps'),
  nameProps = require('../bpmn/parts/NameProps'),
  priorityProps = require("../bpmn/parts/PriorityProps"),
  executableProps = require('../bpmn/parts/ExecutableProps');
var spellProps = require('../bpmn/parts/SpellProps');
var desciptionProps = require("../bpmn/parts/DescriptionDetails")
var expectedResultsProps = require("../bpmn/parts/ExpectedresultsProps")
var categoryCodeProps = require("../bpmn/parts/CategoryCodeProps")
var lannguageCodeProps = require("../bpmn/parts/LanguagueCodeProps")
var keywordCodeProps = require("../bpmn/parts/KeywordCodeProps")
let paramsKeywordProps = require("../bpmn/parts/ParamsKeywordProps") 
let docKeywordProps = require("../bpmn/parts/KeywordDocProps") 

// camunda properties
var serviceTaskDelegateProps = require('./parts/ServiceTaskDelegateProps'),
  userTaskProps = require('./parts/UserTaskProps'),
  asynchronousContinuationProps = require('./parts/AsynchronousContinuationProps'),
  callActivityProps = require('./parts/CallActivityProps'),
  multiInstanceProps = require('./parts/MultiInstanceLoopProps'),
  sequenceFlowProps = require('./parts/SequenceFlowProps'),
  scriptProps = require('./parts/ScriptTaskProps'),
  formProps = require('./parts/FormProps'),
  startEventInitiator = require('./parts/StartEventInitiator'),
  variableMapping = require('./parts/VariableMappingProps'),
  versionTag = require('./parts/VersionTagProps');

var listenerProps = require('./parts/ListenerProps'),
  listenerDetails = require('./parts/ListenerDetailProps'),
  listenerFields = require('./parts/ListenerFieldInjectionProps');

var elementTemplateChooserProps = require('./element-templates/parts/ChooserProps'),
  elementTemplateCustomProps = require('./element-templates/parts/CustomProps');

// Input/Output
var inputOutput = require('./parts/InputOutputProps'),
  inputOutputParameter = require('./parts/InputOutputParameterProps');

// Connector
var connectorDetails = require('./parts/ConnectorDetailProps'),
  connectorInputOutput = require('./parts/ConnectorInputOutputProps'),
  connectorInputOutputParameter = require('./parts/ConnectorInputOutputParameterProps');

// properties
var properties = require('./parts/PropertiesProps');

// job configuration
var jobConfiguration = require('./parts/JobConfigurationProps');

// history time to live
var historyTimeToLive = require('./parts/HistoryTimeToLiveProps');

// external task configuration
var externalTaskConfiguration = require('./parts/ExternalTaskConfigurationProps');

// field injection
var fieldInjections = require('./parts/FieldInjectionProps');

var getBusinessObject = require('bpmn-js/lib/util/ModelUtil').getBusinessObject,
  eventDefinitionHelper = require('../../helper/EventDefinitionHelper'),
  implementationTypeHelper = require('../../helper/ImplementationTypeHelper');

// helpers ////////////////////////////////////////

var isExternalTaskPriorityEnabled = function (element) {
  var businessObject = getBusinessObject(element);

  // show only if element is a process, a participant ...
  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && businessObject.get('processRef')) {
    return true;
  }

  var externalBo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element),
    isExternalTask = ImplementationTypeHelper.getImplementationType(externalBo) === 'external';

  // ... or an external task with selected external implementation type
  return !!ImplementationTypeHelper.isExternalCapable(externalBo) && isExternalTask;
};

var isJobConfigEnabled = function (element) {
  var businessObject = getBusinessObject(element);

  if (is(element, 'bpmn:Process') || is(element, 'bpmn:Participant') && businessObject.get('processRef')) {
    return true;
  }

  // async behavior
  var bo = getBusinessObject(element);
  if (asyncCapableHelper.isAsyncBefore(bo) || asyncCapableHelper.isAsyncAfter(bo)) {
    return true;
  }

  // timer definition
  if (is(element, 'bpmn:Event')) {
    return !!eventDefinitionHelper.getTimerEventDefinition(element);
  }

  return false;
};

var getInputOutputParameterLabel = function (param, translate) {

  if (is(param, 'camunda:InputParameter')) {
    return translate('Input Parameter');
  }

  if (is(param, 'camunda:OutputParameter')) {
    return translate('Output Parameter');
  }

  return '';
};

/* var getListenerLabel = function (param, translate) {

  if (is(param, 'camunda:ExecutionListener')) {
    return translate('Execution Listener');
  }

  if (is(param, 'camunda:TaskListener')) {
    return translate('Task Listener');
  }

  return '';
}; */

function createGeneralTabGroups(element, bpmnFactory, elementRegistry, elementTemplates, translate) {

  var generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, translate);
  processProps(generalGroup, element, translate);
  versionTag(generalGroup, element, translate);
/*   executableProps(generalGroup, element, translate);
 */  elementTemplateChooserProps(generalGroup, element, elementTemplates, translate);

  var customFieldsGroups = elementTemplateCustomProps(element, elementTemplates, bpmnFactory, translate);

  var detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  serviceTaskDelegateProps(detailsGroup, element, bpmnFactory, translate);
  userTaskProps(detailsGroup, element, translate);
  scriptProps(detailsGroup, element, bpmnFactory, translate);
  linkProps(detailsGroup, element, translate);
  callActivityProps(detailsGroup, element, bpmnFactory, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);
  /* sequenceFlowProps(detailsGroup, element, bpmnFactory, translate); */
  /*   startEventInitiator(detailsGroup, element, translate); // this must be the last element of the details group!
   */
  var multiInstanceGroup = {
    id: 'multiInstance',
    label: translate('Multi Instance'),
    entries: []
  };
  multiInstanceProps(multiInstanceGroup, element, bpmnFactory, translate);

  var asyncGroup = {
    id: 'async',
    label: translate('Asynchronous Continuations'),
    entries: []
  };
  asynchronousContinuationProps(asyncGroup, element, bpmnFactory, translate);

  var jobConfigurationGroup = {
    id: 'jobConfiguration',
    label: translate('Job Configuration'),
    entries: [],
    enabled: isJobConfigEnabled
  };
  jobConfiguration(jobConfigurationGroup, element, bpmnFactory, translate);

  var externalTaskGroup = {
    id: 'externalTaskConfiguration',
    label: translate('External Task Configuration'),
    entries: [],
    enabled: isExternalTaskPriorityEnabled
  };
  externalTaskConfiguration(externalTaskGroup, element, bpmnFactory, translate);

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

  var historyTimeToLiveGroup = {
    id: 'historyConfiguration',
    label: translate('History Configuration'),
    entries: []
  };
  historyTimeToLive(historyTimeToLiveGroup, element, bpmnFactory, translate);



  var groups = [];
  groups.push(generalGroup);
  customFieldsGroups.forEach(function (group) {
    groups.push(group);
  });
  groups.push(detailsGroup);
  /*   groups.push(externalTaskGroup); */
  groups.push(multiInstanceGroup);
  /*   groups.push(asyncGroup);
     groups.push(jobConfigurationGroup); */
  groups.push(documentationGroup);
  groups.push(historicGroup);
  /*  groups.push(historyTimeToLiveGroup);  */

  return groups;
}

function createDetailsTabGroups(element, bpmnFactory, elementRegistry, elementTemplates, translate) {
  var desciritionGroupDetail = {
    id: 'descriptionDetails',
    label: translate('Task Description'),
    entries: []
  };
  desciptionProps(desciritionGroupDetail, element, translate)

  var expectedResultGroup = {
    id: 'expectedResults',
    label: translate('Expected results'),
    entries: []
  };
  expectedResultsProps(expectedResultGroup, element, translate)

  var priorityGroup = {
    id: 'priority',
    label: translate('Task Priority'),
    entries: []
  };
  priorityProps(priorityGroup, element, translate);

  return [
    desciritionGroupDetail,
    expectedResultGroup,
    priorityGroup
  ];


}
function createCodeTabGroups(element, bpmnFactory, elementRegistry, elementTemplates, translate) {

  var categoryGroupCode = {
    id: 'categoryCode',
    label: translate('Category'),
    entries: []
  }
  categoryCodeProps(categoryGroupCode, element, translate)

  var languageGroupCode = {
    id: 'languageCode',
    label: translate('Language'),
    entries: []
  }
  lannguageCodeProps(languageGroupCode,element,translate)

  var keywordGroupCode = {
    id: 'keywordCode',
    label: translate('Keyword'),
    entries: []
  }
  keywordCodeProps(keywordGroupCode,element,translate)

  var paramsGroupCode = {
    id: 'Parameter',
    label: translate('Parameter'),
    entries: []
  }
  paramsKeywordProps(paramsGroupCode,element,translate)  

  var docGroupCode = {
    id: 'Documentation',
    label: translate('Documentation'),
    entries: []
  }
  docKeywordProps(docGroupCode,element,translate)  

  return [
    categoryGroupCode,
    languageGroupCode,
    keywordGroupCode,
    paramsGroupCode,
    docGroupCode
  ];
}
/* function createVariablesTabGroups(element, bpmnFactory, elementRegistry, translate) {
  var variablesGroup = {
    id: 'variables',
    label: translate('Variables'),
    entries: []
  };
  variableMapping(variablesGroup, element, bpmnFactory, translate);

  return [
    variablesGroup
  ];
}

function createFormsTabGroups(element, bpmnFactory, elementRegistry, translate) {
  var formGroup = {
    id: 'forms',
    label: translate('Forms'),
    entries: []
  };
  formProps(formGroup, element, bpmnFactory, translate);

  return [
    formGroup
  ];
} */

/* function createListenersTabGroups(element, bpmnFactory, elementRegistry, translate) {

  var listenersGroup = {
    id: 'listeners',
    label: translate('Listeners'),
    entries: []
  };

  var options = listenerProps(listenersGroup, element, bpmnFactory, translate);

  var listenerDetailsGroup = {
    id: 'listener-details',
    entries: [],
    enabled: function (element, node) {
      return options.getSelectedListener(element, node);
    },
    label: function (element, node) {
      var param = options.getSelectedListener(element, node);
      return getListenerLabel(param, translate);
    }
  };

  listenerDetails(listenerDetailsGroup, element, bpmnFactory, options, translate);

  var listenerFieldsGroup = {
    id: 'listener-fields',
    label: translate('Field Injection'),
    entries: [],
    enabled: function (element, node) {
      return options.getSelectedListener(element, node);
    }
  };

  listenerFields(listenerFieldsGroup, element, bpmnFactory, options, translate);

  return [
    listenersGroup,
    listenerDetailsGroup,
    listenerFieldsGroup
  ];
} */

/* function createInputOutputTabGroups(element, bpmnFactory, elementRegistry, translate) {

  var inputOutputGroup = {
    id: 'input-output',
    label: translate('Parameters'),
    entries: []
  };

  var options = inputOutput(inputOutputGroup, element, bpmnFactory, translate);

  var inputOutputParameterGroup = {
    id: 'input-output-parameter',
    entries: [],
    enabled: function (element, node) {
      return options.getSelectedParameter(element, node);
    },
    label: function (element, node) {
      var param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param, translate);
    }
  };

  inputOutputParameter(inputOutputParameterGroup, element, bpmnFactory, options, translate);

  return [
    inputOutputGroup,
    inputOutputParameterGroup
  ];
} */

function createConnectorTabGroups(element, bpmnFactory, elementRegistry, translate) {
  var connectorDetailsGroup = {
    id: 'connector-details',
    label: translate('Details'),
    entries: []
  };
  connectorDetails(connectorDetailsGroup, element, bpmnFactory, translate);

  var expectedResultGroup = {
    id: 'expectedResults',
    label: translate('Expected results'),
    entries: []
  };
  expectedResultsProps(expectedResultGroup, element, translate)

  var connectorInputOutputGroup = {
    id: 'connector-input-output',
    label: translate('Input/Output'),
    entries: []
  };
  var options = connectorInputOutput(connectorInputOutputGroup, element, bpmnFactory, translate);

  var connectorInputOutputParameterGroup = {
    id: 'connector-input-output-parameter',
    entries: [],
    enabled: function (element, node) {
      return options.getSelectedParameter(element, node);
    },
    label: function (element, node) {
      var param = options.getSelectedParameter(element, node);
      return getInputOutputParameterLabel(param, translate);
    }
  };

  connectorInputOutputParameter(connectorInputOutputParameterGroup, element, bpmnFactory, options, translate);

  return [
    connectorDetailsGroup,
    connectorInputOutputGroup,
    connectorInputOutputParameterGroup
  ];
}

function createFieldInjectionsTabGroups(element, bpmnFactory, elementRegistry, translate) {

  var fieldGroup = {
    id: 'field-injections-properties',
    label: translate('Field Injections'),
    entries: []
  };

  fieldInjections(fieldGroup, element, bpmnFactory, translate);

  return [
    fieldGroup
  ];
}

/* function createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate) {

  var propertiesGroup = {
    id: 'extensionElements-properties',
    label: translate('Properties'),
    entries: []
  };
  properties(propertiesGroup, element, bpmnFactory, translate);

  return [
    propertiesGroup
  ];
} */

// Camunda Properties Provider /////////////////////////////////////


/**
 * A properties provider for Camunda related properties.
 *
 * @param {EventBus} eventBus
 * @param {BpmnFactory} bpmnFactory
 * @param {ElementRegistry} elementRegistry
 * @param {ElementTemplates} elementTemplates
 */
function CamundaPropertiesProvider(eventBus, bpmnFactory, elementRegistry, elementTemplates, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function (element) {

    var generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(
        element, bpmnFactory,
        elementRegistry, elementTemplates, translate)
    };
    var detailsTab = {
      id: 'details',
      label: translate('Details'),
      groups: createDetailsTabGroups(
        element, bpmnFactory,
        elementRegistry, elementTemplates, translate)
    };
    var codeTab = {
      id: 'code',
      label: translate("Code"),
      groups: createCodeTabGroups(
        element, bpmnFactory,
        elementRegistry, elementTemplates, translate)
    };


    /*   var variablesTab = {
        id: 'variables',
        label: translate('Variables'),
        groups: createVariablesTabGroups(element, bpmnFactory, elementRegistry, translate)
      };
  
      var formsTab = {
        id: 'forms',
        label: translate('Forms'),
        groups: createFormsTabGroups(element, bpmnFactory, elementRegistry, translate)
      };
  
      var listenersTab = {
        id: 'listeners',
        label: translate('Listeners'),
        groups: createListenersTabGroups(element, bpmnFactory, elementRegistry, translate),
        enabled: function (element) {
          return !eventDefinitionHelper.getLinkEventDefinition(element)
            || (!is(element, 'bpmn:IntermediateThrowEvent')
              && eventDefinitionHelper.getLinkEventDefinition(element));
        }
      };
  
      var inputOutputTab = {
        id: 'input-output',
        label: translate('Input/Output'),
        groups: createInputOutputTabGroups(element, bpmnFactory, elementRegistry, translate)
      }; */

    var connectorTab = {
      id: 'connector',
      label: translate('Connector'),
      groups: createConnectorTabGroups(element, bpmnFactory, elementRegistry, translate),
      enabled: function (element) {
        var bo = implementationTypeHelper.getServiceTaskLikeBusinessObject(element);
        return bo && implementationTypeHelper.getImplementationType(bo) === 'connector';
      }
    };

    var fieldInjectionsTab = {
      id: 'field-injections',
      label: translate('Field Injections'),
      groups: createFieldInjectionsTabGroups(element, bpmnFactory, elementRegistry, translate)
    };

    /*     var extensionsTab = {
          id: 'extensionElements',
          label: translate('Extensions'),
          groups: createExtensionElementsGroups(element, bpmnFactory, elementRegistry, translate)
        }; */

    return [
      generalTab,
      detailsTab,
      codeTab,
      /*       variablesTab, */
      connectorTab,
      /*       formsTab, */
      /*       listenersTab, */
      /*       inputOutputTab, */
      fieldInjectionsTab,
      /*       extensionsTab */
    ];
  };

}

CamundaPropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate'
];

inherits(CamundaPropertiesProvider, PropertiesActivator);

module.exports = CamundaPropertiesProvider;
