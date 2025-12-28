import {render} from 'preact';
import {App} from './app.js';
import 'virtual:uno.css';
import './styles.css';

render(<App />, document.getElementById('app')!);
