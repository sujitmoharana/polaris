import { create } from "zustand";
import { Id } from "../../../../convex/_generated/dataModel";

interface TabState {
  openTabs: Id<"files">[];
  activeTabId: Id<"files"> | null;
  previewTabId: Id<"files"> | null;
}

const defaultTabState: TabState = {
  openTabs: [],
  activeTabId: null,
  previewTabId: null,
};

interface EditorStore {
  tabs: Map<Id<"projects">, TabState>;

  getTabState: (projectId: Id<"projects">) => TabState;

  openFile: (
    projectId: Id<"projects">,
    fileId: Id<"files">,
    options: { pinned: boolean }
  ) => void;

  closeTab: (
    projectId: Id<"projects">,
    fileId: Id<"files">
  ) => void;

  closeAllTabs: (projectId: Id<"projects">) => void;

  setActiveTab: (
    projectId: Id<"projects">,
    fileId: Id<"files">
  ) => void;

}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  tabs: new Map(),

  getTabState: (projectId) => {
    return get().tabs.get(projectId) ?? defaultTabState;
  },

  openFile: (projectId, fileId, { pinned }) => {
    const tabs = new Map(get().tabs);
    console.log("tabs",tabs);
    console.log("Pinned",pinned);
    const state = tabs.get(projectId) ?? defaultTabState;
     console.log("state",state);
     
    const { openTabs, previewTabId } = state;
    console.log("openTab",openTabs);
    console.log("previwTabId",previewTabId);
    const isOpen = openTabs.includes(fileId);
    console.log("isopen",isOpen);
    // Case 1: Open as preview
    if (!isOpen && !pinned) {
      const newTabs = previewTabId
        ? openTabs.map((id) =>{
          console.log("id",id);
          return  id === previewTabId ? fileId : id
        }
           
          )
        : [...openTabs, fileId];
     console.log("newTabs",newTabs);
      tabs.set(projectId, {
        openTabs: newTabs,
        activeTabId: fileId,
        previewTabId: fileId,
      });
     console.log("tabs",tabs);
      set({ tabs });
      return;
    }

    // Case 2: Open as pinned
    if (!isOpen && pinned) {
      console.log("sujitkkr");
      tabs.set(projectId, {
        ...state,
        openTabs: [...openTabs, fileId],
        activeTabId: fileId,
      });

      set({ tabs });
      return;
    }

    // Case 3: Already open
    const shouldPin =
      pinned && previewTabId === fileId;
      console.log("PINNED",pinned);
      console.log("PreviewTabId",previewTabId);
      console.log("fileID",fileId);
   console.log("shouldPIn",shouldPin);
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
      previewTabId: shouldPin ? null : previewTabId,
    });
  console.log("TABS",tabs);
    set({ tabs });
  },

  closeTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state = tabs.get(projectId) ?? defaultTabState;
  console.log("state",state);
  console.log("fileId",fileId);
  
    const {
      openTabs,
      activeTabId,
      previewTabId,
    } = state;

    const tabIndex = openTabs.indexOf(fileId);
   console.log("tabIndex",tabIndex);
    if (tabIndex === -1) {
      return;
    }

    const newTabs = openTabs.filter(
      (id) => id !== fileId
    );
  console.log("previewId",previewTabId)
    console.log("newtab",newTabs);
    console.log("newtablength",newTabs.length);
    let newActiveTabId = activeTabId;
     console.log("actitabId",activeTabId);
     console.log("fileId",fileId);
    if (activeTabId === fileId) {
      if (newTabs.length === 0) {
        console.log("newactiveId");
        newActiveTabId = null;
      } else if (tabIndex >= newTabs.length) {
        console.log("limku");
        newActiveTabId =
          newTabs[newTabs.length - 1];
      } else {
        console.log("hellosasdsd");
        newActiveTabId = newTabs[tabIndex];
        console.log("newActiveTabId",activeTabId);
        
      }
    }

    tabs.set(projectId, {
      openTabs: newTabs,
      activeTabId: newActiveTabId,
      previewTabId:
        previewTabId === fileId
          ? null
          : previewTabId,
    });
    console.log("tabssujit",tabs);
    set({ tabs });
  },

  closeAllTabs: (projectId) => {
    const tabs = new Map(get().tabs);

    tabs.set(projectId, {
      ...defaultTabState,
    });

    set({ tabs });
  },

  setActiveTab: (projectId, fileId) => {
    const tabs = new Map(get().tabs);
    const state =
      tabs.get(projectId) ?? defaultTabState;
  console.log("State",state);
    tabs.set(projectId, {
      ...state,
      activeTabId: fileId,
    });
console.log("TAbs",tabs);
    set({ tabs });
  },
}));