import { ComponentManager, setPropertyDidChange } from '@glimmer/component';
import initializeCustomElements from '@glimmer/web-component';
import App from './main';

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
  initializeCustomElements(app, { 
    'select-with-details': 'SelectWithDetails',
    'multi-select-with-details': 'MultiSelectWithDetails' 
  });
});
