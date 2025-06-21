import { LayoutWrapper } from "@/layouts/LayoutWrapper";
import DashboardGrid from "@/pages/dashboard/components/DashboardGrid";

export default function Dashboard() {

  return <LayoutWrapper>
    <DashboardGrid
      layout={[]}
      onLayoutChange={() => { }}
      isDragging={false}
      setIsDragging={() => { }}
      onAddWidget={() => { }}
    /></LayoutWrapper >;
}
