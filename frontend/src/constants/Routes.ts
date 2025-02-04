export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PASSWORD_RESET: '/passwordReset',
    DASHBOARD: {
        ROOT: "/dashboard",
        TOMORROW: `/dashboard/tomorrow`,
        NEXT_7_DAYS: "/dashboard/next7Days"
    },
    RESUME: (id: string) => `/resumes/${id}`,
    CREATE_RESUME: (id: string) => `/resumes/${id}/create`,
    WORK_EXPERIENCE: 'work-experience'

}