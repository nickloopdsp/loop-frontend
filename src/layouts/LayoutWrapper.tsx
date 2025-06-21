
import AppLayoutTopBar from "./AppLayoutTopBar";

export interface ILayoutWrapperProps extends React.PropsWithChildren {
    Header?: React.ElementType;
}

export const LayoutWrapper = ({ children, Header, }: ILayoutWrapperProps) => {
    return (
        <>
            {Header ? <Header /> : <AppLayoutTopBar onOpenChat={() => { }} />}
            <main className="flex-1 overflow-auto p-6 w-full">
                {children}
            </main>
        </>
    )
}