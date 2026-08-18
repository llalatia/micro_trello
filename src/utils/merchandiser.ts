import { Card, UserProfile } from '../types';

export interface CardMerchandiserInfo {
  name: string;
  id?: string;
  avatar?: string;
  email?: string;
  posteLabel?: string;
}

/**
 * Returns the list of 1 to 4 commercial(e)s / merchandisers responsible for the card.
 */
export function getCardMerchandisers(card: Card, allUsers?: UserProfile[]): CardMerchandiserInfo[] {
  // 1. Check if card.merchandisers array exists and is not empty
  if (card.merchandisers && Array.isArray(card.merchandisers) && card.merchandisers.length > 0) {
    return card.merchandisers.map((m) => {
      const matchedUser = allUsers?.find(
        (u) => (m.id && u.id === m.id) || u.name.toLowerCase().trim() === m.name.toLowerCase().trim()
      );
      return {
        name: m.name,
        id: m.id || matchedUser?.id,
        avatar: m.avatar || matchedUser?.avatar,
        email: m.email || matchedUser?.email,
        posteLabel: m.posteLabel || matchedUser?.posteLabel || 'Commerciale / Merchandiser',
      };
    });
  }

  // 2. Check if card.merchandiserName exists (legacy/single property)
  if (card.merchandiserName && card.merchandiserName.trim() !== '') {
    const matchedUser = allUsers?.find(
      (u) =>
        (card.merchandiserId && u.id === card.merchandiserId) ||
        u.name.toLowerCase().trim() === card.merchandiserName?.toLowerCase().trim()
    );

    const primary: CardMerchandiserInfo = {
      name: card.merchandiserName,
      id: card.merchandiserId || matchedUser?.id,
      avatar: card.merchandiserAvatar || matchedUser?.avatar,
      email: matchedUser?.email,
      posteLabel: matchedUser?.posteLabel || 'Commerciale / Merchandiser',
    };

    // Also look for other merch members in card.members
    const otherMerchMembers = card.members
      ?.filter((mem) => mem.role === 'merch' && mem.name !== card.merchandiserName)
      .map((mem) => {
        const u = allUsers?.find((user) => user.id === mem.id || user.name === mem.name);
        return {
          name: mem.name,
          id: mem.id,
          avatar: mem.avatar || u?.avatar,
          email: mem.email || u?.email,
          posteLabel: u?.posteLabel || 'Commerciale / Merchandiser',
        };
      }) || [];

    return [primary, ...otherMerchMembers];
  }

  // 3. Look in card.members for all members with role === 'merch'
  const merchMembers = card.members?.filter((m) => m.role === 'merch');
  if (merchMembers && merchMembers.length > 0) {
    return merchMembers.map((m) => {
      const matchedUser = allUsers?.find((u) => u.id === m.id || u.name === m.name);
      return {
        name: m.name,
        id: m.id,
        avatar: m.avatar || matchedUser?.avatar,
        email: m.email || matchedUser?.email,
        posteLabel: matchedUser?.posteLabel || 'Commerciale / Merchandiser',
      };
    });
  }

  // 4. Fallback: first merch in allUsers if available
  const defaultMerch = allUsers?.filter((u) => u.role === 'merch');
  if (defaultMerch && defaultMerch.length > 0) {
    return defaultMerch.slice(0, 2).map((dm) => ({
      name: dm.name,
      id: dm.id,
      avatar: dm.avatar,
      email: dm.email,
      posteLabel: dm.posteLabel || 'Commerciale / Merchandiser',
    }));
  }

  return [
    {
      name: 'Sophie Bertrand',
      posteLabel: 'Commerciale / Merchandiser',
    },
  ];
}

/**
 * Returns the primary commercial(e) / merchandiser responsible for the card.
 */
export function getCardMerchandiser(card: Card, allUsers?: UserProfile[]): CardMerchandiserInfo {
  const list = getCardMerchandisers(card, allUsers);
  return list[0] || { name: 'Sophie Bertrand', posteLabel: 'Commerciale / Merchandiser' };
}
