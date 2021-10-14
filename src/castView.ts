import { 
    TextFileView, 
    WorkspaceLeaf, 
  } from "obsidian";
  
  export default class CastView extends TextFileView {  
    id: string = (this.leaf as any).id;
  
    constructor(leaf: WorkspaceLeaf) {
      super(leaf);
    }

    async save(preventReload:boolean=true) {
      await super.save();
    }
  
    // get the new file content
    // if drawing is in Text Element Edit Lock, then everything should be parsed and in sync
    // if drawing is in Text Element Edit Unlock, then everything is raw and parse and so an async function is not required here
    getViewData () {
      return this.data;
    }
  
    // clear the view content  
    clear() {
    }
    
    async setViewData (data: string, clear: boolean = false) {   
      if(clear) this.clear();
    }
  
    //Compatibility mode with .excalidraw files
    canAcceptExtension(extension: string) {
      return extension == "cast";
    } 
  
    // gets the title of the document
    getDisplayText() {
      if(this.file) return this.file.basename;
      else return 'NOFILE';
    }
  
    // the view type name
    getViewType() {
      return 'asciicasts';
    }
  }
  