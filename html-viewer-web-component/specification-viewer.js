class SpecificationViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }

  _getCss() {
    let style = document.createElement("style");
    style.textContent = `
    :host {
      --root: #8dccad;
      --leaf: #f5cc7f;
      --node: #7b9fe0;
      --connector-color: green;
      --connector-size: 1px;
      --space: 10px;
    }
    
    .tree {
      display: inline-flex;
    }
    
    .tree ul {
      padding-left: var(--space);
    }
    
    .tree ul .closed {
      visibility:hidden;
      display: none;
    }
    
    .tree , .tree ul, .tree li {
      list-style: none;
    }
    
    .tree li {
      display: flex;
    }
    
    .tree li:first-child {
      margin-top: 2rem;
    }
    
    /* All nodes */
    
    .tree li > *:first-child{
      border: var( --connector-size) solid var( --connector-color);
      border-radius: .4em;
      padding: 0.5rem;
      margin-top: 0.5rem;
      max-width: 500px;
    }
    
    .tree pre {
      white-space:pre-wrap;
      max-height: 150px;
      overflow:auto;
    }
    
    .tree ul {
      margin: 0;
      padding: 0;
    }
    
    /* Connectors */
    
    .tree li:before {
      background: var( --connector-color);
      content: "";
      width: 20px;
      height: var( --connector-size);
      top: 25px;
      margin:0;
      left:0;
      position: relative;
    }
    
    .tree > li:before {
      content: none;
    }
    
    /* OpenAPI documentation */
    
    .tree .property {
      color: green;
    }
    
    .tree .value {
      color: orange;
    }
    
    .tree .description {
      padding-top: 0.2rem;
      color: lightgrey;
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 0.8rem;
      text-align: justify;
    }
    
    .tree .array-item {
      color: blue;
    }
    
    .tree h1 {
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 1.5rem;
    }
    .tree .required {
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 0.8rem;
      color: red
    }

    .tree .extensible {
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 0.8rem;
      color: green
    }
    `;

    return style;
  }

  _getHtmlSpecification(specification) {
    const htmlSpecification = document.createElement('ul');
    htmlSpecification.setAttribute('class', 'tree');
    htmlSpecification.innerHTML = `
      <li>
        <div>
          <h1>OpenAPI ${specification.version} Specification</h1>
          <div class="description">${specification.description}</div>
        </div>
      </li>
    `;
    const rootObject = this._getHtmlObject(specification.schemas[0], specification);
    htmlSpecification.appendChild(rootObject);
    return htmlSpecification;
  }

  _getHtmlObject(object, specification) {
    console.log('object', object)
    const htmlObject = document.createElement('ul');
    const item = document.createElement('li');
    let extensible = '';
    if(object.extensible) {
      extensible = `<span class="extensible">&nbsp;(X-tensible)</span>`
    }
    item.innerHTML = `
        <div class="node">
          <h1>${object.name}${extensible}</h1>
          <div class="description">${object.description}</div>
        </div>
    `;
    const fields = this._getHtmlFields(object.fields, specification);
    item.appendChild(fields);
    htmlObject.appendChild(item);
    return htmlObject;
  }

  _getHtmlFields(fields, specification) {
    const htmlFields = document.createElement('ul');
    fields.forEach((field) => {
      const htmlField = document.createElement('li');
      let required = '';
      if(field.required){
        required = '*';
      }
      htmlField.innerHTML = `
      <div class="node" data-schema="${field.type.types[0]}">
        <code class="openapi"><span class="property">${field.name}</span><span class="required">${required}</span>: <span class="value">${field.type.types.join(',')}</span></code>
        <div class="description">${field.description}</div>
      </div>
      `;
      // Q&D to fix
      if(field.type.types[0].includes('Object')) {
        // risk of endless loop, should be done "on click", just testing with safe schemas
        if(['Info Object', 'Contact Object', 'License Object', 'Paths Object', 'Path Item Object', 'Parameter Object'].includes(field.type.types[0])){
          const schema = specification.schemas.find(schema => schema.name === field.type.types[0]);
          console.log(field.type.types[0]);
          console.log(schema);
          const htmlObject = this._getHtmlObject(schema, specification);
          htmlField.appendChild(htmlObject);
        }

      }
      htmlFields.appendChild(htmlField);
    });
    return htmlFields;
  }

  onclick(event) {
    console.log('web component clicked', event);
    console.log(event.path[0]);
    const schemaName = event.path[0].getAttribute('data-schema');
    console.log(schemaName);
    const schema = this.content.schemas.find(schema => schema.name === schemaName);
    console.log(schema);
  }

  _setContentAndRender() {
    if(this.src) {
      console.log('content from url', this.src);
      fetch(this.src).then((response)=>{response.json().then((json)=>{
        this.content = json;
        this._render();
      })});
    }
    else {
      console.log('inline content');
      this.content = JSON.parse(this.innerText);
      this._render(); 
    }
  }

  _render() {
    this.shadowRoot.appendChild(this._getCss());
    const htmlSpecification = this._getHtmlSpecification(this.content);
    this.shadowRoot.appendChild(htmlSpecification);
  }

  // Web components functions

  connectedCallback() {
    console.log('connectedCallback');
    this.addEventListener("click", this.onclick);
    this._setContentAndRender();    
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onclick);
  }
  // The attributes of the web component
  // Hence <hello-world attribute1="" attribute2="">
  static get observedAttributes() {
    return[ 'src' ];
  }

  // Callback called when an attribute is set in tag or changed
  attributeChangedCallback(property, oldValue, newValue) {
    console.log('attributeChangedCallback', property, oldValue, newValue);
    //if(oldValue !== newValue) {
      //if(property === 'ranges'){
      //  this._setRanges(newValue);
      //}
      //else {
        this[property] = newValue;
      //}
    //}
  }

}

customElements.define('specification-viewer', SpecificationViewer);