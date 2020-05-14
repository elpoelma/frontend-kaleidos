import EmberObject from '@ember/object';

export const refreshData = async(mandatee, mandateeRows) => {
  const iseCodes = (await mandatee.get('iseCodes')).filter((item) => item);
  const fields = (await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')))).filter((item) => item);
  const domains = await Promise.all(fields.map((field) => field.get('domain')));

  const rowToShow = EmberObject.create({
    domains: [...new Set(domains)],
    fields: [...new Set(fields)]
  });
  rowToShow.get('domains').map((domain) => domain.set('selected', false));
  rowToShow.get('fields').map((domain) => domain.set('selected', false));

  if (!mandateeRows) {
    rowToShow.set('isSubmitter', true);
  }
  return rowToShow;
};

export const selectDomain = async (rowToShowFields, domain, value) => {
  const fields = await rowToShowFields.filter((field) => field.get('domain.id') === domain.id);
  fields.map((field) => field.set('selected', value));
};

export const selectField = async (rowToShowDomains, domain, value) => {
  const foundDomain = rowToShowDomains.find((item) => item.id == domain.id);
  const fields = await domain.get('governmentFields');
  const selectedFields = fields.filter((field) => field.selected);

  if (value) {
    foundDomain.set('selected', value);
  } else {
    if (selectedFields.length === 1) {
      foundDomain.set('selected', value);
    }
  }
};

export const filterIseCodesFromMandatee = async (mandatee) => {
  const iseCodes = await mandatee.get('iseCodes');
  return iseCodes.filter((item) => item);
};

export const filterFieldsFromIseCodes = async (iseCodes) => {
  const fieldsFromIseCodes = await Promise.all(iseCodes.map((iseCode) => iseCode.get('field')));
  return fieldsFromIseCodes.filter((item) => item);
};

export const getSelectedIseCodesWithFields = async (allIseCodesInApp, selectedFieldsByUser) => {
  return (await Promise.all(allIseCodesInApp.map((iseCode) => {
    const foundField = (selectedFieldsByUser.find((field) => field.get('id') === iseCode.get('field.id')));
    if (foundField) {
      return iseCode;
    }
  }))).filter((item) => item);
};

export const createMandateeRow = async (selectedMandatee, rowToShow) => {
    const fields = await rowToShow.get('fields');
    const domains = await rowToShow.get('domains');

    const selectedDomains = [...new Set(domains.filter((domain) => domain.selected))];
    const selectedFields = fields.filter((field) => field.selected);
    const allIseCodes = await selectedMandatee.get('iseCodes');
    let filteredIseCodes = getSelectedIseCodesWithFields(allIseCodes, selectedFields);


    const selectedEmployeePriority = await selectedMandatee.get('priority');
    const newRow = EmberObject.create({
      mandatee: selectedMandatee,
      mandateePriority: selectedEmployeePriority,
      fields: selectedFields,
      domains: selectedDomains,
      iseCodes: filteredIseCodes
    });

    if (rowToShow.get('isSubmitter')) {
      newRow.set('isSubmitter', true);
    }
    return newRow;
};



