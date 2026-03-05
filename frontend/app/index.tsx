import { Provider } from 'react-redux';
import { store } from '../src/store';
import RootNavigator from '../src/navigation';
import { NavigationIndependentTree } from '@react-navigation/native';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationIndependentTree>
        <RootNavigator />
      </NavigationIndependentTree>
    </Provider>
  );
}