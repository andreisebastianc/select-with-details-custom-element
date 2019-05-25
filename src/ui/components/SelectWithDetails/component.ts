import Component, { tracked } from '@glimmer/component';

interface IOption {
  title: string;
  price?: string;
  description?: string;
  id: string;
}

interface ISelectWithDetailsElement extends HTMLElement {
  visible: string;
  setOptions(options: IOption[]): void;
}

export default class SelectWithDetails extends Component {

  public element: ISelectWithDetailsElement;

  @tracked private isExpanded = false;
  @tracked private selected: IOption;
  @tracked private id: string;
  @tracked private options: IOption[];
  @tracked private classNameForOptionsPosition: string;
  @tracked private maxVisibleOptions: number;

  private clickListener: EventListener = null;

  get withOptions(): boolean {
    return this.options != null && this.options.length !== 0;
  }

  @tracked
  get withData(): boolean {
    if (this.withOptions) {
      return true;
    }
    return false;
  }

  @tracked
  get selectedOption() {
    if (this.options == null) { return null; }
    return this.selected || this.options[0] || { id: null };
  }

  @tracked
  get selectedValue(): string {
    return this.selectedOption ? this.selectedOption.id : '';
  }

  constructor(options: object) {
    super(options);
    this.maxVisibleOptions = 4;
    this.id = String(+new Date());
    this.clickListener = this.handleOutsideClick.bind(this);
  }

  public didInsertElement() {
    this.element.setOptions = (options: IOption[]) => {
      this.options = options;
    };
    setTimeout(this.setProperties.bind(this), 0);
  }

  public willDestroy() {
    document.removeEventListener('click', this.clickListener);
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
    this.collapse();
  }

  @tracked
  private get maxVisibleInPixels() {
    return 68 * this.maxVisibleOptions;
  }

  @tracked
  private get styleForOptionsList() {
    return `max-height: ${this.maxVisibleInPixels}px`;
  }

  private readDatabag() {
    if (this.element.dataset == null && this.element.dataset.bag == null) {
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
    if (this.element.dataset == null && this.element.dataset.visible == null) {
      return;
    }
    this.maxVisibleOptions = Number(this.element.dataset.visible);
  }

  private setProperties() {
    this.readDatabag();
    this.readVisible();
    this.id = this.element.id;
  }
}
