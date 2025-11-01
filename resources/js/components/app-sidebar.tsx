import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, router } from '@inertiajs/react';
import { BookOpen, FileText, Folder, LayoutGrid, Users, Images, GraduationCap, BookOpenCheck, UserCheck } from 'lucide-react';
import AppLogo from './app-logo';
import blogs from '@/routes/blogs';
import BlogController from '@/actions/App/Http/Controllers/BlogController';
import TrainerController from '@/actions/App/Http/Controllers/TrainerController';
import GalleryController from '@/actions/App/Http/Controllers/GalleryController';
import ProgramController from '@/actions/App/Http/Controllers/ProgramController';
import CourseController from '@/actions/App/Http/Controllers/CourseController';
import EnrollmentController from '@/actions/App/Http/Controllers/EnrollmentController';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Blogs',
        href: BlogController.index(),
        icon: FileText
    },
    {
        title: 'Trainers',
        href: TrainerController.index(),
        icon: Users
    },
    {
        title: 'Galleries',
        href: GalleryController.index(),
        icon: Images
    },
    {
        title: 'Programs',
        href: ProgramController.index(),
        icon: GraduationCap
    },
    {
        title: 'Courses',
        href: CourseController.index(),
        icon: BookOpenCheck
    },
    {
        title: 'Enrollments',
        href: EnrollmentController.index(),
        icon: UserCheck
    }
];

const footerNavItems: NavItem[] = [
    /* {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    }, */
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
