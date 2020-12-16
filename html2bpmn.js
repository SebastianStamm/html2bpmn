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
    wrapper.style.pointerEvents = "none";

    const viewer = new BpmnJS({
      container: wrapper,
    });

    try {
      await viewer.importXML(xml);

      const elementFactory = viewer.get("elementFactory"),
        elementRegistry = viewer.get("elementRegistry"),
        modeling = viewer.get("modeling"),
        canvas = viewer.get("canvas"),
        bpmnFactory = viewer.get("bpmnFactory"),
        process = elementRegistry.get("Process_1");

      let x = 0;
      let previousShape;

      for (let i = 0; i < this.children.length; i++) {
        const child = this.children[i];
        const name = child.textContent;
        const type = convertTagToType(child);

        const bo = bpmnFactory.create(type, {
          id: Math.random().toString(32),
          name,
        });

        const element = elementFactory.createShape({
          type,
          businessObject: bo,
        });

        x += element.width / 2;

        modeling.createShape(element, { x, y: 0 }, process);

        if (previousShape) {
          modeling.connect(previousShape, element);
        }

        previousShape = element;
        x += 50 + element.width / 2;
      }

      canvas.zoom("fit-viewport", "auto");
    } catch (err) {
      console.log("error rendering", err);
    }
  }
}

customElements.define("bpmn-process", BpmnProcess);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" targetNamespace="http://bpmn.io/schema/bpmn" id="Definitions_1">
  <bpmn:process id="Process_1" isExecutable="false">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

function convertTagToType(node) {
  console.dir(node);
  if (node.tagName === "BPMN-EVENT") {
    if (node.getAttribute("type") === "end") {
      return "bpmn:EndEvent";
    }
    return "bpmn:StartEvent";
  }
  if (node.tagName === "BPMN-TASK") {
    return "bpmn:Task";
  }
}
