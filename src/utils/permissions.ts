import { UserProfile } from '../types';

/**
 * Returns true if the user has permission to create or edit cards.
 * Authorized roles/postes:
 * - Commerciale / Merch ('merch', 'commercial')
 * - Directeur Général ou non ('directeur', 'admin')
 * - Responsable Planning ('resp_planning', 'planning')
 */
export function canUserCreateOrEditCards(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  const isCommercialOrMerch =
    role === 'merch' ||
    role === 'commercial' ||
    poste.includes('commercial') ||
    poste.includes('merch');

  const isDirecteur =
    role === 'directeur' ||
    role === 'admin' ||
    poste.includes('directeur') ||
    poste.includes('direction') ||
    poste.includes('admin');

  const isRespPlanning =
    role === 'resp_planning' ||
    role === 'planning' ||
    poste.includes('planning') ||
    poste.includes('planification');

  return isCommercialOrMerch || isDirecteur || isRespPlanning;
}
