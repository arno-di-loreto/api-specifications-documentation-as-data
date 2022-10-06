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
      background-color: green;
      color: white;
      padding: 0.3rem;
      border-radius: 8px;
      vertical-align: middle;
      text-transform: uppercase;
    }

    .tree .rich-text {
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 0.6rem;
      background-color: brown;
      color: white;
      padding: 0.2rem;
      margin-left: 0.2rem;
      border-radius: 5px;
      vertical-align: middle;
      text-transform: uppercase;
    }

    .tree .title {
      position: -webkit-sticky; /* Safari */
      position: sticky;
      top: 0;
      background: white;
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
          <div class="title"><h1>OpenAPI ${specification.version} Specification</h1></div>
          <div class="description">${specification.description}</div>
        </div>
      </li>
    `;
    const ul = document.createElement('ul');
    // Need to add a "root" schema flag in data
    const rootObject = this._getHtmlSchema(specification.schemas[0], specification);
    ul.appendChild(rootObject);
    htmlSpecification.appendChild(ul);
    return htmlSpecification;
  }

  _getHtmlSchema(schema, specification) {
    const htmlSchema = document.createElement('li');
    let extensible = '';
    if(schema.extensible) {
      extensible = `&nbsp;<span class="extensible">Extensible</span>`
    }
    htmlSchema.innerHTML = `
        <div class="node">
          <div class="title">
            <h1>${schema.name}${extensible}</h1>
          </div>
          <div class="description">${schema.description}</div>
        </div>
    `;
    const fields = this._getHtmlFields(schema.fields, specification);
    htmlSchema.appendChild(fields);
    return htmlSchema;
  }


  _getHtmlSchemas(types, specification) {
    const htmlSchemas = document.createElement('ul');
    types.forEach(type => {
      // Q&D to avoid loop
      if(['Info Object', 'Contact Object', 'License Object', 'Paths Object', 'Path Item Object', 'Components Object', 'Parameter Object', 'Reference Object'].includes(type)){
        const schema = specification.schemas.find(s => s.name === type);
        console.log(type, schema);
        if(schema){ // atomic types will not be found but we do not care
            htmlSchemas.appendChild(this._getHtmlSchema(schema, specification));
        }
      }
    });
    if(htmlSchemas.childElementCount > 0){
      return htmlSchemas;
    }
    else {
      return null;
    }
  }

  _getHtmlFields(fields, specification) {
    const htmlFields = document.createElement('ul');
    fields.forEach((field) => {
      console.log(field)
      const htmlField = document.createElement('li');
      let required = '';
      if(field.required){
        required = '<span class="required">*</span>';
      }
      let richText = '';
      if(field.richText){
        richText = '<span class="rich-text">Rich Text</span>';
      }
      htmlField.innerHTML = `
      <div class="node" data-schema="${field.type.types[0]}">
        <div class="title">
          <code class="openapi">
            <span class="property">${field.name}</span>${required}
            <span class="syntax">:<span>
            <span class="value">${field.type.types.join(',')}</span>${richText}
          </code>
        </div>
        <div class="description">${field.description}</div>
      </div>
      `;
      // will need a fix to add the map/list dimension * vs {*}
      const htmlSchemas = this._getHtmlSchemas(field.type.types, specification);
      console.log(htmlSchemas);
      if(htmlSchemas){
        htmlField.appendChild(htmlSchemas);
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