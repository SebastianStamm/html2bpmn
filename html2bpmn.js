const script = document.createElement("script");
script.setAttribute(
  "src",
  "https://unpkg.com/bpmn-js@8.0.0/dist/bpmn-modeler.development.js"
);

const bpmnCss = document.createElement("link");
bpmnCss.setAttribute(
  "href",
  "https://unpkg.com/bpmn-js@8.0.0/dist/assets/diagram-js.css"
);
bpmnCss.setAttribute("rel", "stylesheet");

const diagramCss = document.createElement("link");
diagramCss.setAttribute(
  "href",
  "https://unpkg.com/bpmn-js@8.0.0/dist/assets/bpmn-font/css/bpmn.css"
);
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
    wrapper.style.height = this.parentNode.clientHeight + "px";

    wrapper.style.lineHeight = "initial";
    wrapper.style.textAlign = "initial";
    wrapper.style.fontSize = "initial";
    wrapper.style.backgroundColor = "white";

    console.log(this.parentNode.clientHeight);

    const viewer = new BpmnJS({
      container: wrapper,
    });

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
      let name = child.textContent;
      const type = convertTagToType(child);

      if (type?.includes("Gateway")) {
        // debugger;
        name = child.getAttribute("label");
      }

      const bo = bpmnFactory.create(type, {
        id: Math.random().toString(32),
        name,
      });

      const element = elementFactory.createShape({
        type,
        businessObject: bo,
      });

      x += element.width / 2;

      const me = modeling.createShape(element, { x, y: 0 }, process);

      if (type?.includes("Gateway")) {
        modeling.moveElements([me.labels[0]], { x: 50, y: -35 });
      }

      if (previousShape) {
        modeling.connect(previousShape, element);
      }

      previousShape = element;
      x += 50 + element.width / 2;

      if (type?.includes("Gateway")) {
        // create subpaths
        const elementsCollection = [];
        for (let j = 0; j < child.children.length; j++) {
          const elements = createPath(child.children[j].children, viewer);

          const minY = Math.min(
            ...elements
              .map((element) => element.y)
              .filter((a) => typeof a === "number" && !isNaN(a))
          );
          const maxY = Math.max(
            ...elements
              .map((element) => element.y + element.height)
              .filter((a) => typeof a === "number" && !isNaN(a))
          );

          let deltaY;
          if (j === 0) {
            deltaY = -maxY - 50;
          } else if (j === 1) {
            deltaY = -minY + 50;
          }

          modeling.moveElements(elements, { x: x, y: deltaY });
          elementsCollection.push(elements);
        }

        x =
          Math.max(
            ...elementsCollection
              .flat()
              .map((element) => element.x + element.width)
              .filter((a) => typeof a === "number" && !isNaN(a))
          ) + 50;

        const bo = bpmnFactory.create(type, {
          id: Math.random().toString(32),
        });

        const element2 = elementFactory.createShape({
          type,
          businessObject: bo,
        });
        x += element2.width / 2;

        modeling.createShape(element2, { x, y: 0 }, process);

        for (let j = 0; j < elementsCollection.length; j++) {
          if (elementsCollection[j].length === 0) {
            modeling.connect(element, element2);
          } else {
            const bo = bpmnFactory.create("bpmn:SequenceFlow", {
              id: Math.random().toString(32),
              name: child.children[j].getAttribute("label") || "",
            });

            const element3 = elementFactory.createShape({
              type: "bpmn:SequenceFlow",
              businessObject: bo,
            });

            const e2r = modeling.connect(
              element,
              elementsCollection[j][0],
              element3
            );
            modeling.moveElements([e2r.labels[0]], { x: -40, y: 0 });

            modeling.connect(
              elementsCollection[j][elementsCollection[j].length - 1],
              element2
            );
          }
        }

        x += 50 + element2.width / 2;

        previousShape = element2;
      }
    }

    canvas.zoom("fit-viewport", "auto");
  }
}

