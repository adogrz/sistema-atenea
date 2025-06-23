import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <div className="flex items-center gap-2">
            <AppLogoIcon className="size-15 fill-current text-sidebar-primary" />
            <span className="ml-2 truncate text-sm leading-tight font-semibold">Sistema Atenea</span>
        </div>
    );
}
