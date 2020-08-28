import { helper } from '@ember/component/helper';

// eslint-disable-next-line no-unused-vars
export function userInitials(params, values) {
  const {
    user,
  } = values;
  if (!user) {
    return '';
  }
  return user.get('firstName').charAt(0) + user.get('lastName').charAt(0);
}

export default helper(userInitials);
