// src/plugins/primevue-components.js

import { Drawer, IconField, InputIcon, Popover, Select, ToggleSwitch, MultiSelect, AutoComplete } from 'primevue';
import Avatar from 'primevue/avatar';
import Badge from 'primevue/badge';
import Button from 'primevue/button';
import OverlayBadge from 'primevue/overlaybadge';
import Card from 'primevue/card';
import Checkbox from 'primevue/checkbox';
import Column from 'primevue/column';
import ConfirmDialog from 'primevue/confirmdialog';
import DataTable from 'primevue/datatable';
import DatePicker from 'primevue/datepicker';
import Dialog from 'primevue/dialog';
import Divider from 'primevue/divider';
import FileUpload from 'primevue/fileupload';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Password from 'primevue/password';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Toast from 'primevue/toast';
import Tooltip from 'primevue/tooltip';

export default function registerPrimeVueComponents(app) {
    app.component('FileUpload', FileUpload);
    app.component('Button', Button);
    app.component('InputText', InputText);
    app.component('Password', Password);
    app.component('Dialog', Dialog);
    app.component('Toast', Toast);
    app.component('ConfirmDialog', ConfirmDialog);
    app.component('DataTable', DataTable);
    app.component('Column', Column);
    app.component('Avatar', Avatar);
    app.component('Tag', Tag);
    app.component('Card', Card);
    app.component('Divider', Divider);
    app.component('Checkbox', Checkbox);
    app.component('InputNumber', InputNumber);
    app.component('DatePicker', DatePicker);
    app.component('Textarea', Textarea);
    app.component('TabPanel', TabPanel);
    app.component('Select', Select);
    app.component('ToggleSwitch', ToggleSwitch);
    app.component('Drawer', Drawer);
    app.component('Popover', Popover);
    app.component('IconField', IconField);
    app.component('InputIcon', InputIcon);
    app.component('MultiSelect', MultiSelect);
    app.component('AutoComplete', AutoComplete);
    app.component('Badge', Badge);
    app.component('OverlayBadge', OverlayBadge);
    app.directive('tooltip', Tooltip);
}
