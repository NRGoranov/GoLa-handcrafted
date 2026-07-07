export type AdminEditorSaveHandle = {
  /** Save the editor. `published` controls draft vs live for products and CMS sections. */
  save: (published: boolean) => Promise<boolean>;
};
