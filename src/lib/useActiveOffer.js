import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storefrontService } from '../services/storefront';

export function useActiveOffer() {
  const [searchParams] = useSearchParams();
  const offerId = searchParams.get('offerId');
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    if (!offerId) { setOffer(null); return; }
    storefrontService.getOffer(offerId)
      .then(r => setOffer(r.data || null))
      .catch(() => setOffer(null));
  }, [offerId]);

  return offer;
}
