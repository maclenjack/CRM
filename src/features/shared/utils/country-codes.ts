import { type CountryCode, getCountryCallingCode } from 'libphonenumber-js';

export interface CountryCodeOption {
  code: CountryCode;
  dialCode: string;
  flag: string;
  name: string;
}

const targetCountries: CountryCode[] = ['US', 'GB', 'CA', 'AU', 'NZ', 'DE'];

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export const localizedCountryCodes: CountryCodeOption[] = targetCountries
  .map((code) => {
    let dialCode = '+64';
    try {
      dialCode = `+${getCountryCallingCode(code)}`;
    } catch (e) {
      console.warn(`Could not parse dial code context for ${code}`);
      console.error(e);
    }

    return {
      code,
      dialCode,
      flag: getFlagEmoji(code),
      name: regionNames.of(code) || code,
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name));
