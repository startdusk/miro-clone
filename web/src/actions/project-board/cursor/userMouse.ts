import { yjsDocStore } from "../../../store/yjsDoc";
export function useShareUserCursor(userData: any) {
  const trackMousePosition = (event: MouseEvent) => {
    const userName = userData?.user?.name;
    yjsDocStore.mousePosition.x = event.clientX;
    yjsDocStore.mousePosition.y = event.clientY;
    yjsDocStore.mousePosition.username = userName as string;

    yjsDocStore.yMapMouse.set("x", event.clientX);
    yjsDocStore.yMapMouse.set("y", event.clientY);
    yjsDocStore.yMapMouse.set("username", userName);
  }

  return {
    trackMousePosition,
  };
}
