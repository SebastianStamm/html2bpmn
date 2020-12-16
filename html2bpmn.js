const script = document.createElement("script");
script.setAttribute("src", "bpmn-viewer.js");

const bpmnCss = document.createElement("link");
bpmnCss.setAttribute("href", "bpmn.css");
bpmnCss.setAttribute("rel", "stylesheet");

const diagramCss = document.createElement("link");
diagramCss.setAttribute("href", "diagram-js.css");
diagramCss.setAttribute("rel", "stylesheet");

document.head.appendChild(script);
document.head.appendChild(bpmnCss);
document.head.appendChild(diagramCss);

class BpmnProcess extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    this.startupInterval = setInterval(() => {
      if (window.BpmnJS) {
        clearInterval(this.startupInterval);
        this.init();
      }
    });
  }

  async init() {
    const wrapper = document.createElement("div");
    this.shadowRoot.appendChild(wrapper);

    const viewer = new BpmnJS({
      container: wrapper,
    });

    try {
      const { warnings } = await viewer.importXML(xml);

      console.log("rendered");
    } catch (err) {
      console.log("error rendering", err);
    }
  }
}

customElements.define("bpmn-process", BpmnProcess);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds height="36.0" width="36.0" x="173.0" y="102.0"/>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
