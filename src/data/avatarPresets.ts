export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  category: 'da_cartoon' | 'manga_anime' | 'fun_3d' | 'notion_art' | 'photo';
  badge?: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  // --- DESSIN ANIMÉ & CARTOONS (D.A) ---
  {
    id: 'da-1',
    name: 'Maya Supergirl',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maya&eyebrows=default&eyes=happy&mouth=smile&top=longCurly',
  },
  {
    id: 'da-2',
    name: 'Léo Lunettes',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Leo&accessories=prescription02&accessoriesProbability=100&clothesColor=65c9ff&clothing=graphicShirt&top=shortFlat',
  },
  {
    id: 'da-3',
    name: 'Zoé Casquette',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Zoe&clothing=hoodie&top=hat',
  },
  {
    id: 'da-4',
    name: 'Sam Designer',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Samuel&accessories=round&accessoriesProbability=100&facialHair=beardLight&top=frizzle',
  },
  {
    id: 'da-5',
    name: 'Chloé Tresses',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Chloe&eyes=wink&mouth=smile&top=dreads01',
  },
  {
    id: 'da-6',
    name: 'Maxime Cool',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Maxime&clothesColor=ff5c5c&clothing=blazerAndShirt&top=curvy',
  },
  {
    id: 'da-7',
    name: 'Lola Fashion',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Lola&accessories=sunglasses&accessoriesProbability=100&top=straight02',
  },
  {
    id: 'da-8',
    name: 'Arthur Barbu',
    category: 'da_cartoon',
    badge: 'D.A',
    url: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arthur&facialHair=beardMajestic&top=shaggy',
  },

  // --- MANGA & AVENTURE ---
  {
    id: 'manga-1',
    name: 'Aiko Héroïne',
    category: 'manga_anime',
    badge: 'Manga',
    url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Aiko&eyes=variant02&hair=variant12&head=variant01',
  },
  {
    id: 'manga-2',
    name: 'Ren Aventurier',
    category: 'manga_anime',
    badge: 'Anime',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Ren&hair=short04&glasses=variant02',
  },
  {
    id: 'manga-3',
    name: 'Hana Fleur',
    category: 'manga_anime',
    badge: 'Manga',
    url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Hana&hair=variant08&mouth=happy02',
  },
  {
    id: 'manga-4',
    name: 'Kaito Guerrier',
    category: 'manga_anime',
    badge: 'Anime',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kaito&hair=short01&eyes=variant10',
  },
  {
    id: 'manga-5',
    name: 'Sora Céleste',
    category: 'manga_anime',
    badge: 'Manga',
    url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Sora&hair=variant15&accessories=glasses',
  },
  {
    id: 'manga-6',
    name: 'Yuki Magicienne',
    category: 'manga_anime',
    badge: 'Manga',
    url: 'https://api.dicebear.com/9.x/lorelei/svg?seed=Yuki&hair=variant10&freckles=true',
  },
  {
    id: 'manga-7',
    name: 'Kenji Samouraï',
    category: 'manga_anime',
    badge: 'Anime',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Kenji&hair=short03',
  },
  {
    id: 'manga-8',
    name: 'Mika Voyageuse',
    category: 'manga_anime',
    badge: 'Anime',
    url: 'https://api.dicebear.com/9.x/adventurer/svg?seed=Mika&hair=long05',
  },

  // --- FUN 3D & ROBOTS / MASCOTTES ---
  {
    id: 'fun-1',
    name: 'Volt Robot',
    category: 'fun_3d',
    badge: 'Bot',
    url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Volt&sides=round&top=antenna',
  },
  {
    id: 'fun-2',
    name: 'Sunny Smile',
    category: 'fun_3d',
    badge: 'Emoji',
    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Sunny&mouth=wideSmile',
  },
  {
    id: 'fun-3',
    name: 'Sparky Cyborg',
    category: 'fun_3d',
    badge: 'Bot',
    url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Sparky&top=glowingBulb',
  },
  {
    id: 'fun-4',
    name: 'Cool Cat',
    category: 'fun_3d',
    badge: 'Fun',
    url: 'https://api.dicebear.com/9.x/big-smile/svg?seed=Felix&hair=short01',
  },
  {
    id: 'fun-5',
    name: 'Gizmo Cyber',
    category: 'fun_3d',
    badge: 'Bot',
    url: 'https://api.dicebear.com/9.x/bottts/svg?seed=Gizmo&top=radar',
  },
  {
    id: 'fun-6',
    name: 'Star Emoji',
    category: 'fun_3d',
    badge: 'Emoji',
    url: 'https://api.dicebear.com/9.x/fun-emoji/svg?seed=Star&eyes=stars',
  },

  // --- STYLE CROQUIS, NOTION & ART ---
  {
    id: 'art-1',
    name: 'Juliette Croquis',
    category: 'notion_art',
    badge: 'Notion',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Juliette&gesture=pointing',
  },
  {
    id: 'art-2',
    name: 'Lucas Minimalist',
    category: 'notion_art',
    badge: 'Notion',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Lucas&gesture=ok',
  },
  {
    id: 'art-3',
    name: 'Emma Vecteur',
    category: 'notion_art',
    badge: 'Art',
    url: 'https://api.dicebear.com/9.x/micah/svg?seed=Emma&baseColor=f9c9b6',
  },
  {
    id: 'art-4',
    name: 'Hugo Architecte',
    category: 'notion_art',
    badge: 'Notion',
    url: 'https://api.dicebear.com/9.x/notionists/svg?seed=Hugo&gesture=wave',
  },
  {
    id: 'art-5',
    name: 'Clara Peeps',
    category: 'notion_art',
    badge: 'Peeps',
    url: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=Clara&head=afro',
  },
  {
    id: 'art-6',
    name: 'Noah Style',
    category: 'notion_art',
    badge: 'Art',
    url: 'https://api.dicebear.com/9.x/micah/svg?seed=Noah&glasses=round',
  },

  // --- PHOTOS RÉELLES ---
  {
    id: 'photo-1',
    name: 'Sophie (Photo)',
    category: 'photo',
    badge: 'Photo',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-2',
    name: 'Alexandre (Photo)',
    category: 'photo',
    badge: 'Photo',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-3',
    name: 'Camille (Photo)',
    category: 'photo',
    badge: 'Photo',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  {
    id: 'photo-4',
    name: 'Thomas (Photo)',
    category: 'photo',
    badge: 'Photo',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
];
