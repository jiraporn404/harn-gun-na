import { Expense, generatePastelColor, Person } from "./useExpenses";
import { useLocalStorage } from "./useLocalStorage";

interface Group {
  id: string;
  name: string;
  people: Person[];
  expenses: Expense[];
  color: string;
}

interface AppData {
  activeGroupId: string;
  groups: Record<string, Group>;
}

export function useGroups() {
  const [appData, setAppData] = useLocalStorage<AppData>("app-data", {
    activeGroupId: "",
    groups: {},
  });

  const setActiveGroup = (groupId: string) => {
    setAppData((prev) => ({ ...prev, activeGroupId: groupId }));
  };

  const createGroup = (name: string) => {
    const id = crypto.randomUUID();
    const newGroup: Group = {
      id,
      name,
      people: [],
      expenses: [],
      color: generatePastelColor(),
    };
    setAppData((prev) => ({
      ...prev,
      activeGroupId: id,
      groups: { ...prev.groups, [id]: newGroup },
    }));
  };

  const deleteGroup = (groupId: string) => {
    setAppData((prev) => ({
      ...prev,
      groups: Object.fromEntries(
        Object.entries(prev.groups).filter(([key]) => key !== groupId)
      ),
    }));
  };

  const updateCurrentGroup = (updateFn: (group: Group) => Group) => {
    setAppData((prev) => {
      const currentGroup = prev.groups[prev.activeGroupId];
      if (!currentGroup) return prev; // กรณี activeGroupId ไม่ถูกต้อง

      const updatedGroup = updateFn(currentGroup);

      // ตรวจสอบว่า id ยังอยู่
      if (!updatedGroup.id) {
        updatedGroup.id = prev.activeGroupId;
      }

      return {
        ...prev,
        groups: {
          ...prev.groups,
          [prev.activeGroupId]: updatedGroup,
        },
      };
    });
  };

  const currentGroup = appData.groups[appData.activeGroupId];

  return {
    groups: appData.groups,
    activeGroupId: appData.activeGroupId,
    setActiveGroup,
    createGroup,
    currentGroup,
    deleteGroup,
    updateCurrentGroup,
  };
}
