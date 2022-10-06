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
    
    .tree li > div:first-of-type {
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
    
    .tree .type {
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
      margin-left: 0.4rem;
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

    .tree .root {
      font-family: monaco, Consolas, 'Lucida Console', monospace;
      font-size: 0.8rem;
      background-color: red;
      color: white;
      padding: 0.3rem;
      margin-left: 0.4rem;
      border-radius: 8px;
      vertical-align: middle;
      text-transform: uppercase;
    }

    .tree .title {
      position: -webkit-sticky; /* Safari */
      position: sticky;
      top: 90px;
      margin-top:10px;
      background: white;
    }

    .navigation {
      width: 100%;
    }

    .nav-button {
      display: inline-block;
      //width: 50%;
      margin: 4px;
      padding: 2px;
      border-radius: 8px;
      text-align: center;
      background: lightgreen;
      border: solid;
      border-color: black;
      cursor: pointer;
    }

    .navigation > a {
      text-decoration: none;
      font-size: 0.8rem;
      background: black;
      color: white;
    }

    .opened {
      background: red;
    }

    `;

    return style;
  }

  _getHtmlSpecification() {
    const htmlSpecification = document.createElement('ul');
    htmlSpecification.setAttribute('data-type', 'specification');
    htmlSpecification.setAttribute('data-name', this.specification.version);
    htmlSpecification.setAttribute('class', 'tree');
    const url_md = this.specification.urls.find(url => url.type === 'markdown').url;
    const url_schema = this.specification.urls.find(url => url.type === 'schema').url;
    htmlSpecification.innerHTML = `
      <li>
        <div>
          <div class="title"><h1>OpenAPI ${this.specification.version} Specification</h1></div>
          <div class="description">${this.specification.description}</div>
          <div class="navigation">
            <a href="${url_md}" target="MD_${this.specification.version}" class="nav-button">Original Documentation&nbsp;🔗</a>
            <a href="${url_schema}" target="SCHEMA_${this.specification.version}" class="nav-button">JSON Schema&nbsp;🔗</a>
          </div>
        </div>
      </li>
    `;
    const sections = document.createElement('ul');
    sections.appendChild(this._getHtmlSchemaSection());
    htmlSpecification.appendChild(sections);
    return htmlSpecification;
  }

  _getHtmlSchemaSection() {
    const schemaSection = document.createElement('li');
    schemaSection.setAttribute('data-type', 'section');
    schemaSection.setAttribute('data-name', 'schema');
    schemaSection.setAttribute('class', 'node');
    schemaSection.innerHTML = `
        <div>
          <div class="title"><h1>Schema</h1></div>
          </div>
        </div>
    `;
    schemaSection.appendChild(this._getAllHtmlSchemas());
    return schemaSection;
  }

  _getAllHtmlSchemas(){
    const types = [];
    this.specification.schemas.forEach(schema => {
      types.push(schema.name);
    })
    const htmlSchemas = this._getHtmlSchemas(types);
    return htmlSchemas;
  }

  _getHtmlSchema(schema) {
    const htmlSchema = document.createElement('li');
    let extensible = '';
    if(schema.extensible) {
      extensible = `<span class="extensible">Extensible</span>`
    }
    let root = '';
    if(schema.root) {
      root = `<span class="root">Root</span>`
    }
    const url_md = schema.urls.find(url => url.type === 'markdown').url;
    htmlSchema.innerHTML = `
        <div class="node" data-type="schema" data-name="${schema.name}">
          <div class="title">
            <h1>${schema.name}${root}${extensible}</h1>
          </div>
          <div class="description">${schema.description}</div>
          <div class="navigation">
            <a href="${url_md}" target="MD_${this.specification.version}" class="nav-button">Original Documentation&nbsp;🔗</a>
            <span class="nav-button" data-action="children">→</span>
          </div>
        </div>
    `;
    return htmlSchema;
  }

  _getHtmlSchemas(types) {
    const htmlSchemas = document.createElement('ul');
    htmlSchemas.setAttribute('data-type', 'children');
    types.forEach(type => {
      const schema = this.specification.schemas.find(s => s.name === type);
      if(schema){ // atomic types will not be found but we do not care
          htmlSchemas.appendChild(this._getHtmlSchema(schema));
      }
    });
    if(htmlSchemas.childElementCount > 0){
      return htmlSchemas;
    }
    else {
      return null;
    }
  }

  _getHtmlFields(schema) {
    const htmlFields = document.createElement('ul');
    htmlFields.setAttribute('data-type', 'children');
    schema.fields.forEach((field) => {
      const htmlField = document.createElement('li');
      let required = '';
      if(field.required){
        required = '<span class="required">*</span>';
      }
      let richText = '';
      if(field.richText){
        richText = '<span class="rich-text">Rich Text</span>';
      }
      let dataChildren = false;
      let navigationChildren = '';
      field.type.types.forEach(type => {
        if(type.includes('Object')){
          dataChildren = true;
        }
      });
      if(dataChildren){
        navigationChildren = `
          <span class="nav-button" data-action="children">→</span>
        `
      }
      const url_md = field.urls.find(url => url.type === 'markdown').url;
      let fieldType = '<span class="type">'+field.type.types.join('</span><span class="syntax">&nbsp;or&nbsp;</span><span class="type">')+'</span>';
      if(field.type.listType === 'array'){
        fieldType = `<span class="syntax">[</span>${fieldType}<span class="syntax">]</span>`;
      }
      else if (field.type.listType === 'map'){
        fieldType = `<span class="syntax">{key ${field.type.mapKeyType}: </span>${fieldType}<span class="syntax">}</span>`;
      }
      htmlField.innerHTML = `
      <div class="node" data-type="field" data-name="${schema.name};${field.name}" data-children="${dataChildren}">
        <div class="title">
          <code class="openapi">
            <span class="property">${field.name}</span>${required}
            <span class="syntax">:<span>
            <span class="value">${fieldType}</span>${richText}
          </code>
        </div>
        <div class="description">${field.description}</div>
        <div class="navigation">
          <a href="${url_md}" target="MD_${this.specification.version}" class="nav-button">Original Documentation&nbsp;🔗</a>
          ${navigationChildren}
        </div>
      </div>
      `;
      htmlFields.appendChild(htmlField);
    });
    return htmlFields;
  }

  getSchema(schemaName) {
    const schema = this.specification.schemas.find(schema => schema.name === schemaName);
    return schema;
  }

  getField(fieldId) {
    const split = fieldId.split(';');
    const schemaName = split[0];
    const fieldName = split[1];
    const schema = this.getSchema(schemaName);
    const field = schema.fields.find(field => field.name === fieldName);
    return field;
  }

  hasDataChildren(element){
    let result = false;
    const dataChildrenAttribute = element.getAttribute('data-children');
    if(dataChildrenAttribute===null || dataChildrenAttribute === "true"){
      result = true;
    }
    return result;
  }

  showHideChildren(elementClicked) {
    const dataParent = elementClicked.closest('[data-type]');
    if(this.hasDataChildren(dataParent)){
      console.log('dataParent', dataParent);
      const node = dataParent.parentElement;
      const dataType = dataParent.getAttribute('data-type');
      const dataName = dataParent.getAttribute('data-name');
      console.log(dataType, dataName);
      const openedChildren = node.querySelector("[data-type=children]");// replace by css class?
      if(openedChildren){
        openedChildren.remove();
        elementClicked.textContent="→";
      }
      else {
        if(dataType == 'schema'){
          const schema = this.getSchema(dataName);
          const htmlFields = this._getHtmlFields(schema);
          node.appendChild(htmlFields);  
        }
        else if(dataType == 'field'){
          const field = this.getField(dataName);
          const htmlSchemas = this._getHtmlSchemas(field.type.types);
          node.appendChild(htmlSchemas);
        }
        else if(dataType == 'section' && dataName == 'schema'){
          const htmlSchemas = this._getAllHtmlSchemas();
          dataParent.appendChild(htmlSchemas);
        }
        elementClicked.textContent="←";
      }
      elementClicked.classList.toggle('opened');
    }
    else {
      console.log('no data children');
    }
  }

  onclick(event) {
    // Click location to replace by actual buttons
    const elementClicked = event.path[0];
    console.log(elementClicked);
    const dataAction = elementClicked.getAttribute('data-action');
    if(dataAction == 'children'){
      this.showHideChildren(elementClicked);
    }
  }

  _setContentAndRender() {
    if(this.src) {
      console.log('content from url', this.src);
      fetch(this.src).then((response)=>{response.json().then((json)=>{
        this.specification = json;
        this._render();
      })});
    }
    else {
      console.log('inline content');
      this.specification = JSON.parse(this.innerText);
      this._render(); 
    }
  }

  _render() {
    const style = this.shadowRoot.querySelector('style');
    if(style === null){
      this.shadowRoot.appendChild(this._getCss());
    }
    const htmlSpecification = this.shadowRoot.querySelector('[data-type=specification]');
    if(htmlSpecification !== null){
      htmlSpecification.remove();
    }
    this.shadowRoot.appendChild(this._getHtmlSpecification());
  }

  // Web components functions

  connectedCallback() {
    console.log('connectedCallback');
    this.addEventListener("click", this.onclick);
    //this._setContentAndRender();    
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
    this._setContentAndRender(); 
  }

}

customElements.define('specification-viewer', SpecificationViewer);