export type UserRole = 'merch' | 'client' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  posteLabel?: string;
  password?: string;
  avatar?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  assignedTo?: string;
  completedAt?: string;
  completedBy?: string;
  subItems?: ChecklistItem[];
}

export interface StepDefinition {
  id: string;
  name: string;
  code: string;
  order: number;
  color: string;
  description?: string;
  defaultChecklists: ChecklistItem[];
}

export interface CardMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  addedAt: string;
}

export type AttachmentCategory = 'dossier_technique' | 'frame' | 'attachement';

export interface CardAttachment {
  id: string;
  name: string;
  fileUrl: string; // Data URL or preview URL
  mimeType: string; // 'application/pdf', 'image/jpeg', etc.
  size?: string;
  category: AttachmentCategory;
  uploadedAt: string;
  uploadedBy: string;
}

export interface HistoryLog {
  id: string;
  cardId: string;
  authorName: string;
  authorRole: UserRole;
  action: string;
  details?: string;
  timestamp: string; // Formatted ISO string or timestamp string
}

export interface DescriptionSpec {
  modele: string;
  matiere: string;
  prix: number;
  quantites: number;
  historiqueNote?: string;
}

export interface CardComment {
  id: string;
  cardId: string;
  authorId?: string;
  authorName: string;
  authorRole: UserRole;
  authorPoste?: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
}

export interface Card {
  id: string;
  reference: string;
  modele: string;
  clientName: string;
  currentStepId: string;
  status: 'en_attente' | 'en_cours' | 'validation' | 'termine';
  dossierTechnique: CardAttachment | null;
  frame: CardAttachment | null;
  attachments: CardAttachment[];
  dateCreation: string;
  dateLivraison: string;
  members: CardMember[];
  descriptionSpec: DescriptionSpec;
  // Step-specific checklists for this specific card
  stepChecklists: Record<string, ChecklistItem[]>; // stepId -> list of items
  historyLogs: HistoryLog[];
  comments?: CardComment[];
}
