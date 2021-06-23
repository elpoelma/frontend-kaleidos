import EmberObject from '@ember/object';
import invert from 'lodash.invert';

const numbersBylatinAdverbialNumberals = {
  '': 1,
  bis: 2,
  ter: 3,
  quater: 4,
  quinquies: 5,
  sexies: 6,
  septies: 7,
  octies: 8,
  novies: 9,
  decies: 10,
  undecies: 11,
  duodecies: 12,
  'ter decies': 13,
  'quater decies': 14,
  quindecies: 15,
};
const latinAdverbialNumberals = invert(numbersBylatinAdverbialNumberals);

export default EmberObject.create({
  alphabet: [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z'
  ],
  // TODO translate
  notaID: '9e5b1230-f3ad-438f-9c68-9d7b1b2d875d',
  notaCaseTypeID: '1b6a6975-28e7-46b5-83fe-da37bb967db2',
  documentType: {
    decreet: {
      id: 'e4f73ddc-1ed6-4878-b9ed-ace55c0a8d64',
      url: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/e4f73ddc-1ed6-4878-b9ed-ace55c0a8d64',
    },
    besluitVlaamseRegering: {
      id: '4c7cfaf9-1d5f-4fdf-b7e9-b7ce5167e31a',
      url: 'http://kanselarij.vo.data.gift/id/concept/document-type-codes/4c7cfaf9-1d5f-4fdf-b7e9-b7ce5167e31a',
    },
  },
  decisionDocumentTypeId: '2b73f8e2-b1f8-4cbd-927f-30c91759f08b',
  minuteDocumentTypeId: 'e149294e-a8b8-4c11-83ac-6d4c417b079b',
  remarkId: '305E9678-8106-4C14-9BD6-60AE2032D794',
  mail: {
    defaultFromAddress: 'noreply@vlaanderen.be',
    translationRequest: {
      content: 'Collega’s\n\nIn bijlage voor vertaling ons dossier (publicatienummer):\n\n%%titel%%\nLimiet vertaling:\nAantal bladzijden:\nAantal woorden:\n\n\n\n%%footer%%',
      subject: '[%%kaleidosenvironment%%] Vertaalaanvraag (%%nummer%%)',
    },
    publishPreviewRequest: {
      content: 'Beste,\n\nIn bijlage voor drukproef ons dossier (%%nummer%%):\n\n(%%titel%%)\n\n%%footer%%',
      subject: '[%%kaleidosenvironment%%] Dossier (%%nummer%%) – drukproef aub',
    },
    publishRequest: {
      content: 'Beste,\n\nVoor publicatie %%nummer%%.\n\n%%footer%%',
      subject: '[%%kaleidosenvironment%%] Aanvraag publicatie (%%nummer%%)',
    },
    withdrawalTranslation: {
      content: 'Beste,\n\nIntrekking vertaling voor %%nummer%%.\n\n%%footer%%',
      subject: '[%%kaleidosenvironment%%] Intrekking vertalingsaanvraag (%%nummer%%)',
    },
    withdrawalPublishPreview: {
      content: 'Beste,\n\nIntrekking drukproef voor %%nummer%%.\n\n%%footer%%',
      subject: '[%%kaleidosenvironment%%] Intrekking drukproef (%%nummer%%)',
    },
    defaultFooter: 'Vriendelijke groeten,\n\nTeam OVRB\n\n[%%kaleidosenvironment%%]',
  },
  formallyOkOptions: [
    {
      label: 'Formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/CC12A7DB-A73A-4589-9D53-F3C2F4A40636',
      classNames: 'vlc-agenda-items__status vlc-agenda-items__status--positive auk-o-flex',
      approved: true,
      pillClassNames: 'auk-pill auk-pill--success',
      iconClassNames: 'ki-check formally-ok-icon',
      svg: {
        icon: 'check',
        color: 'success',
      },
    },
    {
      label: 'Formeel niet OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/92705106-4A61-4C30-971A-55532633A9D6',
      classNames: 'vlc-agenda-items__status auk-u-text-error auk-u-text-bold auk-o-flex',
      pillClassNames: 'auk-pill auk-pill--danger',
      iconClassNames: 'ki-cross formally-ok-icon',
      svg: {
        icon: 'cross',
        color: 'danger',
      },
    },
    {
      label: 'Nog niet formeel OK',
      uri:
        'http://kanselarij.vo.data.gift/id/concept/goedkeurings-statussen/B72D1561-8172-466B-B3B6-FCC372C287D0',
      classNames: 'vlc-agenda-items__status auk-u-text-bold auk-o-flex',
      pillClassNames: 'auk-pill',
      iconClassNames: 'ki-question-mark formally-ok-icon',
      svg: {
        icon: 'question-mark',
        color: '',
      },
    }
  ],
  latinAdverbialNumberals,
  numbersBylatinAdverbialNumberals,
  EMAIL: {
    DEFAULT_FROM: 'noreply@kaleidos.vlaanderen.be',
    TO: {
      translationsEmail: 'johan.delaure@redpencil.io',
      publishpreviewEmail: 'johan.delaure@redpencil.io',
      activityWithdrawTranslationsEmail: 'johan.delaure@redpencil.io',
      activityWithdrawPublishPreviewEmail: 'johan.delaure@redpencil.io',
      publishEmail: 'johan.delaure@redpencil.io',
    },
  },
});
