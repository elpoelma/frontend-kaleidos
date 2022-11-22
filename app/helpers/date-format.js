import { helper } from '@ember/component/helper';
import { format } from 'date-fns';
import { dateHelper } from 'frontend-kaleidos/utils/date-helper';

export default helper(function dateFormat([dateOrString, formatString]) {
  if (formatString) {
    const dateObject = dateHelper(dateOrString);
    if (dateObject) {
      return format(dateObject, formatString);
    }
  }
});
