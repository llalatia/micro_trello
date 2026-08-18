import { Card, UserProfile } from '../types';

/**
 * Checks if the user is a "Resp Point Clients" (Responsable Point Clients).
 */
export function isRespPointClients(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  return (
    role === 'resp_point_clients' ||
    role === 'resp_point_client' ||
    poste.includes('point client') ||
    poste.includes('point-client') ||
    poste.includes('point clients') ||
    role === 'admin'
  );
}

/**
 * Checks if the user is a Visiteur (Observateur).
 */
export function isVisiteur(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  return role === 'visiteur' || poste.includes('visiteur') || poste.includes('observateur');
}

/**
 * Returns true if the user has permission to create or edit cards.
 * Authorized roles/postes:
 * - Commerciale / Merch ('merch', 'commercial')
 * - Responsable Point Clients ('resp_point_clients')
 * - Directeur Général ou non ('directeur', 'admin')
 * - Responsable Planning ('resp_planning', 'planning')
 * Visiteurs and standard Clients are strictly read-only.
 */
export function canUserCreateOrEditCards(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  if (isVisiteur(user)) return false;

  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  const isCommercialOrMerch =
    role === 'merch' ||
    role === 'commercial' ||
    poste.includes('commercial') ||
    poste.includes('merch');

  const isPointClients = isRespPointClients(user);

  const isDirecteur =
    role === 'directeur' ||
    role === 'directeur général' ||
    role === 'directeur general' ||
    role === 'admin' ||
    poste.includes('directeur') ||
    poste.includes('direction') ||
    poste.includes('admin');

  const isRespPlanning =
    role === 'resp_planning' ||
    role === 'planning' ||
    poste.includes('planning') ||
    poste.includes('planification');

  return isCommercialOrMerch || isPointClients || isDirecteur || isRespPlanning;
}

/**
 * Returns true if the user can assign merchandisers to a card.
 * Privilege granted to "Resp Point Clients", "Directeur", and "Admin".
 */
export function canAssignMerchandisers(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  return (
    isRespPointClients(user) ||
    role === 'directeur' ||
    role === 'directeur général' ||
    role === 'directeur general' ||
    role === 'admin' ||
    poste.includes('directeur') ||
    poste.includes('direction')
  );
}

/**
 * Returns true if the user can invite visitors by email.
 * Dedicated privilege of "Resp Point Clients" (and Admin).
 */
export function canInviteVisitors(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return isRespPointClients(user);
}

/**
 * Returns true if the user can remove / revoke visitors from a card or the tool.
 * As requested: "le Resp Point Client seul aussi est capable de retirer le visiteur de l'outil."
 */
export function canRemoveVisitors(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return isRespPointClients(user);
}

/**
 * Evaluates whether a card should be visible to a specific user.
 * - Client: only cards linked to their client name / account.
 * - Visiteur: STRICTLY only cards to which they were invited / assigned.
 * - Merch / Resp Point Clients / Directeur / Admin / etc.: sees all cards.
 */
export function isCardVisibleToUser(card: Card, user: UserProfile | null | undefined): boolean {
  if (!user) return false;

  const role = (user.role || '').toLowerCase();
  const poste = (user.posteLabel || '').toLowerCase();

  // 1. VISITEUR: strictly visible only on assigned / invited cards
  if (role === 'visiteur' || poste.includes('visiteur') || poste.includes('observateur')) {
    const userEmail = (user.email || '').toLowerCase().trim();
    const userId = user.id;

    // Check if card has visitor in invitedVisitors list
    const isInvitedInCard = (card.invitedVisitors || []).some((v) => {
      return (
        (v.email && v.email.toLowerCase().trim() === userEmail) ||
        (v.id && v.id === userId)
      );
    });

    if (isInvitedInCard) return true;

    // Check if user is in members
    const isMemberInCard = (card.members || []).some((m) => {
      return (
        (m.email && m.email.toLowerCase().trim() === userEmail) ||
        m.id === userId
      );
    });

    if (isMemberInCard) return true;

    // Check user profile invitedCardIds
    if (user.invitedCardIds && user.invitedCardIds.includes(card.id)) {
      return true;
    }

    return false;
  }

  // 2. CLIENT: only visible on client's cards
  if (role === 'client' || poste.includes('client')) {
    const clean = (str?: string) =>
      (str || '')
        .toLowerCase()
        .replace(/[^a-z0-9]/gi, '')
        .trim();

    const userNameClean = clean(user.name);
    const userEmailClean = clean(user.email.split('@')[0]);
    const cardClientClean = clean(card.clientName);

    if (
      cardClientClean.length > 0 &&
      (cardClientClean === userNameClean ||
        cardClientClean.includes(userNameClean) ||
        userNameClean.includes(cardClientClean) ||
        (userEmailClean.length > 3 && cardClientClean.includes(userEmailClean)))
    ) {
      return true;
    }

    // Check in members list
    const isMember = (card.members || []).some(
      (m) =>
        m.id === user.id ||
        (m.email && m.email.toLowerCase().trim() === user.email.toLowerCase().trim())
    );

    return isMember;
  }

  // 3. MERCH, RESP POINT CLIENTS, DIRECTEUR, ADMIN, PLANNING: Sees all cards
  return true;
}
