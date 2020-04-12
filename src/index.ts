import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import initializeCustomElements from '@glimmer/web-component';
import App from './main';

const components = {
  'date-picker': 'DatePicker',
  'multi-select-with-details': 'MultiSelectWithDetails'
  'select-with-details': 'SelectWithDetails'
};

const shouldMount = Object.keys(components)
                          .reduce(
                            (accumulator, currentValue) => accumulator && (customElements.get(currentValue) == null),
                              true
                            );

if (shouldMount) {
  const app = new App();

  setPropertyDidChange(() => {
    app.scheduleRerender();
  });

  app.registerInitializer({
    initialize(registry) {
      registry.register(`component-manager:/${app.rootName}/component-managers/main`, ComponentManager);
    }
  });

  app.boot().then(() => {
    initializeCustomElements(app, components);
  });
}
