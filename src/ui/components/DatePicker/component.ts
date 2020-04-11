import Component, { tracked } from '@glimmer/component';

interface IDateCell {
    display: string;
    flag: Flag;
    title?: string;
}

type Flag = 'padding' | 'blocked' | 'today' | 'selected' | 'usable' | 'past' | 'weekend';

const COMPONENT_NAME = 'DatePicker';

const months = [
    'Ianuarie',
    'Februarie',
    'Martie',
    'Aprilie',
    'Mai',
    'Iunie',
    'Iulie',
    'August',
    'Septembrie',
    'Octombrie',
    'Noiembrie',
    'Decembrie'
];

export default class DatePicker extends Component {
    @tracked private name: string = null;
    @tracked private id: string;
    @tracked private selectedDate: Date = null;
    @tracked private visibleDate: Date;
    @tracked private isVisible: boolean = false;
    @tracked private inlineStyle: string = '';
    @tracked private min: string = '';
    @tracked private withError: boolean = false;
    @tracked private incomingBlockedDates: Array<{ day: string, reason: string }> = [];

    private today: Date;
    private clickListener: EventListener = null;
    private escapeListener: EventListener = null;
    private eventsQueue: CustomEvent[];

    constructor(options: object) {
        super(options);
        this.today = new Date();
        this.visibleDate = new Date(this.today.getFullYear(), this.today.getMonth());
        this.clickListener = this.handleOutsideClick.bind(this);
        this.escapeListener = this.handleEscape.bind(this);
        this.eventsQueue = [];
    }

    public didInsertElement() {
        setTimeout(() => {
            this.id = this.element.id;
            this.setProperties();
        }, 100);
    }

    public didUpdate() {
      let event = this.eventsQueue.pop();
      while (event) {
        this.element.dispatchEvent(event);
        event = this.eventsQueue.pop();
      }
    }

    public willDestroy() {
        document.removeEventListener('click', this.clickListener);
        document.addEventListener('keydown', this.escapeListener);
    }

    protected goToNextMonth() {
        this.visibleDate = new Date(this.visibleDate.getFullYear(), this.visibleDate.getMonth() + 1);
    }

    protected goToPrevMonth() {
        this.visibleDate = new Date(this.visibleDate.getFullYear(), this.visibleDate.getMonth() - 1);
    }

    protected showDialog(event: MouseEvent) {
        event.preventDefault();
        if (window.innerHeight - event.clientY < 393) {
            this.inlineStyle = `bottom: ${this.inputHeight}px`;
        } else {
            this.inlineStyle = `top: ${this.inputHeight}px`;
        }
        this.isVisible = true;
        document.addEventListener('click', this.clickListener);
        document.addEventListener('keydown', this.escapeListener);
    }

    protected handleChange(event: Event) {
        const value: string = (event.currentTarget as HTMLInputElement).value;
        let withError: boolean = false;
        if (value) {
            const date = new Date(value);
            if (this.min != null) {
                if (new Date(this.min) > date) {
                    withError = true;
                }
                if (this.isBlocked(date)) {
                    withError = true;
                }
            }
            this.withError = withError;
            this.visibleDate = new Date(date.getFullYear(), date.getMonth());
            this.selectedDate = date;
        }
    }

    protected isBlocked(date: Date): boolean {
        const blockedDates = this.blockedDates;
        if (blockedDates[date.getMonth()]) {
            return blockedDates[date.getMonth()][date.getDate()];
        }
    }

    protected collapse() {
        this.isVisible = false;
        if (this.min != null) {
            if (new Date(this.min) > this.selectedDate) {
                this.withError = true;
            } else if (this.withError) {
                this.withError = false;
            }
        }
        document.removeEventListener('click', this.clickListener);
        document.removeEventListener('keydown', this.escapeListener);
    }

    protected handleEscape(event) {
        const evt = event || window.event;
        if (evt.keyCode === 27) {
            this.collapse();
        }
    }

    protected handleOutsideClick(event) {
        if (this.element.contains(event.target)) { return; }
        this.collapse();
    }

    protected select(cell) {
        // adding 1 because months start from 0
        this.selectedDate = new Date(this.visibleDate.getFullYear(), this.visibleDate.getMonth(), Number(cell.display));
        this.eventsQueue.push(new CustomEvent('set', { detail: {
            localizedDate: this.formattedSelectedDate,
            selectedDate: this.selectedDate
        } }));
        this.collapse();
    }

    @tracked
    get blockedDates() {
        const blockedDates = {};
        this.incomingBlockedDates.forEach((d) => {
            const date = new Date(d.day); // potential issue: can return Invalid Date
            const month = date.getMonth();
            blockedDates[month] = blockedDates[month] || {};
            blockedDates[month][date.getDate()] = d;
        });
        return blockedDates;
    }

    @tracked
    get formattedSelectedDate(): string {
        if (this.selectedDate) {
            const offset = this.selectedDate.getTimezoneOffset();
            const fixedDate = new Date(this.selectedDate.getTime() - ( offset * 60 * 1000 ) );
            return fixedDate.toISOString().split('T')[0];
        }
        return '';
    }

