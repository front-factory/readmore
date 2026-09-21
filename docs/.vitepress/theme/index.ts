import Theme from '@frontfactory/vitepress-theme';
import ReadmoreDemo from './components/ReadmoreDemo.vue';
import ReadmoreExpandAll from './components/ReadmoreExpandAll.vue';

import '../../../src/readmore.css';
import './custom.css';

export default {
    extends: Theme,
    enhanceApp({ app }) {
        app.component('ReadmoreDemo', ReadmoreDemo);
        app.component('ReadmoreExpandAll', ReadmoreExpandAll);
    }
} satisfies typeof Theme;
