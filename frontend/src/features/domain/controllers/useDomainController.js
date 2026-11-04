import { useMemo, useState } from 'react';
import { parseDomain } from '../services/domainService.js';

export function useDomainController() {
  const [domainText, setDomainText] = useState('a, b');
  const domain = useMemo(() => parseDomain(domainText), [domainText]);
  return { domainText, setDomainText, domain };
}
