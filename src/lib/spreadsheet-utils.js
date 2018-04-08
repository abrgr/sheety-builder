import { getSpreadsheet as getGoogleSheet } from './google';
import sheetToModel from './sheet-to-model';

export const providers = Object.freeze({
  GOOGLE: 'google'
});

export function parseProviderId(providerId) {
  const firstDash = providerId.indexOf('-');
  return {
    provider: providerId.slice(0, firstDash),
    id: providerId.slice(firstDash + 1)
  };
}

export function createProviderId(provider, id) {
  return `${provider}-${id}`;
}

export function getModel(providerId) {
  const { provider, id } = parseProviderId(providerId);

  switch ( provider ) {
    case providers.GOOGLE:
      return getGoogleSheet(id).then(sheetToModel.bind(null, providerId));
    default:
      return Promise.reject(new Error('Unknown provider'));
  }
}