    @tracked
    get cellsData() {
        let i: number;
        let j: number;
        let leftPadding: number = this.firstDayInVisibleMonth ? this.firstDayInVisibleMonth : 7;
        const cells = new Array<IDateCell>(42);

        // left padding
        i = 0;
        while (i < leftPadding) {
            cells[i] = {
                display: '',
                flag: 'padding'
            };
            i++;
        }

        // decrease one from padding to move back into the 0-6 range
        leftPadding--;

        i = 0;
        const weekendDays = [];
        const firstSa = this.firstDayInVisibleMonth ? 7 - this.firstDayInVisibleMonth : 7;
        const firstSu = this.firstDayInVisibleMonth ? firstSa + 1 : 1;
        while (true) {
            let sa = i * 7 + firstSa;
            let su = i * 7 + firstSu;
            if (sa > 31) { break; }
            if (su > 31) { break; }
            weekendDays.push(sa);
            weekendDays.push(su);
            i++;
        }

        // month days
        const isCurrentMonth = this.isCurrentMonth;
        const isInThePast = this.isInThePast;
        const visibleMonth = this.visibleMonth;
        const visibleYear = this.visibleYear;
        const todayDay = this.today.getDate();
        let selectedDateDay = null;
        let selectedDateYear = null;
        let selectedDateMonth = null;

        if (this.selectedDate) {
            selectedDateMonth = this.selectedDate.getMonth();
            selectedDateDay = this.selectedDate.getDate();
            selectedDateYear = this.selectedDate.getFullYear();
        }

        // start at one to avoid adding 1 for display purposes
        for (i = 1; i <= this.daysInVisibleMonth; i++) {
            if (selectedDateMonth === visibleMonth && selectedDateYear === visibleYear) {
                if (i === selectedDateDay) {
                    cells[i + leftPadding] = {
                        display: String(i),
                        flag: 'selected',
                        title: ''
                    };
                    continue;
                }
            }
            if (this.blockedDates[visibleMonth]) {
                let d = this.blockedDates[visibleMonth][i];
                if (d) {
                    cells[i + leftPadding] = {
                        display: String(i),
                        flag: 'blocked',
                        title: d.reasons
                    };
                    continue;
                }
            }
            if (weekendDays.indexOf(i) !== -1) {
                cells[i + leftPadding] = {
                    display: String(i),
                    flag: 'weekend'
                };
                continue;
            }
            if (isCurrentMonth) {
                if (i === todayDay) {
                    cells[i + leftPadding] = {
                        display: String(i),
                        flag: 'today'
                    };
                    continue;
                } else if (i < todayDay) {
                    cells[i + leftPadding] = {
                        display: String(i),
                        flag: 'past'
                    };
                    continue;
                }
            }
            if (isInThePast) {
                cells[i + leftPadding] = {
                    display: String(i),
                    flag: 'past'
                };
                continue;
            } else {
                cells[i + leftPadding] = {
                    display: String(i),
                    flag: 'usable'
                };
            }
        }

        // right padding
        for (j = 1, i = this.daysInVisibleMonth + leftPadding + 1; i < 42; j++, i++) {
            cells[i] = {
                display: '',
                flag: 'padding'
            };
        }

        return cells;
    }

    @tracked
    get isCurrentMonth() {
        return this.visibleDate.getTime() === new Date(this.today.getFullYear(), this.today.getMonth()).getTime();
    }

    @tracked
    get monthName() {
        return months[this.visibleMonth];
    }

    @tracked
    get displayYear() {
        if (this.visibleDate.getFullYear() === this.today.getFullYear()) {
            return '';
        }
        return this.visibleDate.getFullYear();
    }

    @tracked
    get visibleYear() {
        return this.visibleDate.getFullYear();
    }

    @tracked
    get inputClasses(): string {
        let classes = 'cursor-pointer bg-transparent border border-gray-600 py-3 px-3 rounded';
        if (this.withError) {
            classes += ' error text-red-500';
        }
        return classes;
    }

    get weekDays() {
        return [
            'Du',
            'Lu',
            'Ma',
            'Mi',
            'Jo',
            'Vi',
            'Sâ'
        ];
    }

    get inputHeight() {
        const inputEl: HTMLElement = this.element.querySelector('input[type=date]');
        if (inputEl) {
            return inputEl.offsetHeight + 5;
        }
        return 0;
    }

    get isInThePast() {
        return this.visibleDate.getTime() < new Date(this.today.getFullYear(), this.today.getMonth()).getTime();
    }

    get visibleMonth() {
        return this.visibleDate.getMonth();
    }

    get daysInVisibleMonth() {
        return new Date(this.visibleYear, this.visibleMonth + 1, 0).getDate();
    }

    get firstDayInVisibleMonth() {
        return this.visibleDate.getDay();
    }

    private readName() {
        let nameAttr: Attr = this.element.attributes.getNamedItem('name');
        if (nameAttr) {
            this.element.attributes.removeNamedItem('name');
            this.name = nameAttr.value;
        } else {
            this.name = '';
        }
    }

    private readMinAttribute() {
        let nameAttr: Attr = this.element.attributes.getNamedItem('min');
        if (nameAttr) {
            this.element.attributes.removeNamedItem('min');
            this.min = nameAttr.value;
        } else {
            this.min = '';
        }
    }

    private readValue() {
        let nameAttr: Attr = this.element.attributes.getNamedItem('value');
        if (nameAttr) {
            this.element.attributes.removeNamedItem('value');
            this.selectedDate = new Date(nameAttr.value);
        } else {
            this.selectedDate = null;
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
      this.incomingBlockedDates = (r as unknown as Array<{ day: string, reason: string }>);
    }

    private setProperties() {
        this.readDatabag();
        this.readName();
        this.readMinAttribute();
        this.readValue();
        window.dispatchEvent(new CustomEvent(COMPONENT_NAME, { detail: { id: this.id } }));
    }
}