function createPath(elements, viewer) {
  const elementFactory = viewer.get("elementFactory"),
    elementRegistry = viewer.get("elementRegistry"),
    modeling = viewer.get("modeling"),
    bpmnFactory = viewer.get("bpmnFactory"),
    process = elementRegistry.get("Process_1");

  let previousShape;
  let x = 0;

  const shapes = [];

  for (let i = 0; i < elements.length; i++) {
    const child = elements[i];
    let name = child.textContent;
    const type = convertTagToType(child);

    if (type?.includes("Gateway")) {
      name = child.getAttribute("label");
    }

    const bo = bpmnFactory.create(type, {
      id: Math.random().toString(32),
      name,
    });

    const element = elementFactory.createShape({
      type,
      businessObject: bo,
    });

    x += element.width / 2;

    const me = modeling.createShape(element, { x, y: 0 }, process);

    if (type?.includes("Gateway")) {
      modeling.moveElements([me.labels[0]], { x: 50, y: -35 });
    }

    if (previousShape) {
      modeling.connect(previousShape, element);
    }

    shapes.push(element);

    previousShape = element;
    x += 50 + element.width / 2;

    if (type?.includes("Gateway")) {
      // create subpaths
      const elementsCollection = [];
      for (let j = 0; j < child.children.length; j++) {
        const elements = createPath(child.children[j].children, viewer);

        const minY = Math.min(
          ...elements
            .map((element) => element.y)
            .filter((a) => typeof a === "number" && !isNaN(a))
        );
        const maxY = Math.max(
          ...elements
            .map((element) => element.y + element.height)
            .filter((a) => typeof a === "number" && !isNaN(a))
        );

        let deltaY;
        if (j === 0) {
          deltaY = -maxY - 50;
        } else if (j === 1) {
          deltaY = -minY + 50;
        }

        modeling.moveElements(elements, { x: x, y: deltaY });
        elementsCollection.push(elements);
      }

      x =
        Math.max(
          ...elementsCollection
            .flat()
            .map((element) => element.x + element.width)
            .filter((a) => typeof a === "number" && !isNaN(a))
        ) + 50;

      const bo = bpmnFactory.create(type, {
        id: Math.random().toString(32),
      });

      const element2 = elementFactory.createShape({
        type,
        businessObject: bo,
      });
      x += element2.width / 2;

      modeling.createShape(element2, { x, y: 0 }, process);

      for (let j = 0; j < elementsCollection.length; j++) {
        if (elementsCollection[j].length === 0) {
          modeling.connect(element, element2);
        } else {
          const bo = bpmnFactory.create("bpmn:SequenceFlow", {
            id: Math.random().toString(32),
            name: child.children[j].getAttribute("label") || "",
          });

          const element3 = elementFactory.createShape({
            type: "bpmn:SequenceFlow",
            businessObject: bo,
          });

          const e2r = modeling.connect(
            element,
            elementsCollection[j][0],
            element3
          );

          shapes.push(element3);

          modeling.moveElements([e2r.labels[0]], { x: -40, y: 0 });
          modeling.connect(
            elementsCollection[j][elementsCollection[j].length - 1],
            element2
          );
        }
      }

      x += 50 + element2.width / 2;

      previousShape = element2;
      shapes.push(...elementsCollection.flat());
      shapes.push(element2);
    }
  }

  return shapes;
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
  if (node.tagName === "BPMN-EVENT") {
    if (node.getAttribute("type") === "end") {
      return "bpmn:EndEvent";
    }
    return "bpmn:StartEvent";
  } else if (node.tagName === "BPMN-TASK") {
    if (node.getAttribute("type") === "user") {
      return "bpmn:UserTask";
    } else if (node.getAttribute("type") === "service") {
      return "bpmn:ServiceTask";
    }
    return "bpmn:Task";
  } else if (node.tagName === "BPMN-GATEWAY") {
    if (node.getAttribute("type") === "parallel") {
      return "bpmn:ParallelGateway";
    }
    return "bpmn:ExclusiveGateway";
  }
}
