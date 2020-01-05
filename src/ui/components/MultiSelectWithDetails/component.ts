import Component, { tracked } from '@glimmer/component';

function isMobile() {
  return /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

interface IOption {
  name: string;
  price?: string;
  description?: string;
  id: string;
}

interface ISelectWithDetailsElement extends HTMLElement {
  visible: string;
  label?: string;
  setOptions(options: IOption[]): void;
}

export default class MultiSelectWithDetails extends Component {

  public element: ISelectWithDetailsElement;

  @tracked private isExpanded = false;
  @tracked private selected: IOption[];
  @tracked private id: string;
  @tracked private label: string = null;
  @tracked private name: string = null;
  @tracked private options: IOption[];
  @tracked private classNameForOptionsPosition: string;
  @tracked private maxVisibleOptions: number;
  @tracked private placeholder: string = null;

  private clickListener: EventListener = null;
  private isMobile: boolean;
  private eventsQueue: CustomEvent[];

  get selectedOption(): IOption[] {
    return null;
  }

  @tracked
  get selectedValues(): string[] {
    return this.selected.map((s) => s.id);
  }

  @tracked
  get withSelectedValues(): boolean {
    return this.selected.length !== 0;
  }

  @tracked
  get withOptions(): boolean {
    return this.options.length !== 0;
  }

  constructor(options: object) {
    super(options);
    this.maxVisibleOptions = 4;
    this.isMobile = isMobile();
    this.id = String(+new Date());
    this.clickListener = this.handleOutsideClick.bind(this);
    this.placeholder = 'Click to select';
    this.eventsQueue = [];
    this.selected = [];
    this.options = [];
  }

  public didInsertElement() {
    setTimeout(() => {
      this.id = this.element.id;
      this.element.setOptions = (options: IOption[]) => {
        this.options = options;
      };
      this.setProperties();
    }, 100);
  }

  public willDestroy() {
    document.removeEventListener('click', this.clickListener);
  }

  public didUpdate() {
    let event = this.eventsQueue.pop();
    while (event) {
      this.element.dispatchEvent(event);
      event = this.eventsQueue.pop();
    }
  }

  protected handleOutsideClick(event) {
    if (this.element.contains(event.target)) { return; }
    this.collapse();
  }

  protected expand(event: MouseEvent) {
    if (window.innerHeight - event.clientY < this.maxVisibleInPixels) {
      this.classNameForOptionsPosition = 'bottom-0';
    } else {
      this.classNameForOptionsPosition = 'bottom-0';
    }
    this.isExpanded = true;
    document.addEventListener('click', this.clickListener);
  }

  protected collapse() {
    this.isExpanded = false;
    document.removeEventListener('click', this.clickListener);
  }

  protected select(selected: IOption) {
    this.selected = this.selected.concat([selected]);
    this.eventsQueue.push(new CustomEvent('set', { detail: this.selected }));
    this.collapse();
  }

  protected remove(selected: IOption) {
    this.selected = this.selected.filter((sel) => sel.id !== selected.id);
  }

  @tracked
  private get maxVisibleInPixels() {
    return 68 * this.maxVisibleOptions;
  }

  @tracked
  private get styleForOptionsList() {
    return `max-height: ${this.maxVisibleInPixels}px`;
  }

  private readInitCallback() {
    const cbName: string = this.element.dataset.cb;
    if (cbName != null) {
      if (window[cbName]) {
        this.options = window[cbName](this.id);
      }
    }
  }

  private readDatabag() {
    if (this.element.dataset.bag == null) {
      return;
    }
    const path = this.element.dataset.bag.split('.');
    let r = window;
    while (path.length) {
      let p = path.shift();
      r = r[p];
    }
    this.options = (r as unknown as IOption[]);
  }

  private readVisible() {
    if (this.element.dataset == null || this.element.dataset.visible == null) {
      return;
    }
    this.maxVisibleOptions = Number(this.element.dataset.visible);
  }

  private readLabel() {
    if (this.element.dataset == null || this.element.dataset.label == null) {
      return;
    }
    this.label = this.element.dataset.label;
  }

  private readName() {
    let name = '';
    if (this.element.dataset == null || this.element.dataset.name == null) {
      name =  this.element.id;
    } else {
      name = this.element.dataset.name;
    }
    this.name = `${name}[]`;
  }

  private readPlaceholder() {
    if (this.element.dataset == null || this.element.dataset.placeholder == null) {
      return;
    }
    this.placeholder = this.element.dataset.placeholder;
  }

  private setProperties() {
    this.readDatabag();
    this.readInitCallback();
    this.readVisible();
    this.readLabel();
    this.readPlaceholder();
    this.readName();
    window.dispatchEvent(new CustomEvent('multi-select-with-details', { detail: { id: this.id }}));
  }
}
