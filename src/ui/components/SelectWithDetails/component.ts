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

export default class SelectWithDetails extends Component {

  public element: ISelectWithDetailsElement;

  @tracked private isExpanded = false;
  @tracked private selected: IOption;
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

  @tracked
  get selectedOption(): IOption {
    if (this.options == null) { return null; }
    return this.selected;
  }

  @tracked
  get selectedValue(): string {
    return this.selectedOption ? this.selectedOption.id : '';
  }

  @tracked
  get selectedDescription() {
    if (!this.selectedOption.description) {
      return '';
    }
    return this.selectedOption.description;
  }

  constructor(options: object) {
    super(options);
    this.maxVisibleOptions = 4;
    this.isMobile = isMobile();
    this.id = String(+new Date());
    this.clickListener = this.handleOutsideClick.bind(this);
    this.placeholder = 'Click to select';
    this.eventsQueue = [];
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
      this.classNameForOptionsPosition = 'top-0';
    }
    this.isExpanded = true;
    document.addEventListener('click', this.clickListener);
  }

  protected collapse() {
    this.isExpanded = false;
    document.removeEventListener('click', this.clickListener);
  }

  protected select(selected: IOption) {
    this.selected = selected;
    this.eventsQueue.push(new CustomEvent('set', { detail: selected }));
    this.collapse();
  }

  protected selectMobile(event: HTMLSelectElement) {
    const value = event.currentTarget.value;
    const matching = this.options.filter((o) => o.id === value);
    this.selected = matching[0];
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
    debugger;
    if (this.element.dataset == null || this.element.dataset.name == null) {
      this.name =  this.element.id;
    }
    this.name = this.element.dataset.name;
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
    window.dispatchEvent(new CustomEvent('select-with-details', { detail: { id: this.id }}));
  }
}
