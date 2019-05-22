import Component, { tracked } from '@glimmer/component';

interface Option {
  title: string;
  price?: string;
  description?: string;
  id: string;
}

const tempOptions: Array<Option> = [
  {
    title: "Vanilie cu fulgi de ciocolată",
    price: "100 RON",
    id: "xxx",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat \
  mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
  }, 
  {
    title: "Buttercream ciocolată",
    price: "100 RON",
    id: "yyy",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat \
  mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
  },
  {
    title: "Vanilie cu fulgi de ciocolată",
    price: "100 RON",
    id: "zzz",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat \
  mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
  }, 
  {
    title: "Buttercream ciocolată",
    price: "100 RON",
    id: "ttt",
    description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat \
  mattis eros. Nullam malesuada erat ut turpis. Suspendisse urna nibh, viverra non, semper suscipit, posuere a, pede."
  }
]

export default class SelectWithDetails extends Component {
  @tracked isExpanded = false;
  @tracked selected: Option ;
  @tracked options: Array<Option> = tempOptions;

  constructor(options) {
    super(options);
    this.selected = tempOptions[0];
  }

  expand() {
    this.isExpanded = true;
  }

  collapse() {
    this.isExpanded = false;
  }

  select(selected) {
    this.selected = selected;
    this.collapse();
  }
}
